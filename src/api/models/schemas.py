from pydantic import BaseModel


class AskRequest(BaseModel):
    question: str


class SourceDocument(BaseModel):
    content: str


class AskResponse(BaseModel):
    answer: str
    sources: list[SourceDocument]


class UploadResponse(BaseModel):
    message: str
    chunks: int


class ResetResponse(BaseModel):
    message: str