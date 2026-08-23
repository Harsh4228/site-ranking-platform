"use client";
import { useState, useEffect, useRef } from "react";

export default function ChatPanel({ slug }) {
  const [messages, setMessages] = useState([]);
  const [author, setAuthor] = useState("");
  const [authorLocked, setAuthorLocked] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/indexes/${slug}/chat`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (!open) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 6000);
    return () => clearInterval(interval);
  }, [open, slug]);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    if (!author.trim() || !body.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/indexes/${slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim(), body: body.trim() }),
      });
      if (res.ok) {
        setBody("");
        setAuthorLocked(true);
        await fetchMessages();
      }
    } catch {}
    setBusy(false);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!open) {
    return (
      <button className="chat-toggle" onClick={() => setOpen(true)}>
        💬 Index Chat
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-title">💬 Index Chat</span>
        <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">No messages yet — start the conversation.</p>
        )}
        {messages.map((m) => (
          <div key={m._id} className="chat-msg">
            <span className="chat-author">{m.author}</span>
            <span className="chat-time">{formatTime(m.createdAt)}</span>
            <div className="chat-body">{m.body}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-form" onSubmit={send}>
        {!authorLocked && (
          <input
            className="chat-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            required
          />
        )}
        <div className="chat-send-row">
          <input
            className="chat-input chat-body-input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message…"
            maxLength={500}
            required
          />
          <button type="submit" disabled={busy} className="chat-send-btn">
            {busy ? "…" : "➤"}
          </button>
        </div>
      </form>
    </div>
  );
}
