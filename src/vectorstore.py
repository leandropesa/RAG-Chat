from langchain_chroma import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings


def build_vectorstore(documents: list, embedding_model: SentenceTransformerEmbeddings) -> Chroma:
    return Chroma.from_documents(documents, embedding_model)


def search(vectorstore: Chroma, query: str, k: int = 3) -> list:
    return vectorstore.similarity_search(query, k=k)