import { Source } from "@/lib/api";
import Logo from "@/components/Logo";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`anim-msg-in flex max-w-[760px] gap-3.5 ${
        isUser ? "flex-row-reverse self-end" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border text-[11px] font-semibold
          ${
            isUser
              ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
          }`}
      >
        {isUser ? (
          <UserGlyph />
        ) : (
          <Logo size={14} />
        )}
      </div>

      {/* Body */}
      <div
        className={`min-w-0 flex-1 ${
          isUser ? "flex flex-col items-end" : ""
        }`}
        style={{ maxWidth: "calc(100% - 42px)" }}
      >
        <div
          className={`mb-1.5 flex items-center gap-2 text-[11.5px] text-[var(--text-subtle)] ${
            isUser ? "justify-end" : ""
          }`}
        >
          <span className="font-medium text-[var(--text-muted)]">
            {isUser ? "Vos" : "RAG Chat"}
          </span>
        </div>

        {isUser ? (
          <div className="inline-block max-w-full rounded-[12px] rounded-br-[2px] bg-[var(--text)] px-3.5 py-2.5">
            <div className="prose prose-sm max-w-none [&_*]:!text-[var(--bg)]">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none [&_*]:!text-[var(--text)] [&_code]:bg-[var(--surface-2)] [&_code]:rounded [&_code]:px-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3.5 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                Fuentes citadas
              </span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-[1px] font-mono text-[10.5px] text-[var(--text-muted)]">
                {message.sources.length}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {message.sources.map((source, index) => (
                <li
                  key={index}
                  className="flex gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-[12.5px] leading-[1.55] text-[var(--text-muted)] transition-colors duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
                >
                  <span
                    className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-[5px] font-mono text-[10.5px] font-semibold"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      border:
                        "1px solid color-mix(in oklch, var(--accent) 25%, transparent)",
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
                    {source.content}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function UserGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export type { Message };
