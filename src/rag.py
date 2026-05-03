from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_chroma import Chroma


SYSTEM_PROMPT = """Sos un asistente experto que responde preguntas basándose únicamente en el contexto provisto.
Si la respuesta no está en el contexto, decí explícitamente que no tenés información suficiente.
No inventes información. Respondé siempre en español."""


def build_llm() -> ChatGroq:
    return ChatGroq(model="llama-3.3-70b-versatile")


def build_context(documents: list) -> str:
    return "\n\n---\n\n".join([doc.page_content for doc in documents])


def ask(llm: ChatGroq, vectorstore: Chroma, question: str, k: int = 3) -> dict:
    relevant_docs = vectorstore.similarity_search(question, k=k)
    context = build_context(relevant_docs)

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Contexto:\n{context}\n\nPregunta: {question}"),
    ]

    response = llm.invoke(messages)

    return {
        "answer": response.content,
        "sources": [doc.page_content for doc in relevant_docs],
    }