import io
import tempfile
from abc import ABC, abstractmethod

from utils.structured_logging import LatencyTracker, get_logger

logger = get_logger(__name__)


class STTService(ABC):
    @abstractmethod
    async def transcribe(self, audio_data: bytes, filename: str = "audio.webm") -> str:
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass


class FasterWhisperSTT(STTService):
    """Default STT using faster-whisper (local, no API key required)."""

    def __init__(self, model_size: str = "base"):
        from faster_whisper import WhisperModel
        self.model = WhisperModel(model_size, device="cpu", compute_type="int8")
        self._provider = "faster-whisper"

    @property
    def provider_name(self) -> str:
        return self._provider

    async def transcribe(self, audio_data: bytes, filename: str = "audio.webm") -> str:
        with LatencyTracker(logger, "stt_transcribe", provider=self._provider):
            suffix = "." + filename.split(".")[-1] if "." in filename else ".webm"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
                tmp.write(audio_data)
                tmp.flush()
                segments, _ = self.model.transcribe(tmp.name, beam_size=5, language="en")
                text = " ".join(seg.text.strip() for seg in segments).strip()
            if not text:
                raise RuntimeError("Speech recognition returned empty transcription")
            return text


class OpenAISTT(STTService):
    """Fallback STT using OpenAI Whisper API."""

    def __init__(self):
        from openai import AsyncOpenAI
        from config import get_settings
        settings = get_settings()
        if not settings.openai_api_key:
            raise RuntimeError("OpenAI API key required for OpenAI STT fallback")
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._provider = "openai-whisper"

    @property
    def provider_name(self) -> str:
        return self._provider

    async def transcribe(self, audio_data: bytes, filename: str = "audio.webm") -> str:
        with LatencyTracker(logger, "stt_transcribe", provider=self._provider):
            audio_file = io.BytesIO(audio_data)
            audio_file.name = filename
            response = await self.client.audio.transcriptions.create(
                model="whisper-1", file=audio_file, response_format="text"
            )
            text = response if isinstance(response, str) else str(response)
            text = text.strip()
            if not text:
                raise RuntimeError("OpenAI STT returned empty transcription")
            return text
