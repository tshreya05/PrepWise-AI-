import io
from openai import AsyncOpenAI

from config import get_settings
from services.tts_service import TTSService
from utils.logging_config import get_logger

logger = get_logger(__name__)


class OpenAITTSService(TTSService):
    def __init__(self):
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = "tts-1"
        self.voice = settings.tts_voice

    async def synthesize(self, text: str) -> tuple[bytes, str]:
        response = await self.client.audio.speech.create(
            model=self.model,
            voice=self.voice,
            input=text,
            response_format="mp3",
        )
        audio_bytes = response.content
        logger.info("TTS synthesis completed: %d bytes for %d chars", len(audio_bytes), len(text))
        return audio_bytes, "mp3"


class MockTTSService(TTSService):
    """Minimal valid MP3 silence for development without API key."""

    async def synthesize(self, text: str) -> tuple[bytes, str]:
        logger.warning("Using mock TTS - no OpenAI API key configured")
        # Minimal silent MP3 frame
        silent_mp3 = bytes([
            0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ])
        return silent_mp3, "mp3"
