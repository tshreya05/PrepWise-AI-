import io
import subprocess
import tempfile
from abc import ABC, abstractmethod
from pathlib import Path

from config import get_settings
from utils.structured_logging import LatencyTracker, get_logger

logger = get_logger(__name__)


class TTSService(ABC):
    @abstractmethod
    async def synthesize(self, text: str) -> tuple[bytes, str]:
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass


class PiperTTS(TTSService):
    """Default TTS using Piper CLI."""

    def __init__(self):
        settings = get_settings()
        self.model_dir = Path(settings.piper_model_path)
        self.voice = settings.tts_voice
        self._provider = "piper"
        self._model_path = self._find_model()

    def _find_model(self) -> Path:
        candidates = list(self.model_dir.glob("*.onnx"))
        if not candidates:
            raise RuntimeError(
                f"No Piper model found in {self.model_dir}. "
                "Download a voice model (.onnx + .json) into backend/models/piper/"
            )
        for c in candidates:
            if self.voice in c.stem:
                return c
        return candidates[0]

    @property
    def provider_name(self) -> str:
        return self._provider

    async def synthesize(self, text: str) -> tuple[bytes, str]:
        with LatencyTracker(logger, "tts_synthesize", provider=self._provider):
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as out:
                out_path = out.name
            try:
                cmd = ["piper", "--model", str(self._model_path), "--output_file", out_path]
                proc = subprocess.run(
                    cmd,
                    input=text.encode("utf-8"),
                    capture_output=True,
                    timeout=30,
                )
                if proc.returncode != 0:
                    raise RuntimeError(f"Piper TTS failed: {proc.stderr.decode()[:200]}")
                audio_bytes = Path(out_path).read_bytes()
                return audio_bytes, "wav"
            finally:
                Path(out_path).unlink(missing_ok=True)


class CoquiTTS(TTSService):
    """Fallback TTS using Coqui TTS."""

    def __init__(self):
        settings = get_settings()
        from TTS.api import TTS
        self.tts = TTS(model_name=settings.coqui_model, progress_bar=False)
        self._provider = "coqui"

    @property
    def provider_name(self) -> str:
        return self._provider

    async def synthesize(self, text: str) -> tuple[bytes, str]:
        with LatencyTracker(logger, "tts_synthesize", provider=self._provider):
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as out:
                out_path = out.name
            try:
                self.tts.tts_to_file(text=text, file_path=out_path)
                return Path(out_path).read_bytes(), "wav"
            finally:
                Path(out_path).unlink(missing_ok=True)


class OpenAITTS(TTSService):
    """Fallback TTS using OpenAI speech API."""

    def __init__(self):
        from openai import AsyncOpenAI
        settings = get_settings()
        if not settings.openai_api_key:
            raise RuntimeError("OpenAI API key required for OpenAI TTS fallback")
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.voice = settings.tts_voice
        self._provider = "openai-tts"

    @property
    def provider_name(self) -> str:
        return self._provider

    async def synthesize(self, text: str) -> tuple[bytes, str]:
        with LatencyTracker(logger, "tts_synthesize", provider=self._provider):
            response = await self.client.audio.speech.create(
                model="tts-1", voice=self.voice, input=text, response_format="mp3"
            )
            return response.content, "mp3"
