'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED = [
  'I have ₹10,000 to invest today. What should I do?',
  'Should I buy gold now or wait?',
  'Which FD gives the best return right now?',
  'What is SIP and how much should I invest monthly?',
  'How to save tax before March 31st?',
  'Should I prepay my home loan or invest in mutual funds?',
  'I earn ₹50,000/month. How should I manage money?',
  'Is it a good time to start investing in stock market?',
];

export default function ChatInterface({ marketContext }: { marketContext?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setStreaming(true);

    setMessages(m => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, marketContext }),
      });

      if (!res.ok || !res.body) throw new Error('Failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(m => {
          const updated = [...m];
          updated[updated.length - 1] = { role: 'assistant', content: full };
          return updated;
        });
      }
    } catch {
      setMessages(m => {
        const updated = [...m];
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chat-wrap">
      {messages.length === 0 && (
        <div className="chat-empty">
          <div className="chat-empty-icon">
            <Bot size={32} />
          </div>
          <h3 className="chat-empty-title">Ask me anything about money</h3>
          <p className="chat-empty-sub">I know about Indian markets, gold, FDs, SIP, tax saving, home loans, and more.</p>
          <div className="chat-suggestions">
            {SUGGESTED.map((s, i) => (
              <button key={i} className="chat-suggestion" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
              <div className="chat-msg-avatar">
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className="chat-msg-bubble">
                {msg.content || (streaming && i === messages.length - 1 ? (
                  <span className="chat-typing"><Loader size={13} className="spin" /> Thinking…</span>
                ) : null)}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Ask a money question…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={streaming}
        />
        <button
          className="chat-send-btn"
          onClick={() => send()}
          disabled={!input.trim() || streaming}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
