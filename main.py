from dotenv import load_dotenv
from src.embeddings import load_document, split_text, get_embedding_model
from src.vectorstore import build_vectorstore
from src.rag import build_llm, ask


load_dotenv()


def main():
    print("Cargando documento...")
    text = load_document("data/CriptografiaSimetrica.pdf")
    documents = split_text(text)
    embedding_model = get_embedding_model()
    vectorstore = build_vectorstore(documents, embedding_model)

    llm = build_llm()

    print("RAG listo. Escribí tu pregunta (o 'salir' para terminar).\n")

    while True:
        question = input("Pregunta: ").strip()

        if question.lower() == "salir":
            break

        if not question:
            continue

        result = ask(llm, vectorstore, question)

        print(f"\nRespuesta:\n{result['answer']}\n")
        print("Fuentes utilizadas:")
        for i, source in enumerate(result["sources"]):
            print(f"\n--- Fuente {i + 1} ---\n{source}")
        print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    main()