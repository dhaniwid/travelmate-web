'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Sparkles, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { trackEventAction } from '@/actions/analytics';
import { cn } from '@/lib/utils';

interface QuotaBannerProps {
    isVisible: boolean;
    onClose: () => void;
    message?: string;
    actionLabel?: string;
    actionHref?: string;
    className?: string;
}

export default function QuotaBanner({
    isVisible,
    onClose,
    message,
    actionLabel = "Upgrade to PRO",
    actionHref = "/pricing",
    className
}: QuotaBannerProps) {
    const router = useRouter();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={cn("overflow-hidden w-full", className)}
                >
                    <div className="p-4 mb-6 relative isolate">
                        {/* Glassmorphic Background */}
                        <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-md rounded-2xl border border-rose-200/50 -z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent rounded-2xl -z-10" />

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Icon / Status */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/40 border border-white/60 flex items-center justify-center shadow-sm">
                                <ShieldAlert className="w-6 h-6 text-rose-600" />
                            </div>

                            {/* Content */}
                            <div className="flex-grow text-center sm:text-left">
                                <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight flex items-center justify-center sm:justify-start gap-2">
                                    Trip Limit Reached 🚫
                                </h4>
                                <p className="text-xs text-rose-800/80 font-medium leading-relaxed mt-0.5">
                                    {message || "You've reached your monthly trip limit. Upgrade to PRO for unlimited planning and premium destinations."}
                                </p>
                            </div>

                            {/* Action */}
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => {
                                        trackEventAction('upgrade_clicked', { source: 'quota_banner' });
                                        router.push(actionHref);
                                    }}
                                    size="sm"
                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-5 font-bold shadow-lg shadow-rose-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{actionLabel}</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Button>

                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/40 rounded-full transition-colors text-rose-800/60 hover:text-rose-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
