"use client";

import { useState, useRef, useEffect } from "react";
import { askQuestion } from "@/lib/api";
import MessageBubble, { Message } from "@/components/MessageBubble";
import Logo from "@/components/Logo";
import { SendIcon, SparkleIcon, ArrowRightIcon, MoreIcon, TrashIcon } from "@/components/Icons";

const SUGGESTIONS = [
  "Resumí los puntos clave del documento",
  "¿Cuáles son las conclusiones principales?",
  "Listame los temas que se mencionan",
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("chat-history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem("chat-history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const clearConversation = () => {
    setMessages([]);
    localStorage.removeItem("chat-history");
    setMenuOpen(false);
  };

  const sendMessage = async (overrideQuestion?: string) => {
    const question = (overrideQuestion ?? input).trim();
    if (!question || isLoading) return;

    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsLoading(true);

    try {
      const result = await askQuestion(question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.answer, sources: result.sources },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Error al obtener respuesta.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const isEmpty = !mounted || messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-7">
        <span className="text-[13px] font-medium text-[var(--text)]">
          Conversación
        </span>
        <span className="text-[12px] text-[var(--text-subtle)]">
          <span className="mx-2 text-[var(--border-strong)]">·</span>
          {mounted ? messages.length : 0}{" "}
          {messages.length === 1 ? "mensaje" : "mensajes"}
        </span>
        <div className="relative ml-auto flex gap-2" ref={menuRef}>
          <button
            type="button"
            aria-label="Más opciones"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={`grid h-[30px] w-[30px] place-items-center rounded-lg border text-[var(--text-muted)] transition-all duration-150 hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] ${
              menuOpen
                ? "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]"
                : "border-transparent"
            }`}
          >
            <MoreIcon />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="anim-slide-up absolute right-0 top-[38px] z-20 min-w-[220px] overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-lg)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={clearConversation}
                disabled={messages.length === 0}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-[var(--text)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <span className="text-[var(--text-muted)]">
                  <TrashIcon />
                </span>
                <span className="flex-1">Borrar conversación</span>
                <span className="font-mono text-[10.5px] text-[var(--text-subtle)]">
                  {messages.length}
                </span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="scroll-thin flex flex-1 flex-col gap-7 overflow-y-auto px-4 py-7 sm:px-7">
        {isEmpty ? (
          <div className="anim-fade-in m-auto max-w-[420px] px-8 text-center">
            <div className="mx-auto mb-[18px] grid h-14 w-14 place-items-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]">
              <SparkleIcon />
            </div>
            <h2 className="m-0 mb-1.5 text-[18px] font-semibold tracking-[-0.01em] text-[var(--text)]">
              Hacé preguntas sobre tu documento
            </h2>
            <p className="m-0 text-[13.5px] leading-[1.55] text-[var(--text-muted)]">
              Subí un PDF en el panel lateral y empezá a conversar. Las
              respuestas vienen acompañadas de las fuentes exactas del
              documento.
            </p>
            <div className="mt-[22px] flex flex-col gap-2 text-left">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="group flex items-center gap-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-[11px] text-[13px] text-[var(--text)] transition-all duration-150 hover:translate-x-[2px] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                >
                  <span className="flex-1">{s}</span>
                  <span className="text-[var(--text-subtle)] transition-all duration-150 group-hover:translate-x-[2px] group-hover:text-[var(--text-muted)]">
                    <ArrowRightIcon />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}

        {isLoading && (
          <div className="anim-msg-in flex max-w-[760px] gap-3.5">
            <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
              <Logo size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2 text-[11.5px] text-[var(--text-subtle)]">
                <span className="font-medium text-[var(--text-muted)]">
                  RAG Chat
                </span>
                <span>·</span>
                <span>buscando en el documento</span>
              </div>
              <div className="flex gap-1 py-1.5" aria-label="Pensando">
                <span className="anim-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)]" />
                <span
                  className="anim-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)]"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="anim-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)]"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div
        className="flex-shrink-0 px-4 pb-5 pt-4 sm:px-7"
        style={{
          background: "linear-gradient(to top, var(--bg) 60%, transparent)",
        }}
      >
        <div className="flex items-end gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-4 pr-2.5 shadow-[var(--shadow-sm)] transition-all duration-200 focus-within:border-[var(--border-strong)] focus-within:shadow-[var(--shadow-md)]">
          <textarea
            ref={taRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Hacé una pregunta sobre el documento…"
            disabled={isLoading}
            rows={1}
            className="min-h-[24px] flex-1 resize-none border-0 bg-transparent py-2 text-[14px] leading-[1.5] text-[var(--text)] outline-none placeholder:text-[var(--text-subtle)] disabled:opacity-60"
            style={{ maxHeight: 200 }}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            aria-label="Enviar"
            className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-[9px] bg-[var(--text)] text-[var(--bg)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <SendIcon />
          </button>
        </div>
        <div className="mt-2 flex justify-between px-1 text-[11px] text-[var(--text-subtle)]">
          <span>
            <kbd className="mx-0.5 inline-block rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-px font-mono text-[10px] text-[var(--text-muted)]">
              ↵
            </kbd>{" "}
            para enviar ·{" "}
            <kbd className="mx-0.5 inline-block rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-px font-mono text-[10px] text-[var(--text-muted)]">
              ⇧ ↵
            </kbd>{" "}
            nueva línea
          </span>
          <span className="hidden sm:inline">
            Las respuestas pueden contener errores · revisá las fuentes
          </span>
        </div>
      </div>
    </div>
  );
}