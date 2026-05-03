from dataclasses import dataclass, field
from langchain_groq import ChatGroq
from langchain_chroma import Chroma
from src.rag import build_llm


@dataclass
class AppState:
    llm: ChatGroq = field(default_factory=build_llm)
    vectorstore: Chroma | None = None


_state: AppState | None = None


def get_state() -> AppState:
    global _state
    if _state is None:
        _state = AppState()
    return _state