'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Assuming reusable component
import { toast } from 'sonner';
import { TripPlan } from '@/types';
import { tripService } from '@/services/trip';
import { useAuth } from '@clerk/nextjs';

interface MiruChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    onPlanUpdate: (newPlan: TripPlan) => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function MiruChatDrawer({ isOpen, onClose, tripId, onPlanUpdate }: MiruChatDrawerProps) {
    const { getToken } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm Miru. I can help refine your itinerary. Try asking me to \"Add a coffee break on Day 2\" or \"Make Day 1 more relaxed\"."
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Use tripService to avoid duplicate /api/v1 issues
            const token = await getToken();
            const data = await tripService.refineTrip(tripId, input, token);

            // 2. Update Plan
            // The API returns the FULL plan (including updated itinerary)
            // or just the itinerary? Let's check TripService.RefineTrip.
            // It returns *domain.TripPlan. So we can cast it.

            // Wait, data.plan might be nested or direct?
            // TripHandler returns: c.JSON(http.StatusOK, gin.H{"data": updatedPlan})
            // So response is { data: TripPlan }

            onPlanUpdate(data);

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I've updated your itinerary based on your request! Check out the changes."
            };
            setMessages(prev => [...prev, botMsg]);
            toast.success("Itinerary updated!");

        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error while processing your request. Please try again."
            };
            setMessages(prev => [...prev, errorMsg]);
            toast.error("Failed to update itinerary");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="h-16 border-b flex items-center justify-between px-6 bg-slate-50">
                    <div className="flex items-center gap-2 text-teal-700">
                        <Sparkles className="w-5 h-5" />
                        <h2 className="font-bold text-lg">Miru Assistant</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-200 rounded-full">
                        <X className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-700'}`}>
                                {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'assistant'
                                ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                                : 'bg-teal-600 text-white rounded-tr-none shadow-md'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                                <div className="flex space-x-1 h-5 items-center">
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-white">
                    <div className="relative">
                        <Textarea
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="pr-12 resize-none min-h-[50px] max-h-[120px] py-3 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            rows={1}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="absolute right-2 bottom-2 h-8 w-8 bg-teal-600 hover:bg-teal-700 rounded-lg transition-all"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </Button>
                    </div>
                    <p className="text-xs text-center text-slate-400 mt-2">
                        Miru can make mistakes. Please review the updated plan.
                    </p>
                </div>
            </div>
        </>
    );
}
