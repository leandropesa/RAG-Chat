"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { uploadPDF } from "@/lib/api";
import { UploadIcon } from "@/components/Icons";

export interface UploadedFileInfo {
  name: string;
  size: number;
  chunks: number;
  uploadedAt: number;
}

interface UploadZoneProps {
  onUploadSuccess: (message: string, file: UploadedFileInfo) => void;
  onUploadError: (error: string) => void;
}

export default function UploadZone({
  onUploadSuccess,
  onUploadError,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      onUploadError("Solo se aceptan archivos PDF.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadPDF(file);
      onUploadSuccess(`✓ ${result.message} (${result.chunks} chunks)`, {
        name: file.name,
        size: file.size,
        chunks: result.chunks,
        uploadedAt: Date.now(),
      });
    } catch (error) {
      onUploadError(
        error instanceof Error ? error.message : "Error desconocido."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-[14px] border border-dashed
        bg-[var(--surface)] px-[18px] py-6 text-center transition-all duration-200
        hover:-translate-y-[1px] hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
        ${
          isDragging
            ? "scale-[1.01] border-solid border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border-strong)]"
        }
        ${isUploading ? "pointer-events-none opacity-70" : ""}`}
    >
      {/* Soft gradient glow on hover/drag */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300
          ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, var(--accent-soft) 0%, transparent 60%)",
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />

      <div
        className={`relative z-[1] mx-auto mb-2.5 grid h-[38px] w-[38px] place-items-center
          rounded-[10px] border bg-[var(--surface-2)] transition-all duration-200
          group-hover:-translate-y-[1px] group-hover:border-[var(--accent)] group-hover:bg-[var(--surface)] group-hover:text-[var(--accent)]
          ${
            isDragging
              ? "border-[var(--accent)] bg-[var(--surface)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-muted)]"
          }`}
      >
        {isUploading ? (
          <span className="anim-spin inline-block h-4 w-4 rounded-full border-[1.5px] border-[var(--border-strong)] border-t-[var(--accent)]" />
        ) : (
          <UploadIcon />
        )}
      </div>

      <p className="relative z-[1] m-0 text-[13px] font-medium text-[var(--text)]">
        {isUploading ? "Procesando…" : "Arrastrá un PDF aquí"}
      </p>
      <p className="relative z-[1] mt-1 text-[11.5px] text-[var(--text-subtle)]">
        {isUploading
          ? "Generando embeddings"
          : "o hacé click para seleccionar"}
      </p>
    </div>
  );
}
