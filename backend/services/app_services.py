import base64
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from config import get_settings
from database.models import Resume, JobDescription, Interview, InterviewQuestion
from evaluation.pipeline import (
    InterviewEvaluator,
    KnowledgeBaseEvaluator,
    PerformanceTracker,
    PromptEvaluator,
    QuizEvaluator,
    RetrievalEvaluator,
)
from prompts.interview import INTERVIEW_TYPES
from rag.context_builder import PromptBuilder
from rag.retriever import RAGRetriever
from services.llm_service import LLMService, LLMServiceError
from services.speech_factory import get_stt_service, get_tts_service
from utils.file_parser import extract_text_from_file, parse_resume_sections
from utils.structured_logging import get_logger, trace_id_var

logger = get_logger(__name__)


def _extract_role(jd_text: str) -> str:
    """Extract target role from job description when possible."""
    for line in jd_text.split("\n")[:20]:
        lower = line.lower()
        if any(k in lower for k in ("title:", "role:", "position:")):
            return line.split(":", 1)[-1].strip()[:120]
    return ""


class ResumeService:
    def __init__(self, db: Session):
        self.db = db
        self.rag = RAGRetriever()
        self.llm = LLMService()
        self.kb_eval = KnowledgeBaseEvaluator()

    async def upload_resume(self, user_id: int, file: UploadFile) -> Resume:
        settings = get_settings()
        suffix = Path(file.filename or "resume.pdf").suffix.lower()
        if suffix not in (".pdf", ".docx"):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

        user_dir = Path(settings.upload_dir) / str(user_id)
        user_dir.mkdir(parents=True, exist_ok=True)
        file_path = user_dir / f"resume_{uuid.uuid4()}{suffix}"

        content = await file.read()
        file_path.write_bytes(content)
        raw_text = extract_text_from_file(str(file_path))
        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract text from resume")

        sections = parse_resume_sections(raw_text)
        existing = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        if existing:
            self.db.delete(existing)
            self.db.flush()

        resume = Resume(
            user_id=user_id,
            filename=file.filename or "resume",
            file_path=str(file_path),
            raw_text=raw_text,
            skills=sections["skills"],
            education=sections["education"],
            projects=sections["projects"],
            experience=sections["experience"],
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)
        self._reindex_rag(user_id)
        logger.info("resume_uploaded", extra={"user_id": user_id})
        return resume

    def _reindex_rag(self, user_id: int) -> None:
        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        jd = self.db.query(JobDescription).filter(JobDescription.user_id == user_id).first()
        role = _extract_role(jd.raw_text) if jd else ""
        count = self.rag.index_user_documents(
            user_id,
            resume.raw_text if resume else "",
            jd.raw_text if jd else "",
            role=role,
        )
        self.kb_eval.evaluate(self.rag.get_user_stats(user_id))

    async def analyze_resume(self, user_id: int) -> dict:
        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="No resume found")
        jd = self.db.query(JobDescription).filter(JobDescription.user_id == user_id).first()
        role = _extract_role(jd.raw_text) if jd else ""
        retrieval = self.rag.retrieve(user_id, "resume analysis keywords gaps", role=role)
        bundle = PromptBuilder.build_resume_analysis(
            resume.raw_text, jd.raw_text if jd else "", retrieval
        )
        try:
            analysis = await self.llm.generate_json(bundle.prompt, bundle.system)
        except LLMServiceError as exc:
            raise HTTPException(status_code=503, detail=f"Resume analysis failed: {exc}") from exc
        resume.analysis = analysis
        self.db.commit()
        return analysis


class JobDescriptionService:
    def __init__(self, db: Session):
        self.db = db
        self.rag = RAGRetriever()

    async def upload_jd(self, user_id: int, file: UploadFile | None = None, text: str | None = None) -> JobDescription:
        settings = get_settings()
        raw_text = ""
        filename = None
        file_path = None

        if file:
            suffix = Path(file.filename or "jd.pdf").suffix.lower()
            if suffix != ".pdf":
                raise HTTPException(status_code=400, detail="Only PDF files are supported for JD upload")
            user_dir = Path(settings.upload_dir) / str(user_id)
            user_dir.mkdir(parents=True, exist_ok=True)
            file_path = user_dir / f"jd_{uuid.uuid4()}{suffix}"
            content = await file.read()
            file_path.write_bytes(content)
            raw_text = extract_text_from_file(str(file_path))
            filename = file.filename
        elif text:
            raw_text = text.strip()
        else:
            raise HTTPException(status_code=400, detail="Provide either a file or text")

        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract job description text")

        existing = self.db.query(JobDescription).filter(JobDescription.user_id == user_id).first()
        if existing:
            self.db.delete(existing)
            self.db.flush()

        jd = JobDescription(
            user_id=user_id,
            filename=filename,
            file_path=str(file_path) if file_path else None,
            raw_text=raw_text,
        )
        self.db.add(jd)
        self.db.commit()
        self.db.refresh(jd)

        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        role = _extract_role(raw_text)
        self.rag.index_user_documents(
            user_id,
            resume.raw_text if resume else "",
            raw_text,
            role=role,
        )
        return jd


class InterviewService:
    def __init__(self, db: Session):
        self.db = db
        self.rag = RAGRetriever()
        self.llm = LLMService()
        self.tts = get_tts_service()
        self.stt = get_stt_service()
        self.retrieval_eval = RetrievalEvaluator()
        self.prompt_eval = PromptEvaluator()
        self.interview_eval = InterviewEvaluator()
        self.perf = PerformanceTracker()

    async def start_interview(self, user_id: int, interview_type: str) -> dict:
        if interview_type not in INTERVIEW_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid interview type. Choose from: {list(INTERVIEW_TYPES.keys())}",
            )

        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        if not resume:
            raise HTTPException(status_code=400, detail="Please upload a resume first")

        settings = get_settings()
        trace_id_var.set(f"interview-{user_id}-{int(datetime.now().timestamp())}")

        interview = Interview(
            user_id=user_id,
            interview_type=interview_type,
            status="in_progress",
            difficulty_level=2,
            total_questions=settings.default_total_questions,
        )
        self.db.add(interview)
        self.db.commit()
        self.db.refresh(interview)

        question = await self._generate_question(interview, [], [])
        audio_bytes, audio_format = await self.tts.synthesize(question)

        q_record = InterviewQuestion(
            interview_id=interview.id,
            question_index=0,
            question_text=question,
            difficulty=interview.difficulty_level,
        )
        self.db.add(q_record)
        interview.transcript = [{"role": "interviewer", "text": question}]
        self.db.commit()

        return {
            "interview_id": interview.id,
            "question": question,
            "question_index": 0,
            "total_questions": interview.total_questions,
            "audio_base64": base64.b64encode(audio_bytes).decode("utf-8"),
            "audio_format": audio_format,
        }

    async def _generate_question(
        self, interview: Interview, history: list[dict], previous_questions: list[str]
    ) -> str:
        resume = self.db.query(Resume).filter(Resume.user_id == interview.user_id).first()
        jd = self.db.query(JobDescription).filter(JobDescription.user_id == interview.user_id).first()
        role = _extract_role(jd.raw_text) if jd else ""

        query = f"{interview.interview_type} interview question"
        if resume and resume.skills:
            query += f" skills: {', '.join(resume.skills[:10])}"

        retrieval = self.rag.retrieve(
            user_id=interview.user_id,
            query=query,
            interview_type=interview.interview_type,
            role=role,
            conversation_history=history,
            previous_questions=previous_questions,
            difficulty=interview.difficulty_level,
        )
        self.retrieval_eval.evaluate(retrieval.to_log_dict())

        bundle = PromptBuilder.build_question_prompt(
            interview.interview_type,
            retrieval,
            history,
            interview.difficulty_level,
            role=role,
            previous_questions=previous_questions,
        )
        self.prompt_eval.evaluate(bundle.variables)

        try:
            question = await self.llm.generate(bundle.prompt, bundle.system)
        except LLMServiceError as exc:
            raise HTTPException(status_code=503, detail=f"Question generation failed: {exc}") from exc

        if question in previous_questions:
            raise HTTPException(status_code=500, detail="Generated duplicate question — retry interview step")
        return question

    async def submit_answer(
        self, user_id: int, interview_id: int, audio_data: bytes
    ) -> dict:
        if not audio_data:
            raise HTTPException(status_code=400, detail="Voice answer required — upload audio recording")

        interview = self.db.query(Interview).filter(
            Interview.id == interview_id, Interview.user_id == user_id
        ).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        if interview.status != "in_progress":
            raise HTTPException(status_code=400, detail="Interview already completed")

        answer_text = await self.stt.transcribe(audio_data)
        if not answer_text.strip():
            raise HTTPException(status_code=400, detail="Could not transcribe audio — please speak clearly and retry")

        current_q = self.db.query(InterviewQuestion).filter(
            InterviewQuestion.interview_id == interview_id,
            InterviewQuestion.question_index == interview.current_question_index,
        ).first()
        if not current_q:
            raise HTTPException(status_code=400, detail="No active question")

        jd = self.db.query(JobDescription).filter(JobDescription.user_id == user_id).first()
        role = _extract_role(jd.raw_text) if jd else ""

        retrieval = self.rag.retrieve(
            user_id=user_id,
            query=current_q.question_text,
            interview_type=interview.interview_type,
            role=role,
        )

        prior_evals = [
            {
                "technical_accuracy": q.technical_accuracy,
                "communication": q.communication,
            }
            for q in self.db.query(InterviewQuestion).filter(
                InterviewQuestion.interview_id == interview_id,
                InterviewQuestion.answer_text.isnot(None),
            )
        ]

        bundle = PromptBuilder.build_evaluation_prompt(
            interview.interview_type,
            current_q.question_text,
            answer_text,
            retrieval,
            prior_evals,
        )

        try:
            evaluation = await self.llm.generate_json(bundle.prompt, bundle.system)
        except LLMServiceError as exc:
            raise HTTPException(status_code=503, detail=f"Answer evaluation failed: {exc}") from exc

        settings = get_settings()
        current_q.answer_text = answer_text
        current_q.technical_accuracy = float(evaluation["technical_accuracy"])
        current_q.communication = float(evaluation["communication"])
        current_q.confidence = float(evaluation["confidence"])
        current_q.completeness = float(evaluation["completeness"])
        current_q.feedback = evaluation.get("feedback", "")
        current_q.ideal_answer = evaluation.get("ideal_answer", "")

        transcript = interview.transcript or []
        transcript.append({"role": "candidate", "text": answer_text})
        interview.transcript = transcript

        difficulty_change = int(evaluation.get("suggested_difficulty_change", 0))
        interview.difficulty_level = max(
            settings.min_difficulty,
            min(settings.max_difficulty, interview.difficulty_level + difficulty_change),
        )

        is_last = interview.current_question_index >= interview.total_questions - 1
        result = {
            "interview_id": interview.id,
            "evaluation": {
                "technical_accuracy": current_q.technical_accuracy,
                "communication": current_q.communication,
                "confidence": current_q.confidence,
                "completeness": current_q.completeness,
            },
            "feedback": current_q.feedback,
            "ideal_answer": current_q.ideal_answer,
            "transcribed_answer": answer_text,
            "is_complete": is_last,
            "total_questions": interview.total_questions,
        }

        if is_last:
            await self._finalize_interview(interview)
        else:
            interview.current_question_index += 1
            history = [
                {"question": q.question_text, "answer": q.answer_text or ""}
                for q in self.db.query(InterviewQuestion).filter(
                    InterviewQuestion.interview_id == interview_id
                ).order_by(InterviewQuestion.question_index)
            ]
            prev_questions = [q.question_text for q in self.db.query(InterviewQuestion).filter(
                InterviewQuestion.interview_id == interview_id
            ).order_by(InterviewQuestion.question_index)]

            next_q = await self._generate_question(interview, history, prev_questions)
            audio_bytes, audio_format = await self.tts.synthesize(next_q)
            result["next_question"] = next_q
            result["next_audio_base64"] = base64.b64encode(audio_bytes).decode("utf-8")
            result["question_index"] = interview.current_question_index

            q_record = InterviewQuestion(
                interview_id=interview.id,
                question_index=interview.current_question_index,
                question_text=next_q,
                difficulty=interview.difficulty_level,
            )
            self.db.add(q_record)
            transcript.append({"role": "interviewer", "text": next_q})
            interview.transcript = transcript

        self.db.commit()
        return result

    async def _finalize_interview(self, interview: Interview) -> None:
        questions = self.db.query(InterviewQuestion).filter(
            InterviewQuestion.interview_id == interview.id
        ).order_by(InterviewQuestion.question_index).all()

        qa_pairs = "\n".join(
            f"Q{i+1}: {q.question_text}\nA: {q.answer_text or 'No answer'}"
            for i, q in enumerate(questions)
        )
        scores = "\n".join(
            f"Q{i+1}: Tech={q.technical_accuracy}, Comm={q.communication}, Conf={q.confidence}, Complete={q.completeness}"
            for i, q in enumerate(questions) if q.answer_text
        )

        bundle = PromptBuilder.build_final_report(interview.interview_type, qa_pairs, scores)
        report = await self.llm.generate_json(bundle.prompt, bundle.system)

        interview.overall_score = float(report["overall_score"])
        interview.strengths = report.get("strengths", [])
        interview.weaknesses = report.get("weaknesses", [])
        interview.topics_to_improve = report.get("topics_to_improve", [])
        interview.learning_recommendations = report.get("learning_recommendations", [])
        interview.report = report
        interview.status = "completed"
        interview.completed_at = datetime.now(timezone.utc)

        self.interview_eval.evaluate_session(
            [{"question_text": q.question_text} for q in questions],
            interview.interview_type,
            [q.difficulty for q in questions],
        )
        logger.info("interview_completed", extra={"interview_id": interview.id, "score": interview.overall_score})


class LearnService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = LLMService()
        self.rag = RAGRetriever()

    async def generate_learning_cards(self, user_id: int) -> list:
        from database.models import LearningCard

        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        interviews = self.db.query(Interview).filter(
            Interview.user_id == user_id, Interview.status == "completed"
        ).order_by(Interview.created_at.desc()).limit(3).all()

        weak_topics = list({t for iv in interviews for t in (iv.topics_to_improve or [])})[:10]
        skills = resume.skills if resume else []
        jd = self.db.query(JobDescription).filter(JobDescription.user_id == user_id).first()
        retrieval = self.rag.retrieve(user_id, "learning recommendations " + ", ".join(weak_topics[:5]))

        bundle = PromptBuilder.build_learning_cards(
            ", ".join(weak_topics) or "general technical skills",
            ", ".join(skills[:15]) or "not specified",
            jd.raw_text[:1000] if jd else "not specified",
            retrieval,
        )
        cards_data = await self.llm.generate_json(bundle.prompt, bundle.system)
        if not isinstance(cards_data, list):
            raise HTTPException(status_code=500, detail="Invalid learning cards response from LLM")

        self.db.query(LearningCard).filter(LearningCard.user_id == user_id).delete()
        cards = []
        for data in cards_data[:5]:
            card = LearningCard(
                user_id=user_id,
                topic=data["topic"],
                reason=data["reason"],
                estimated_time=data.get("estimated_time", "2 weeks"),
                resources=data.get("resources", []),
                quiz=data.get("quiz", []),
            )
            self.db.add(card)
            cards.append(card)
        self.db.commit()
        for c in cards:
            self.db.refresh(c)
        return cards


class PracticeService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = LLMService()
        self.rag = RAGRetriever()
        self.quiz_eval = QuizEvaluator()

    async def generate_quiz(
        self, user_id: int, topic: str, difficulty: str, num_questions: int = 5, quiz_type: str = "mcq"
    ) -> dict:
        from database.models import PracticeQuiz

        if difficulty not in ("easy", "medium", "hard"):
            raise HTTPException(status_code=400, detail="Difficulty must be easy, medium, or hard")

        retrieval = self.rag.retrieve(user_id, f"{topic} {quiz_type} quiz", interview_type="technical")
        bundle = PromptBuilder.build_quiz_prompt(topic, difficulty, num_questions, retrieval, quiz_type)

        questions = await self.llm.generate_json(bundle.prompt, bundle.system)
        if not isinstance(questions, list) or not questions:
            raise HTTPException(status_code=500, detail="Quiz generation failed")

        self.quiz_eval.evaluate(questions, topic, difficulty)

        quiz = PracticeQuiz(
            user_id=user_id,
            topic=topic,
            difficulty=difficulty,
            questions=questions,
        )
        self.db.add(quiz)
        self.db.commit()
        self.db.refresh(quiz)
        return quiz


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard(self, user_id: int) -> dict:
        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        jd = self.db.query(JobDescription).filter(JobDescription.user_id == user_id).first()
        total = self.db.query(Interview).filter(Interview.user_id == user_id).count()
        interviews = self.db.query(Interview).filter(Interview.user_id == user_id).order_by(
            Interview.created_at.desc()
        ).limit(10).all()

        scores = [iv.overall_score for iv in interviews if iv.overall_score is not None]
        avg_score = sum(scores) / len(scores) if scores else None

        return {
            "has_resume": resume is not None,
            "has_job_description": jd is not None,
            "resume": {
                "id": resume.id,
                "filename": resume.filename,
                "skills": resume.skills,
                "created_at": resume.created_at.isoformat(),
            } if resume else None,
            "job_description": {
                "id": jd.id,
                "filename": jd.filename,
                "preview": jd.raw_text[:200],
                "created_at": jd.created_at.isoformat(),
            } if jd else None,
            "interview_history": [
                {
                    "id": iv.id,
                    "interview_type": iv.interview_type,
                    "status": iv.status,
                    "overall_score": iv.overall_score,
                    "created_at": iv.created_at.isoformat(),
                }
                for iv in interviews
            ],
            "resume_analysis": resume.analysis if resume else None,
            "total_interviews": total,
            "average_score": round(avg_score, 1) if avg_score else None,
        }
