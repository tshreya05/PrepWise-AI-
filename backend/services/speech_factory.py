from config import get_settings
from services.stt_providers import FasterWhisperSTT, OpenAISTT, STTService
from services.tts_providers import CoquiTTS, OpenAITTS, PiperTTS, TTSService
from utils.structured_logging import get_logger

logger = get_logger(__name__)

_stt_instance: STTService | None = None
_tts_instance: TTSService | None = None


def _init_with_fallback(primary_factory, fallback_factory, label: str):
    try:
        service = primary_factory()
        logger.info(f"{label}_provider_initialized", extra={"provider": service.provider_name})
        return service
    except Exception as primary_exc:
        logger.warning(
            f"{label}_primary_failed",
            extra={"error": str(primary_exc)},
        )
        try:
            service = fallback_factory()
            logger.info(
                f"{label}_fallback_initialized",
                extra={"provider": service.provider_name, "fallback": True},
            )
            return service
        except Exception as fallback_exc:
            raise RuntimeError(
                f"Both {label} providers failed. Primary: {primary_exc}. Fallback: {fallback_exc}"
            ) from fallback_exc


def get_stt_service() -> STTService:
    global _stt_instance
    if _stt_instance is None:
        settings = get_settings()
        if settings.stt_provider == "openai":
            _stt_instance = _init_with_fallback(OpenAISTT, FasterWhisperSTT, "stt")
        else:
            _stt_instance = _init_with_fallback(
                lambda: FasterWhisperSTT(settings.faster_whisper_model),
                OpenAISTT,
                "stt",
            )
    return _stt_instance


def get_tts_service() -> TTSService:
    global _tts_instance
    if _tts_instance is None:
        settings = get_settings()
        if settings.tts_provider == "openai":
            _tts_instance = _init_with_fallback(OpenAITTS, CoquiTTS, "tts")
        elif settings.tts_provider == "coqui":
            _tts_instance = _init_with_fallback(CoquiTTS, OpenAITTS, "tts")
        else:
            _tts_instance = _init_with_fallback(PiperTTS, CoquiTTS, "tts")
    return _tts_instance
