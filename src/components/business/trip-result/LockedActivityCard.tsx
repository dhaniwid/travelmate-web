'use client';

import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { trackEventAction } from '@/actions/analytics';

interface LockedActivityCardProps {
    onClick?: () => void;
    className?: string;
}

export default function LockedActivityCard({ onClick, className }: LockedActivityCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-slate-50 rounded-xl p-5 border border-dashed border-slate-300 transition-all duration-300 cursor-pointer hover:border-teal-400 hover:bg-teal-50/10 overflow-hidden",
                className
            )}
        >
            {/* Blurred Background Placeholder */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-purple-500/20 backdrop-blur-3xl" />
            </div>

            <div className="flex gap-4 sm:gap-6 relative z-10">
                <div className="flex-1 flex flex-col gap-3">
                    {/* Header Placeholder */}
                    <div className="flex items-center gap-2 mb-1.5 opacity-40">
                        <div className="w-12 h-3 bg-slate-300 rounded" />
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-bold bg-slate-200 text-slate-400 border-none">
                            HIDDEN
                        </Badge>
                    </div>

                    <h4 className="text-xl font-bold text-slate-400 flex items-center gap-2">
                        Secret Local Spot
                        <Lock className="w-4 h-4 text-slate-400" />
                    </h4>

                    <p className="text-sm text-slate-400/80 leading-relaxed max-w-md italic">
                        "Unlock this hidden gem to experience the city like a local..."
                    </p>

                    <div className="mt-2 text-left">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                trackEventAction('upgrade_clicked', { source: 'hidden_gem_locked' });
                                window.location.href = '/pricing';
                            }}
                            className="relative z-20 bg-white border-teal-200 text-teal-600 hover:bg-teal-600 hover:text-white rounded-full px-4 text-xs font-bold transition-all shadow-sm"
                        >
                            <Sparkles className="w-3 h-3 mr-2" />
                            Upgrade to Reveal
                        </Button>
                    </div>
                </div>

                {/* Blurred Image Placeholder */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-200 flex items-center justify-center relative overflow-hidden hidden sm:flex">
                    <div className="absolute inset-0 backdrop-blur-xl bg-slate-100/50" />
                    <Lock className="w-8 h-8 text-slate-300 relative z-10" />
                </div>
            </div>

            {/* Premium Indicator */}
            <div className="absolute top-3 right-3">
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] font-black tracking-tighter">
                    PRO
                </Badge>
            </div>
        </div>
    );
}
