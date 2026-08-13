from abc import ABC, abstractmethod


class TTSService(ABC):
    """Abstract Text-to-Speech service."""

    @abstractmethod
    async def synthesize(self, text: str) -> tuple[bytes, str]:
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass
