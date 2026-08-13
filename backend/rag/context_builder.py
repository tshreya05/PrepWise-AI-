from dataclasses import dataclass
from typing import Any

from prompts.interview import (
    GENERATE_QUESTION_PROMPT,
    EVALUATE_ANSWER_PROMPT,
    PRACTICE_QUIZ_PROMPT,
    RESUME_ANALYSIS_PROMPT,
    FINAL_REPORT_PROMPT,
    LEARNING_CARDS_PROMPT,
    INTERVIEW_TYPES,
)
from rag.retriever import RetrievalContext
from utils.structured_logging import get_logger

logger = get_logger(__name__)


@dataclass
class PromptBundle:
    prompt: str
    system: str
    variables: dict[str, Any]
    missing_variables: list[str]


class PromptBuilder:
    """Build and validate prompts with required context variables."""

    REQUIRED_QUESTION_VARS = {"interview_type", "context", "history", "difficulty", "role", "previous_questions"}
    REQUIRED_EVAL_VARS = {"interview_type", "question", "answer", "context", "evaluation_history"}

    @staticmethod
    def build_question_prompt(
        interview_type: str,
        retrieval: RetrievalContext,
        history: list[dict],
        difficulty: int,
        role: str = "",
        previous_questions: list[str] | None = None,
    ) -> PromptBundle:
        history_text = "\n".join(
            f"Q: {h.get('question', '')}\nA: {h.get('answer', 'N/A')}" for h in history
        ) or "No previous questions yet."
        prev_q = "\n".join(f"- {q}" for q in (previous_questions or [])) or "None"

        context = retrieval.text
        if retrieval.fallback_used and not context:
            context = (
                "Retrieval returned insufficient context. "
                "Generate a role-appropriate question but note limited context availability."
            )

        variables = {
            "interview_type": INTERVIEW_TYPES.get(interview_type, interview_type),
            "context": context,
            "history": history_text,
            "difficulty": difficulty,
            "role": role or "Not specified",
            "previous_questions": prev_q,
        }
        missing = [v for v in PromptBuilder.REQUIRED_QUESTION_VARS if not variables.get(v) and v != "role"]

        prompt = GENERATE_QUESTION_PROMPT.format(**variables)
        logger.info("prompt_built", extra={"type": "question", "missing": missing, "context_len": len(context)})
        return PromptBundle(
            prompt=prompt,
            system="You are an expert interview coach. Ground every question in the provided context.",
            variables=variables,
            missing_variables=missing,
        )

    @staticmethod
    def build_evaluation_prompt(
        interview_type: str,
        question: str,
        answer: str,
        retrieval: RetrievalContext,
        evaluation_history: list[dict] | None = None,
    ) -> PromptBundle:
        eval_hist = evaluation_history or []
        hist_text = "\n".join(
            f"Q scores: tech={e.get('technical_accuracy')}, comm={e.get('communication')}"
            for e in eval_hist[-3:]
        ) or "None"
        variables = {
            "interview_type": INTERVIEW_TYPES.get(interview_type, interview_type),
            "question": question,
            "answer": answer,
            "context": retrieval.text or "Limited context available.",
            "evaluation_history": hist_text,
        }
        prompt = EVALUATE_ANSWER_PROMPT.format(**variables)
        return PromptBundle(
            prompt=prompt,
            system="You are an expert interview evaluator. Respond with valid JSON only.",
            variables=variables,
            missing_variables=[],
        )

    @staticmethod
    def build_quiz_prompt(
        topic: str,
        difficulty: str,
        num_questions: int,
        retrieval: RetrievalContext,
        quiz_type: str = "mcq",
    ) -> PromptBundle:
        context = retrieval.text or "Use general industry knowledge for the topic."
        prompt = PRACTICE_QUIZ_PROMPT.format(
            num_questions=num_questions,
            topic=topic,
            difficulty=difficulty,
            quiz_type=quiz_type,
            context=context,
        )
        return PromptBundle(
            prompt=prompt,
            system="Generate quiz questions grounded in the provided context. Respond with valid JSON array.",
            variables={"topic": topic, "difficulty": difficulty, "context": context},
            missing_variables=[],
        )

    @staticmethod
    def build_resume_analysis(resume: str, jd: str, retrieval: RetrievalContext) -> PromptBundle:
        prompt = RESUME_ANALYSIS_PROMPT.format(
            resume=resume[:4000],
            jd=jd[:2000] if jd else "Not provided",
            kb_context=retrieval.text[:1500],
        )
        return PromptBundle(prompt=prompt, system="Respond with valid JSON.", variables={}, missing_variables=[])

    @staticmethod
    def build_final_report(interview_type: str, qa_pairs: str, scores: str) -> PromptBundle:
        prompt = FINAL_REPORT_PROMPT.format(
            interview_type=INTERVIEW_TYPES.get(interview_type, interview_type),
            qa_pairs=qa_pairs,
            scores=scores,
        )
        return PromptBundle(prompt=prompt, system="Respond with valid JSON.", variables={}, missing_variables=[])

    @staticmethod
    def build_learning_cards(weak_topics: str, skills: str, jd_snippet: str, retrieval: RetrievalContext) -> PromptBundle:
        prompt = LEARNING_CARDS_PROMPT.format(
            weak_topics=weak_topics,
            skills=skills,
            jd_snippet=jd_snippet,
            kb_context=retrieval.text[:1500],
        )
        return PromptBundle(prompt=prompt, system="Respond with valid JSON array.", variables={}, missing_variables=[])
