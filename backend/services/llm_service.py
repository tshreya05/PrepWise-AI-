import json
import re
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

from config import get_settings
from utils.logging_config import get_logger

logger = get_logger(__name__)


class LLMService:
    def __init__(self):
        settings = get_settings()
        self.llm = ChatOpenAI(
            model=settings.llm_model,
            openai_api_key=settings.openai_api_key or "not-set",
            temperature=0.7,
        )

    def _parse_json(self, text: str) -> dict | list:
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"[\[{].*[\]}]", text, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise

    async def generate(self, prompt: str, system: str = "You are a helpful AI assistant.") -> str:
        settings = get_settings()
        if not settings.openai_api_key:
            return self._mock_response(prompt)
        messages = [
            SystemMessage(content=system),
            HumanMessage(content=prompt),
        ]
        response = await self.llm.ainvoke(messages)
        return response.content.strip()

    async def generate_json(self, prompt: str, system: str = "You are a helpful AI assistant. Always respond with valid JSON.") -> dict | list:
        text = await self.generate(prompt, system)
        try:
            return self._parse_json(text)
        except (json.JSONDecodeError, ValueError) as e:
            logger.error("Failed to parse LLM JSON response: %s", e)
            return {}

    def _mock_response(self, prompt: str) -> str:
        if "interview question" in prompt.lower() or "generate the next" in prompt.lower():
            return "Can you walk me through a challenging technical problem you solved recently and explain your approach?"
        if "evaluate" in prompt.lower():
            return json.dumps({
                "technical_accuracy": 72.0,
                "communication": 78.0,
                "confidence": 70.0,
                "completeness": 65.0,
                "feedback": "Good effort. Your answer showed understanding of core concepts but could benefit from more specific examples and measurable outcomes.",
                "ideal_answer": "A strong answer would include the specific problem context, your systematic approach, technologies used, challenges faced, and quantifiable results achieved.",
                "suggested_difficulty_change": 0,
            })
        if "final report" in prompt.lower():
            return json.dumps({
                "overall_score": 74.0,
                "strengths": ["Clear communication", "Good technical foundation", "Relevant project experience"],
                "weaknesses": ["Needs more depth in system design", "Could improve STAR method responses"],
                "topics_to_improve": ["System Design", "Behavioral storytelling", "Cloud architecture"],
                "learning_recommendations": ["Practice system design interviews", "Study distributed systems patterns", "Prepare STAR format stories"],
            })
        if "resume" in prompt.lower() and "analyze" in prompt.lower():
            return json.dumps({
                "missing_keywords": ["Kubernetes", "CI/CD", "Microservices"],
                "weak_bullet_points": ["Generic bullet about teamwork - add specific outcomes"],
                "grammar_suggestions": ["Use consistent past tense for previous roles"],
                "missing_measurable_impact": ["Project description lacks metrics like performance improvement %"],
                "missing_links": ["GitHub profile", "Portfolio website"],
                "overall_score": 68.0,
                "summary": "Resume has a solid foundation but needs more quantified achievements and JD-aligned keywords.",
            })
        if "learning cards" in prompt.lower():
            return json.dumps([
                {
                    "topic": "System Design Fundamentals",
                    "reason": "Critical for senior technical roles and appeared weak in your interview",
                    "estimated_time": "3 weeks",
                    "resources": [{"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "guide"}],
                    "quiz": [{"question": "What is horizontal scaling?", "options": ["Adding more servers", "Adding more RAM", "Using faster CPU", "Compressing data"], "correct": 0}],
                }
            ])
        if "multiple choice" in prompt.lower():
            return json.dumps([
                {
                    "question": "What is the time complexity of binary search?",
                    "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
                    "correct_index": 1,
                    "explanation": "Binary search halves the search space each iteration, giving O(log n) complexity.",
                }
            ])
        return "Mock LLM response for development."
