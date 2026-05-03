const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Source {
  content: string;
}

export interface AskResponse {
  answer: string;
  sources: Source[];
}

export async function uploadPDF(
  file: File
): Promise<{ message: string; chunks: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail ?? "Error al subir el archivo.");
  }

  return response.json();
}

export async function askQuestion(question: string): Promise<AskResponse> {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail ?? "Error al procesar la pregunta.");
  }

  return response.json();
}

export async function resetContext(): Promise<void> {
  const response = await fetch(`${API_URL}/reset`, { method: "POST" });
  if (!response.ok) throw new Error("Error al reiniciar el contexto.");
}