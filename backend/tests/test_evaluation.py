from evaluation.pipeline import QuizEvaluator, RetrievalEvaluator, InterviewEvaluator


def test_quiz_evaluator_valid_structure():
    questions = [
        {
            "question": "What is O(n)?",
            "options": ["A", "B", "C", "D"],
            "correct_index": 0,
            "explanation": "Linear time",
            "knowledge_source": "DSA basics",
        }
    ]
    result = QuizEvaluator().evaluate(questions, "Algorithms", "easy")
    assert result["valid_structure"] is True
    assert result["has_explanations"] is True


def test_retrieval_evaluator_metrics():
    log = {"chunk_count": 4, "scores": [0.8, 0.7, 0.6, 0.5], "fallback_used": False, "sources": ["resume"]}
    result = RetrievalEvaluator().evaluate(log, latency_ms=45.2)
    assert result["chunk_count"] == 4
    assert result["precision_at_k"] == 4
    assert result["context_relevancy"] > 0.6


def test_interview_evaluator_detects_repeats():
    questions = [
        {"question_text": "What is REST?"},
        {"question_text": "What is REST?"},
    ]
    result = InterviewEvaluator().evaluate_session(questions, "technical", [2, 2])
    assert result["repeated_questions"] is True
