'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import TypewriterText from '@/components/ui/TypewriterText';
import QuickPrompts from '@/components/trip/chat/QuickPrompts';

// Shared markdown styles — mirrors TypewriterText for visual consistency
const markdownComponents: Components = {
    strong: ({ children, ...props }) => (
        <span className="font-bold text-teal-700" {...props}>{children}</span>
    ),
    ul: ({ children, ...props }) => (
        <ul className="list-disc pl-4 space-y-0.5 my-1" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }) => (
        <ol className="list-decimal pl-4 space-y-0.5 my-1" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }) => (
        <li className="leading-snug" {...props}>{children}</li>
    ),
    p: ({ children, ...props }) => (
        <p className="mb-1 last:mb-0 leading-relaxed" {...props}>{children}</p>
    ),
    em: ({ children, ...props }) => (
        <em className="italic" {...props}>{children}</em>
    ),
    code: ({ children, ...props }) => (
        <code className="bg-teal-50 text-teal-800 rounded px-1 py-0.5 text-[11px] font-mono" {...props}>{children}</code>
    ),
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
    id: number;
    role: 'user' | 'miru';
    content: string;
    /** Miru messages animate via TypewriterText on first render; once done, rendered as plain text. */
    animated: boolean;
}

interface ChatFabProps {
    tripId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatFab({ tripId }: ChatFabProps) {
    const { getToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            role: 'miru',
            content:
                "Hi! I'm Miru ✨ Ask me anything about your trip — I can help you adjust timings, suggest alternatives, or answer questions about your itinerary.",
            animated: false, // welcome message renders immediately
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const msgIdRef = useRef(1);

    // Number of user-sent messages (excludes the welcome Miru message)
    const userMessageCount = messages.filter((m) => m.role === 'user').length;

    // ── Scroll helpers ────────────────────────────────────────────────────────

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Scroll whenever messages change or a typewriter tick fires (via onComplete)
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    // ── Mark a Miru message as "done animating" so it no longer re-triggers ──

    const markAnimated = useCallback((id: number) => {
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, animated: false } : m))
        );
    }, []);

    // ── Send ──────────────────────────────────────────────────────────────────

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading) return;

            const userMsg: Message = {
                id: msgIdRef.current++,
                role: 'user',
                content: trimmed,
                animated: false,
            };
            setMessages((prev) => [...prev, userMsg]);
            setInput('');
            setIsLoading(true);

            try {
                const token = await getToken();
                const res = await api.post<{ reply: string }>(
                    '/chat/completion',
                    { trip_id: tripId, message: trimmed },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const miruMsg: Message = {
                    id: msgIdRef.current++,
                    role: 'miru',
                    content: res.data.reply,
                    animated: true, // ← triggers the typewriter
                };
                setMessages((prev) => [...prev, miruMsg]);
            } catch {
                toast.error('Miru is unavailable right now. Please try again.');
                setMessages((prev) => prev.slice(0, -1));
                setInput(trimmed);
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, getToken, tripId]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    // Quick prompt: populate + immediately submit
    const handleQuickPrompt = useCallback(
        (msg: string) => {
            sendMessage(msg);
        },
        [sendMessage]
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {/* ── Chat Sheet ──────────────────────────────────────────────── */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] flex flex-col rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 bg-white">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm leading-none">Miru AI</p>
                                <p className="text-teal-100 text-xs mt-0.5">Your trip assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="overflow-y-auto p-4 space-y-3 bg-slate-50 max-h-[320px]">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'miru' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bot className="w-3.5 h-3.5 text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-teal-600 text-white rounded-tr-sm'
                                        : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm'
                                        }`}
                                >
                                    {/* Typewriter for fresh Miru messages, markdown for settled ones */}
                                    {msg.role === 'miru' && msg.animated ? (
                                        <TypewriterText
                                            text={msg.content}
                                            onComplete={() => {
                                                markAnimated(msg.id);
                                                scrollToBottom();
                                            }}
                                        />
                                    ) : msg.role === 'miru' ? (
                                        <div className="text-sm text-slate-700 leading-relaxed">
                                            <ReactMarkdown components={markdownComponents}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <span className="whitespace-pre-wrap">{msg.content}</span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator — three dots while loading */}
                        {isLoading && (
                            <div className="flex gap-2 justify-start">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Bot className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts — only before the user sends their first message */}
                    {userMessageCount === 0 && !isLoading && (
                        <div className="flex-shrink-0 border-t border-slate-100 bg-white">
                            <QuickPrompts onSelect={handleQuickPrompt} disabled={isLoading} />
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 py-3 bg-white border-t border-slate-100 flex gap-2 items-center flex-shrink-0">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Miru anything..."
                            disabled={isLoading}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50 transition-all"
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                            aria-label="Send message"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── FAB ─────────────────────────────────────────────────────── */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={`fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen
                    ? 'bg-slate-700 hover:bg-slate-800'
                    : 'bg-gradient-to-br from-teal-500 to-emerald-500 hover:shadow-teal-300/50'
                    }`}
                aria-label={isOpen ? 'Close Miru chat' : 'Open Miru chat'}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Sparkles className="w-6 h-6 text-white" />
                )}
            </button>
        </>
    );
}
