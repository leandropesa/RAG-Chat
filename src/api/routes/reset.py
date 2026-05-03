from fastapi import APIRouter
from src.api.models.schemas import ResetResponse
from src.api.state import get_state

router = APIRouter()


@router.post("/reset", response_model=ResetResponse)
async def reset():
    state = get_state()
    if state.vectorstore is not None:
        state.vectorstore.delete_collection()
        state.vectorstore = None
    return ResetResponse(message="Contexto reiniciado correctamente.")