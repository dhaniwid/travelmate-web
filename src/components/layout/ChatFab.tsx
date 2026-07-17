'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Sparkles, X, Send, Bot, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import TypewriterText from '@/components/ui/TypewriterText';
import QuickPrompts from '@/components/trip/chat/QuickPrompts';
import UpgradeModal from '@/components/ui/UpgradeModal';

// Shared markdown styles — dark theme
const markdownComponents: Components = {
    strong: ({ children, ...props }) => (
        <span className="font-bold text-teal-400" {...props}>{children}</span>
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
        <code className="bg-teal-500/15 text-teal-300 rounded px-1 py-0.5 text-[11px] font-mono" {...props}>{children}</code>
    ),
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
    id: number;
    role: 'user' | 'miru';
    content: string;
    animated: boolean;
}

interface ChatUsage {
    used: number;
    limit: number;
    is_pro: boolean;
}

interface ChatFabProps {
    tripId: string;
}

const CHAT_LIMIT = 5;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatFab({ tripId }: ChatFabProps) {
    const { getToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            role: 'miru',
            content:
                "Halo! Aku Miru ✨ Tanya apa saja tentang tripmu — aku bisa bantu ubah waktu, saran alternatif, atau jawab pertanyaan soal itinerary kamu.",
            animated: false,
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [usage, setUsage] = useState<ChatUsage | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const msgIdRef = useRef(1);

    const isLimitReached = usage !== null && !usage.is_pro && usage.used >= CHAT_LIMIT;

    // ── Fetch usage when chat opens ───────────────────────────────────────────

    const fetchUsage = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await api.get<ChatUsage>('/chat/usage', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsage(res.data);
        } catch {
            // silent — no usage data means we don't block
        }
    }, [getToken]);

    useEffect(() => {
        if (isOpen && usage === null) {
            fetchUsage();
        }
    }, [isOpen, usage, fetchUsage]);

    // ── Scroll helpers ────────────────────────────────────────────────────────

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    const markAnimated = useCallback((id: number) => {
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, animated: false } : m))
        );
    }, []);

    // ── Send ──────────────────────────────────────────────────────────────────

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading || isLimitReached) return;

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

                // Increment local usage counter
                setUsage((prev) =>
                    prev && !prev.is_pro ? { ...prev, used: prev.used + 1 } : prev
                );

                const miruMsg: Message = {
                    id: msgIdRef.current++,
                    role: 'miru',
                    content: res.data.reply,
                    animated: true,
                };
                setMessages((prev) => [...prev, miruMsg]);
            } catch (err: any) {
                // Handle rate limit from backend
                if (err?.response?.status === 429) {
                    setUsage((prev) =>
                        prev ? { ...prev, used: CHAT_LIMIT } : null
                    );
                    setMessages((prev) => prev.slice(0, -1));
                    setInput(trimmed);
                    return;
                }
                toast.error('Miru is unavailable right now. Please try again.');
                setMessages((prev) => prev.slice(0, -1));
                setInput(trimmed);
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, isLimitReached, getToken, tripId]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleQuickPrompt = useCallback(
        (msg: string) => sendMessage(msg),
        [sendMessage]
    );

    const userMessageCount = messages.filter((m) => m.role === 'user').length;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {/* ── Chat Sheet ──────────────────────────────────────────────── */}
            {isOpen && (
                <div className="fixed bottom-36 right-4 sm:bottom-20 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] flex flex-col rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 bg-[#0A1628]">

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
                        <div className="flex items-center gap-3">
                            {/* FREE user counter */}
                            {usage && !usage.is_pro && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    isLimitReached
                                        ? 'bg-red-500/30 text-red-100'
                                        : 'bg-white/20 text-teal-100'
                                }`}>
                                    {usage.used}/{CHAT_LIMIT} pesan
                                </span>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                aria-label="Close chat"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="overflow-y-auto p-4 space-y-3 bg-[#060F1E] max-h-[320px]">
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
                                        : 'bg-[#0D2040] text-white/80 border border-white/8 rounded-tl-sm'
                                        }`}
                                >
                                    {msg.role === 'miru' && msg.animated ? (
                                        <TypewriterText
                                            text={msg.content}
                                            onComplete={() => {
                                                markAnimated(msg.id);
                                                scrollToBottom();
                                            }}
                                        />
                                    ) : msg.role === 'miru' ? (
                                        <div className="text-sm text-white/80 leading-relaxed">
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

                        {isLoading && (
                            <div className="flex gap-2 justify-start">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Bot className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="bg-[#0D2040] border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    {userMessageCount === 0 && !isLoading && !isLimitReached && (
                        <div className="flex-shrink-0 border-t border-white/8 bg-[#0A1628]">
                            <QuickPrompts onSelect={handleQuickPrompt} disabled={isLoading} />
                        </div>
                    )}

                    {/* Limit reached banner */}
                    {isLimitReached && (
                        <div className="flex-shrink-0 border-t border-white/8 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
                            <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-amber-900">Batas chat harian tercapai 💬</p>
                                <p className="text-xs text-amber-700 mt-0.5">Reset besok, atau upgrade PRO untuk unlimited.</p>
                            </div>
                            <button
                                onClick={() => setShowUpgrade(true)}
                                className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 whitespace-nowrap underline underline-offset-2"
                            >
                                <Zap className="w-3 h-3" /> Upgrade PRO
                            </button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 py-3 bg-[#0A1628] border-t border-white/8 flex gap-2 items-center flex-shrink-0">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isLimitReached ? 'Batas harian tercapai...' : 'Tanya Miru apa saja...'}
                            disabled={isLoading || isLimitReached}
                            className="flex-1 bg-white/6 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-transparent disabled:opacity-50 transition-all"
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading || isLimitReached}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                            aria-label="Send message"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── FAB ─────────────────────────────────────────────────────── */}
            {/* Extended FAB — mobile: above bottom nav (bottom-20), desktop: bottom-6 */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 h-12 px-5 rounded-full shadow-xl font-bold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen
                    ? 'bg-slate-700 hover:bg-slate-800'
                    : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                    }`}
                aria-label={isOpen ? 'Tutup Miru' : 'Tanya Miru'}
            >
                {isOpen ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>{isOpen ? 'Tutup' : 'Tanya Miru'}</span>
            </button>
            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
        </>
    );
}
