import json
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from config import get_settings
from utils.structured_logging import get_logger

logger = get_logger(__name__)


@dataclass
class EvaluationRecord:
    category: str
    metrics: dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    trace_id: str | None = None


class EvaluationStore:
    """Persist evaluation history for regression testing and audit."""

    def __init__(self):
        settings = get_settings()
        self.dir = Path(settings.evaluation_log_dir)
        self.dir.mkdir(parents=True, exist_ok=True)

    def save(self, record: EvaluationRecord) -> None:
        path = self.dir / f"{record.category}_{int(time.time() * 1000)}.json"
        path.write_text(json.dumps(asdict(record), indent=2, default=str), encoding="utf-8")


class KnowledgeBaseEvaluator:
    def evaluate(self, kb_stats: dict, chunk_sizes: list[int] | None = None) -> dict:
        sizes = chunk_sizes or []
        metrics = {
            "chunk_count": kb_stats.get("chunk_count", 0),
            "average_chunk_size": round(sum(sizes) / len(sizes), 1) if sizes else 0,
            "metadata_coverage": bool(kb_stats.get("sample_metadata")),
            "collection": kb_stats.get("collection"),
        }
        record = EvaluationRecord(category="knowledge_base", metrics=metrics)
        EvaluationStore().save(record)
        return metrics


class RetrievalEvaluator:
    def evaluate(self, retrieval_log: dict, latency_ms: float | None = None) -> dict:
        chunks = retrieval_log.get("chunk_count", 0)
        scores = retrieval_log.get("scores") or []
        metrics = {
            "chunk_count": chunks,
            "recall_at_k": chunks,
            "precision_at_k": len([s for s in scores if s and s >= 0.5]),
            "context_relevancy": round(sum(scores) / len(scores), 3) if scores else 0.0,
            "retrieval_latency_ms": latency_ms,
            "fallback_used": retrieval_log.get("fallback_used", False),
            "sources": retrieval_log.get("sources", []),
        }
        EvaluationStore().save(EvaluationRecord(category="retrieval", metrics=metrics))
        return metrics


class PromptEvaluator:
    REQUIRED = {"interview_type", "context", "history", "difficulty", "role", "previous_questions"}

    def evaluate(self, variables: dict[str, Any]) -> dict:
        missing = [k for k in self.REQUIRED if not variables.get(k) and k != "role"]
        metrics = {
            "missing_variables": missing,
            "has_resume_context": "resume" in str(variables.get("context", "")).lower(),
            "has_jd_context": "job_description" in str(variables.get("context", "")).lower(),
            "context_length": len(str(variables.get("context", ""))),
            "valid": len(missing) == 0,
        }
        EvaluationStore().save(EvaluationRecord(category="prompt", metrics=metrics))
        return metrics


class InterviewEvaluator:
    def evaluate_session(
        self,
        questions: list[dict],
        interview_type: str,
        difficulty_levels: list[int],
        role: str = "",
    ) -> dict:
        question_texts = [q.get("question_text", "") for q in questions]
        repeated = len(question_texts) != len(set(question_texts))
        metrics = {
            "question_count": len(questions),
            "repeated_questions": repeated,
            "interview_type": interview_type,
            "role": role,
            "difficulty_range": {
                "min": min(difficulty_levels) if difficulty_levels else 0,
                "max": max(difficulty_levels) if difficulty_levels else 0,
            },
            "topic_coverage": len(set(question_texts)),
        }
        EvaluationStore().save(EvaluationRecord(category="interview", metrics=metrics))
        return metrics


class QuizEvaluator:
    def evaluate(self, questions: list[dict], topic: str, difficulty: str) -> dict:
        valid = all(
            q.get("question") and q.get("options") and "correct_index" in q
            for q in questions
        )
        metrics = {
            "question_count": len(questions),
            "valid_structure": valid,
            "topic_match": topic,
            "difficulty": difficulty,
            "has_explanations": all(q.get("explanation") for q in questions),
            "has_knowledge_source": all(q.get("knowledge_source") for q in questions),
        }
        EvaluationStore().save(EvaluationRecord(category="quiz", metrics=metrics))
        return metrics


class SpeechEvaluator:
    def evaluate(self, stt_provider: str, tts_provider: str, stt_latency_ms: float, tts_latency_ms: float, fallback: bool = False) -> dict:
        metrics = {
            "stt_provider": stt_provider,
            "tts_provider": tts_provider,
            "stt_latency_ms": stt_latency_ms,
            "tts_latency_ms": tts_latency_ms,
            "fallback_used": fallback,
        }
        EvaluationStore().save(EvaluationRecord(category="speech", metrics=metrics))
        return metrics


class PerformanceTracker:
    """Track end-to-end pipeline latencies."""

    def __init__(self):
        self.timings: dict[str, float] = {}

    def mark(self, key: str, ms: float) -> None:
        self.timings[key] = ms

    def summary(self) -> dict:
        total = sum(self.timings.values())
        metrics = {**self.timings, "total_ms": round(total, 2)}
        EvaluationStore().save(EvaluationRecord(category="performance", metrics=metrics))
        return metrics
