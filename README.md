# RAG Chat — Conversá con tus PDFs

Aplicación fullstack que implementa el patrón **RAG (Retrieval-Augmented Generation)**. Subís uno o más PDFs y les hacés preguntas en lenguaje natural. Las respuestas vienen fundamentadas con las fuentes exactas del documento.

## Demo



## Stack tecnológico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **LLM**: Llama 3.3 70B via Groq API
- **Embeddings**: all-MiniLM-L6-v2 (local, sin API key)
- **Vector DB**: ChromaDB
- **PDF parsing**: PyMuPDF
- **Orquestación**: LangChain

## Arquitectura

El usuario sube un PDF → se divide en chunks → cada chunk se convierte en un vector de embeddings → se guarda en ChromaDB. Al hacer una pregunta, se buscan los chunks más similares y se envían junto a la pregunta a Llama 3.3, que responde usando solo el contexto provisto.

## Correr el proyecto localmente

### Requisitos

- Docker y Docker Compose
- Node.js 20+
- API key de Groq (gratis en [console.groq.com](https://console.groq.com))

### Configuración

Creá un archivo `.env` en la raíz:

```bash
GROQ_API_KEY=gsk_...
```

### Levantar el backend

```bash
docker compose up --build
```

El backend queda disponible en `http://localhost:8000`.

### Levantar el frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.


## Estructura del proyecto

```
rag-project/
├── src/
│   ├── api/
│   │   ├── main.py          # App FastAPI + CORS
│   │   ├── routes/
│   │   │   ├── upload.py    # POST /upload
│   │   │   ├── ask.py       # POST /ask
│   │   │   └── reset.py     # POST /reset
│   │   └── models/
│   │       └── schemas.py   # Modelos Pydantic
│   ├── embeddings.py        # Carga de PDFs y chunking
│   ├── vectorstore.py       # ChromaDB
│   └── rag.py               # Chain de RAG
└── frontend/
    └── src/
        ├── components/
        │   ├── ChatWindow.tsx
        │   ├── UploadZone.tsx
        │   └── MessageBubble.tsx
        └── lib/
            └── api.ts       # Cliente HTTP al backend
```