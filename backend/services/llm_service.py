import json
import re
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from config import get_settings
from utils.structured_logging import LatencyTracker, get_logger

logger = get_logger(__name__)


class LLMServiceError(Exception):
    pass


class LLMService:
    """OpenAI LLM wrapper — no mock responses."""

    def __init__(self):
        settings = get_settings()
        if not settings.openai_api_key:
            raise RuntimeError(
                "OPENAI_API_KEY is required. Configure it in backend/.env before starting."
            )
        self.llm = ChatOpenAI(
            model=settings.llm_model,
            openai_api_key=settings.openai_api_key,
            temperature=settings.llm_temperature,
            max_retries=settings.llm_max_retries,
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
            raise LLMServiceError(f"LLM returned invalid JSON: {text[:200]}")

    async def generate(self, prompt: str, system: str = "You are a helpful AI assistant.") -> str:
        with LatencyTracker(logger, "llm_generate"):
            messages = [SystemMessage(content=system), HumanMessage(content=prompt)]
            response = await self.llm.ainvoke(messages)
            content = (response.content or "").strip()
            if not content:
                raise LLMServiceError("LLM returned empty response")
            return content

    async def generate_json(
        self,
        prompt: str,
        system: str = "You are a helpful AI assistant. Always respond with valid JSON.",
    ) -> dict | list:
        text = await self.generate(prompt, system)
        try:
            return self._parse_json(text)
        except (json.JSONDecodeError, LLMServiceError) as exc:
            logger.error("llm_json_parse_failed", extra={"error": str(exc)})
            raise LLMServiceError(f"Failed to parse LLM JSON: {exc}") from exc

    async def generate_json_safe(self, prompt: str, system: str, fallback: dict | list) -> dict | list:
        try:
            return await self.generate_json(prompt, system)
        except LLMServiceError:
            logger.error("llm_json_using_computed_fallback")
            return fallback
