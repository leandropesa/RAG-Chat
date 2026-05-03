"use client";

import { useState, useEffect } from "react";
import UploadZone, { UploadedFileInfo } from "@/components/UploadZone";
import ChatWindow from "@/components/ChatWindow";
import Logo from "@/components/Logo";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon, TrashIcon } from "@/components/Icons";
import { resetContext } from "@/lib/api";

interface StatusState {
  message: string;
  isError: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "ahora";
  if (diff < 3_600_000) return `hace ${Math.floor(diff / 60_000)} min`;
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Home() {
  const [status, setStatus] = useState<StatusState | null>(null);
  const [files, setFiles] = useState<UploadedFileInfo[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("uploaded-files");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [mounted, setMounted] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("uploaded-files", JSON.stringify(files));
  }, [files]);

  const handleUploadSuccess = (message: string, file: UploadedFileInfo) => {
    setStatus({ message, isError: false });
    setFiles((prev) => {
      const filtered = prev.filter(
        (f) => !(f.name === file.name && f.size === file.size)
      );
      return [file, ...filtered];
    });
  };

  const handleUploadError = (error: string) => {
    setStatus({ message: error, isError: true });
  };

  const removeFile = async (idx: number) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length === 0) resetContext().catch(console.error);
      return updated;
    });
  };

  const handleClearAll = async () => {
    setFiles([]);
    try {
      await resetContext();
    } catch {
      setStatus({ message: "Error al limpiar el contexto.", isError: true });
    }
  };

  return (
    <main className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="flex w-[320px] flex-shrink-0 flex-col gap-[18px] border-r border-[var(--border)] bg-[var(--surface)] p-5">
        {/* Brand row */}
        <div className="flex items-center gap-2.5 px-0.5 pb-1.5 pt-1">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-sm)]">
            <Logo size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">
              RAG Chat
            </div>
            <div className="mt-px font-mono text-[11px] tracking-[0.02em] text-[var(--text-subtle)]">
              v1.0.0
            </div>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label={
              theme === "light" ? "Activar modo oscuro" : "Activar modo claro"
            }
            className="ml-auto grid h-7 w-7 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>

        {/* Upload */}
        <div className="flex flex-col gap-2.5">
          <SectionLabel>Documento</SectionLabel>
          <UploadZone
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Uploaded files list */}
        {mounted && files.length > 0 && (
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <SectionLabel>
                {files.length === 1
                  ? "1 documento"
                  : `${files.length} documentos`}
              </SectionLabel>
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--text-subtle)] transition-colors hover:text-[var(--text-muted)]"
                >
                  Limpiar
                </button>
              )}
            </div>
            <ul className="scroll-thin flex flex-col gap-1.5 overflow-y-auto pr-0.5">
              {files.map((file, idx) => (
                <li
                  key={`${file.name}-${file.uploadedAt}`}
                  className="anim-slide-up group flex items-center gap-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-[12.5px] transition-colors hover:border-[var(--border-strong)]"
                >
                  <div className="grid h-8 w-7 flex-shrink-0 place-items-center rounded-[5px] border border-[var(--border)] bg-[var(--surface)] font-mono text-[9px] font-semibold text-[var(--text-muted)]">
                    PDF
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate font-medium text-[var(--text)]"
                      title={file.name}
                    >
                      {file.name}
                    </div>
                    <div className="mt-px text-[11px] text-[var(--text-subtle)]">
                      {file.chunks} chunks · {formatSize(file.size)} ·{" "}
                      {formatTime(file.uploadedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    aria-label={`Quitar ${file.name}`}
                    className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border border-transparent text-[var(--text-subtle)] opacity-0 transition-all duration-150 hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text)] group-hover:opacity-100 focus:opacity-100"
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status */}
        {status && (
          <div
            className={`anim-slide-up flex items-start gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-[12px] leading-[1.45] ${
              status.isError ? "text-[var(--error)]" : "text-[var(--success)]"
            }`}
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ background: "currentColor" }}
            />
            <span className="break-words">{status.message}</span>
          </div>
        )}

        {/* Footer */}
          <div
            className={`${
              mounted && files.length > 0 ? "" : "mt-auto"
            } border-t border-[var(--border)] pt-3.5 text-[11px] leading-[1.5] text-[var(--text-subtle)]`}
          >
            {(!mounted || files.length === 0) && (
              <p className="m-0 mb-3 text-[var(--text-muted)]">
                Subí un PDF para comenzar.
              </p>
            )}
          <div className="mb-1.5 text-[var(--text-muted)]">Atajos</div>
          <div className="mb-1 flex items-center justify-between">
            <span>Enviar</span>
            <Kbd>↵</Kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Salto de línea</span>
            <Kbd>⇧ ↵</Kbd>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="flex flex-1 flex-col overflow-hidden">
        <ChatWindow />
      </section>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-0.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--text-subtle)]">
      {children}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-px font-mono text-[10px] leading-[1.4] text-[var(--text-muted)]">
      {children}
    </kbd>
  );
}