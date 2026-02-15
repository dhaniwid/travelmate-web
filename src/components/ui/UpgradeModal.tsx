'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Sparkles, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function UpgradeModal({
    isOpen,
    onClose,
    title = "Unlock Hidden Gems 💎",
    message = "Experience your destination like a local with curated, high-value spots you won't find on Google."
}: UpgradeModalProps) {
    const router = useRouter();

    const handleUpgrade = () => {
        router.push('/pricing');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="relative">
                    {/* Header Image/Background */}
                    <div className="h-32 bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center relative">
                        <Sparkles className="w-16 h-16 text-white/20 absolute rotate-12 -right-4 -top-4" />
                        <Sparkles className="w-12 h-12 text-white/10 absolute -rotate-12 -left-2 -bottom-2" />
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 shadow-xl">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="p-8 pt-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-slate-900 text-center mb-2">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-center text-base font-medium">
                                {message}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-teal-100 rounded-full p-1 flex-shrink-0">
                                    <Check className="w-3 h-3 text-teal-600" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">Reveal secret locations and "off-the-beaten-path" spots</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-teal-100 rounded-full p-1 flex-shrink-0">
                                    <Check className="w-3 h-3 text-teal-600" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">Get local tips and cultural context for every gem</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-teal-100 rounded-full p-1 flex-shrink-0">
                                    <Check className="w-3 h-3 text-teal-600" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">Unlimited magazine-style PDF exports</p>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-3">
                            <Button
                                onClick={handleUpgrade}
                                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold py-6 rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 border-none"
                            >
                                Upgrade to Miru PRO
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="w-full text-slate-400 hover:text-slate-600 font-bold"
                            >
                                Maybe later
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
