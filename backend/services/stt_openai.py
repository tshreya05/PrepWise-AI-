import io
from openai import AsyncOpenAI

from config import get_settings
from services.stt_service import STTService
from utils.logging_config import get_logger

logger = get_logger(__name__)


class OpenAISTTService(STTService):
    def __init__(self):
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = "whisper-1"

    async def transcribe(self, audio_data: bytes, filename: str = "audio.webm") -> str:
        audio_file = io.BytesIO(audio_data)
        audio_file.name = filename
        response = await self.client.audio.transcriptions.create(
            model=self.model,
            file=audio_file,
            response_format="text",
        )
        text = response if isinstance(response, str) else str(response)
        logger.info("STT transcription completed: %d chars", len(text))
        return text.strip()


class MockSTTService(STTService):
    """Fallback STT for development without API key."""

    async def transcribe(self, audio_data: bytes, filename: str = "audio.webm") -> str:
        logger.warning("Using mock STT - no OpenAI API key configured")
        return "This is a mock transcription for development purposes."
