from config import get_settings
from services.stt_service import STTService
from services.stt_openai import OpenAISTTService, MockSTTService
from services.tts_service import TTSService
from services.tts_openai import OpenAITTSService, MockTTSService


def get_stt_service() -> STTService:
    settings = get_settings()
    if settings.stt_provider == "openai" and settings.openai_api_key:
        return OpenAISTTService()
    return MockSTTService()


def get_tts_service() -> TTSService:
    settings = get_settings()
    if settings.tts_provider == "openai" and settings.openai_api_key:
        return OpenAITTSService()
    return MockTTSService()
