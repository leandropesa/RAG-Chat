import pymupdf
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def load_text(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def load_pdf(file_path: str) -> str:
    doc = pymupdf.open(file_path)
    return "\n\n".join([page.get_text() for page in doc])


def load_document(file_path: str) -> str:
    if file_path.endswith(".pdf"):
        return load_pdf(file_path)
    return load_text(file_path)


def split_text(text: str) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    return splitter.create_documents([text])


def get_embedding_model() -> SentenceTransformerEmbeddings:
    return SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")