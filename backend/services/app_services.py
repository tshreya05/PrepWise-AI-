import base64
import json
import uuid
from pathlib import Path
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile

from config import get_settings
from database.models import Resume, JobDescription, Interview, InterviewQuestion
from rag.retriever import RAGRetriever
from services.llm_service import LLMService
from services.speech_factory import get_tts_service, get_stt_service
from prompts.interview import (
    GENERATE_QUESTION_PROMPT,
    EVALUATE_ANSWER_PROMPT,
    FINAL_REPORT_PROMPT,
    INTERVIEW_TYPES,
)
from utils.file_parser import extract_text_from_file, parse_resume_sections
from utils.logging_config import get_logger

logger = get_logger(__name__)


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, email: str, full_name: str, password: str):
        from database.models import User
        from utils.jwt import get_password_hash

        existing = self.db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(email=email, full_name=full_name, hashed_password=get_password_hash(password))
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate(self, email: str, password: str):
        from database.models import User
        from utils.jwt import verify_password, create_access_token

        user = self.db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token({"sub": str(user.id), "email": user.email})
        return user, token


class ResumeService:
    def __init__(self, db: Session):
        self.db = db
        self.rag = RAGRetriever()
        self.llm = LLMService()

    async def upload_resume(self, user_id: int, file: UploadFile) -> Resume:
        settings = get_settings()
        suffix = Path(file.filename or "resume.pdf").suffix.lower()
        if suffix not in (".pdf", ".docx", ".doc"):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

        user_dir = Path(settings.upload_dir) / str(user_id)
        user_dir.mkdir(parents=True, exist_ok=True)
        file_id = str(uuid.uuid4())
        file_path = user_dir / f"resume_{file_id}{suffix}"

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
        logger.info("Resume uploaded for user %d", user_id)
        return resume

    def _reindex_rag(self, user_id: int):
        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        jd = self.db.query(JobDescription).filter(JobDescription.user_id == user_id).first()
        resume_text = resume.raw_text if resume else ""
        jd_text = jd.raw_text if jd else ""
        self.rag.index_user_documents(user_id, resume_text, jd_text)

    async def analyze_resume(self, user_id: int) -> dict:
        from prompts.interview import RESUME_ANALYSIS_PROMPT

        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="No resume found")
        jd = self.db.query(JobDescription).filter(JobDescription.user_id == user_id).first()
        prompt = RESUME_ANALYSIS_PROMPT.format(
            resume=resume.raw_text[:4000],
            jd=jd.raw_text[:2000] if jd else "Not provided",
        )
        analysis = await self.llm.generate_json(prompt)
        if not analysis:
            analysis = {
                "missing_keywords": [],
                "weak_bullet_points": [],
                "grammar_suggestions": [],
                "missing_measurable_impact": [],
                "missing_links": [],
                "overall_score": 0.0,
                "summary": "Analysis unavailable",
            }
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
            file_id = str(uuid.uuid4())
            file_path = user_dir / f"jd_{file_id}{suffix}"
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
        resume_text = resume.raw_text if resume else ""
        self.rag.index_user_documents(user_id, resume_text, raw_text)
        logger.info("Job description saved for user %d", user_id)
        return jd


class InterviewService:
    def __init__(self, db: Session):
        self.db = db
        self.rag = RAGRetriever()
        self.llm = LLMService()
        self.tts = get_tts_service()
        self.stt = get_stt_service()

    async def start_interview(self, user_id: int, interview_type: str) -> dict:
        if interview_type not in INTERVIEW_TYPES:
            raise HTTPException(status_code=400, detail=f"Invalid interview type. Choose from: {list(INTERVIEW_TYPES.keys())}")

        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        if not resume:
            raise HTTPException(status_code=400, detail="Please upload a resume first")

        interview = Interview(
            user_id=user_id,
            interview_type=interview_type,
            status="in_progress",
            difficulty_level=2,
            total_questions=5,
        )
        self.db.add(interview)
        self.db.commit()
        self.db.refresh(interview)

        question = await self._generate_question(interview, [])
        audio_bytes, audio_format = await self.tts.synthesize(question)
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

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
            "audio_base64": audio_b64,
            "audio_format": audio_format,
        }

    async def _generate_question(self, interview: Interview, history: list[dict]) -> str:
        resume = self.db.query(Resume).filter(Resume.user_id == interview.user_id).first()
        jd = self.db.query(JobDescription).filter(JobDescription.user_id == interview.user_id).first()

        query = f"{interview.interview_type} interview question"
        if resume:
            query += f" skills: {', '.join(resume.skills[:10])}"
        context_chunks = self.rag.retrieve(interview.user_id, query)
        if not context_chunks:
            context = (resume.raw_text[:2000] if resume else "") + "\n" + (jd.raw_text[:1000] if jd else "")
        else:
            context = "\n".join(context_chunks)

        history_text = "\n".join(
            f"Q: {h['question']}\nA: {h.get('answer', 'N/A')}" for h in history
        ) or "No previous questions yet."

        prompt = GENERATE_QUESTION_PROMPT.format(
            interview_type=INTERVIEW_TYPES[interview.interview_type],
            context=context[:3000],
            history=history_text,
            difficulty=interview.difficulty_level,
        )
        return await self.llm.generate(prompt)

    async def submit_answer(
        self, user_id: int, interview_id: int, answer_text: str | None = None, audio_data: bytes | None = None
    ) -> dict:
        interview = self.db.query(Interview).filter(
            Interview.id == interview_id, Interview.user_id == user_id
        ).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        if interview.status != "in_progress":
            raise HTTPException(status_code=400, detail="Interview already completed")

        if audio_data and not answer_text:
            answer_text = await self.stt.transcribe(audio_data)
        if not answer_text:
            raise HTTPException(status_code=400, detail="No answer provided")

        current_q = self.db.query(InterviewQuestion).filter(
            InterviewQuestion.interview_id == interview_id,
            InterviewQuestion.question_index == interview.current_question_index,
        ).first()
        if not current_q:
            raise HTTPException(status_code=400, detail="No active question")

        context_chunks = self.rag.retrieve(interview.user_id, current_q.question_text)
        context = "\n".join(context_chunks) if context_chunks else ""

        eval_prompt = EVALUATE_ANSWER_PROMPT.format(
            interview_type=INTERVIEW_TYPES[interview.interview_type],
            question=current_q.question_text,
            answer=answer_text,
            context=context[:2000],
        )
        evaluation = await self.llm.generate_json(eval_prompt)
        if not evaluation:
            evaluation = {
                "technical_accuracy": 70, "communication": 70,
                "confidence": 70, "completeness": 70,
                "feedback": "Answer recorded.", "ideal_answer": "N/A",
                "suggested_difficulty_change": 0,
            }

        current_q.answer_text = answer_text
        current_q.technical_accuracy = float(evaluation.get("technical_accuracy", 70))
        current_q.communication = float(evaluation.get("communication", 70))
        current_q.confidence = float(evaluation.get("confidence", 70))
        current_q.completeness = float(evaluation.get("completeness", 70))
        current_q.feedback = evaluation.get("feedback", "")
        current_q.ideal_answer = evaluation.get("ideal_answer", "")

        transcript = interview.transcript or []
        transcript.append({"role": "candidate", "text": answer_text})
        interview.transcript = transcript

        difficulty_change = int(evaluation.get("suggested_difficulty_change", 0))
        interview.difficulty_level = max(1, min(5, interview.difficulty_level + difficulty_change))

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
            result["is_complete"] = True
        else:
            interview.current_question_index += 1
            history = [
                {"question": q.question_text, "answer": q.answer_text or ""}
                for q in self.db.query(InterviewQuestion).filter(
                    InterviewQuestion.interview_id == interview_id
                ).order_by(InterviewQuestion.question_index)
            ]
            next_q = await self._generate_question(interview, history)
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

    async def _finalize_interview(self, interview: Interview):
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

        prompt = FINAL_REPORT_PROMPT.format(
            interview_type=INTERVIEW_TYPES[interview.interview_type],
            qa_pairs=qa_pairs,
            scores=scores,
        )
        report = await self.llm.generate_json(prompt)
        if not report:
            avg = sum(
                (q.technical_accuracy or 0) + (q.communication or 0) +
                (q.confidence or 0) + (q.completeness or 0)
                for q in questions if q.answer_text
            ) / max(1, len([q for q in questions if q.answer_text]) * 4)
            report = {
                "overall_score": avg,
                "strengths": ["Participated in full interview"],
                "weaknesses": ["Continue practicing"],
                "topics_to_improve": ["General interview skills"],
                "learning_recommendations": ["Review feedback for each question"],
            }

        interview.overall_score = float(report.get("overall_score", 0))
        interview.strengths = report.get("strengths", [])
        interview.weaknesses = report.get("weaknesses", [])
        interview.topics_to_improve = report.get("topics_to_improve", [])
        interview.learning_recommendations = report.get("learning_recommendations", [])
        interview.report = report
        interview.status = "completed"
        interview.completed_at = datetime.now(timezone.utc)
        logger.info("Interview %d completed with score %.1f", interview.id, interview.overall_score)


class LearnService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = LLMService()

    async def generate_learning_cards(self, user_id: int) -> list:
        from database.models import LearningCard
        from prompts.interview import LEARNING_CARDS_PROMPT

        resume = self.db.query(Resume).filter(Resume.user_id == user_id).first()
        interviews = self.db.query(Interview).filter(
            Interview.user_id == user_id, Interview.status == "completed"
        ).order_by(Interview.created_at.desc()).limit(3).all()

        weak_topics = []
        for iv in interviews:
            weak_topics.extend(iv.topics_to_improve or [])
        weak_topics = list(set(weak_topics))[:10]

        skills = resume.skills if resume else []
        jd = self.db.query(JobDescription).filter(JobDescription.user_id == user_id).first()

        prompt = LEARNING_CARDS_PROMPT.format(
            weak_topics=", ".join(weak_topics) or "general technical skills",
            skills=", ".join(skills[:15]) or "not specified",
            jd_snippet=jd.raw_text[:1000] if jd else "not specified",
        )
        cards_data = await self.llm.generate_json(prompt)
        if not isinstance(cards_data, list):
            cards_data = [cards_data] if cards_data else []

        self.db.query(LearningCard).filter(LearningCard.user_id == user_id).delete()
        cards = []
        for data in cards_data[:5]:
            card = LearningCard(
                user_id=user_id,
                topic=data.get("topic", "General"),
                reason=data.get("reason", ""),
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

    async def generate_quiz(self, user_id: int, topic: str, difficulty: str, num_questions: int = 5) -> dict:
        from database.models import PracticeQuiz
        from prompts.interview import PRACTICE_QUIZ_PROMPT

        if difficulty not in ("easy", "medium", "hard"):
            difficulty = "medium"

        prompt = PRACTICE_QUIZ_PROMPT.format(
            num_questions=num_questions,
            topic=topic,
            difficulty=difficulty,
        )
        questions = await self.llm.generate_json(prompt)
        if not isinstance(questions, list):
            questions = [questions] if questions else []

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
            "total_interviews": len(interviews),
            "average_score": round(avg_score, 1) if avg_score else None,
        }
