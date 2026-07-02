from abc import ABC, abstractmethod


class TTSService(ABC):
    """Abstract Text-to-Speech service."""

    @abstractmethod
    async def synthesize(self, text: str) -> tuple[bytes, str]:
        """Convert text to audio. Returns (audio_bytes, format)."""
        pass
