'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Loader2, History, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ScrollAwareNavbarProps {
    title: string;
    isSaved: boolean;
    isSaving: boolean;
    isHistoryView?: boolean;
    onSave?: () => void;
    onShare?: () => void;
}

export default function ScrollAwareNavbar({
    title,
    isSaved,
    isSaving,
    isHistoryView = false,
    onSave,
    onShare
}: ScrollAwareNavbarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = 200; // Match new compact header threshold
            setIsVisible(window.scrollY > scrollThreshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={cn(
                "fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 flex items-center px-4 md:px-8 justify-between transition-all duration-300 transform",
                isVisible ? "translate-y-0" : "-translate-y-full"
            )}
        >
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => isHistoryView ? router.push('/history') : router.back()}
                    className="rounded-full h-10 w-10 text-slate-600 hover:bg-slate-100"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <h2 className="text-lg font-black text-slate-900 truncate max-w-[150px] md:max-w-md">
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onShare}
                    className="rounded-full h-10 w-10 text-slate-600 hover:bg-slate-100"
                >
                    <Share2 className="w-4 h-4" />
                </Button>

                {!isSaved && (
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                        className="rounded-full bg-[#42707D] hover:bg-[#355963] text-white font-bold h-10 px-6 shadow-lg transition-all active:scale-95 text-xs"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Trip
                    </Button>
                )}
            </div>
        </div >
    );
}
