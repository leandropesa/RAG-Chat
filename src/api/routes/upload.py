from fastapi import APIRouter, UploadFile, File, HTTPException
from src.api.models.schemas import UploadResponse
from src.embeddings import load_pdf, split_text, get_embedding_model
from src.vectorstore import build_vectorstore
from src.api.state import get_state
import tempfile
import os

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        text = load_pdf(tmp_path)
        documents = split_text(text)
        embedding_model = get_embedding_model()
        state = get_state()

        if state.vectorstore is None:
            state.vectorstore = build_vectorstore(documents, embedding_model)
        else:
            state.vectorstore.add_documents(documents)

        return UploadResponse(message="Documento indexado correctamente.", chunks=len(documents))
    finally:
        os.unlink(tmp_path)