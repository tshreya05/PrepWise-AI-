from abc import ABC, abstractmethod


class STTService(ABC):
    """Abstract Speech-to-Text service."""

    @abstractmethod
    async def transcribe(self, audio_data: bytes, filename: str = "audio.webm") -> str:
        """Convert audio bytes to text."""
        pass
