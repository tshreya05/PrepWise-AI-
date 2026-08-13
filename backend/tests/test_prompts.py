from rag.context_builder import PromptBuilder
from rag.retriever import RetrievalContext
from evaluation.pipeline import PromptEvaluator


def test_prompt_builder_includes_required_variables():
    retrieval = RetrievalContext(
        chunks=[{"content": "Python developer with FastAPI experience", "metadata": {"source": "resume"}, "score": 0.9}],
        query="technical interview",
    )
    bundle = PromptBuilder.build_question_prompt(
        interview_type="technical",
        retrieval=retrieval,
        history=[{"question": "Tell me about yourself", "answer": "I am a developer"}],
        difficulty=3,
        role="Backend Engineer",
        previous_questions=["Tell me about yourself"],
    )
    assert "Backend Engineer" in bundle.prompt
    assert "Python developer" in bundle.prompt
    assert "Tell me about yourself" in bundle.prompt

    evaluator = PromptEvaluator()
    result = evaluator.evaluate(bundle.variables)
    assert result["valid"] is True
    assert result["missing_variables"] == []


def test_prompt_evaluator_detects_missing():
    evaluator = PromptEvaluator()
    result = evaluator.evaluate({"interview_type": "technical"})
    assert result["valid"] is False
    assert len(result["missing_variables"]) > 0
