'use client';

import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";

import DietaryTags from './customization/DietaryTags';
import PaceVibeGrid from './customization/PaceVibeGrid';

interface TripCustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPreferences: {
        dietary: string[];
        interests: string[];
        budgetTier: 'cheap' | 'moderate' | 'luxury';
        pace?: string;
    };
    onApply: (newPreferences: any) => void;
    isSaving?: boolean;
}

export default function TripCustomizationModal({
    isOpen,
    onClose,
    currentPreferences,
    onApply,
    isSaving = false
}: TripCustomizationModalProps) {
    const [dietary, setDietary] = useState<string[]>(currentPreferences.dietary);
    const [interests, setInterests] = useState<string[]>(currentPreferences.interests);
    const [pace, setPace] = useState<string>(currentPreferences.pace || 'BALANCED');

    const toggleDietary = (tag: string) => {
        setDietary(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const toggleInterest = (tag: string) => {
        setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleReset = () => {
        setDietary(currentPreferences.dietary);
        setInterests(currentPreferences.interests);
        setPace(currentPreferences.pace || 'BALANCED');
    };

    const handleApply = () => {
        onApply({ dietary, interests, budgetTier: currentPreferences.budgetTier, pace });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] rounded-t-[3rem] border-0 p-0 bg-white">
                <SheetHeader className="px-8 pt-10 pb-6 flex-row items-center justify-between space-y-0">
                    <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">
                        Personalize Your Trip
                    </SheetTitle>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors group"
                    >
                        <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
                        Reset
                    </button>
                </SheetHeader>

                <div className="px-8 pb-32 space-y-10 overflow-y-auto h-full scrollbar-hide">
                    <DietaryTags selected={dietary} onToggle={toggleDietary} />

                    <PaceVibeGrid
                        selectedPace={pace}
                        selectedVibe={interests}
                        onPaceChange={setPace}
                        onVibeToggle={toggleInterest}
                    />
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 pt-6 bg-gradient-to-t from-white via-white to-transparent">
                    <Button
                        onClick={handleApply}
                        disabled={isSaving}
                        className="w-full rounded-3xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-black h-16 shadow-2xl shadow-teal-600/30 transition-all active:scale-[0.98] text-lg gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 fill-white" />
                                Regenerate Itinerary
                            </>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
