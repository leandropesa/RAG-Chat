from fastapi import APIRouter, HTTPException
from src.api.models.schemas import AskRequest, AskResponse, SourceDocument
from src.rag import ask
from src.api.state import get_state

router = APIRouter()


@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    state = get_state()

    if state.vectorstore is None:
        raise HTTPException(status_code=400, detail="No hay ningún documento indexado. Subí un PDF primero.")

    result = ask(state.llm, state.vectorstore, request.question)

    return AskResponse(
        answer=result["answer"],
        sources=[SourceDocument(content=s) for s in result["sources"]],
    )