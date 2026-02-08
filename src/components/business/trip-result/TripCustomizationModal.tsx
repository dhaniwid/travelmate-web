'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

import DietaryTags from './customization/DietaryTags';
import StyleTags from './customization/StyleTags';
import BudgetTierCards from './customization/BudgetTierCards';

interface TripCustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPreferences: {
        dietary: string[];
        styles: string[];
        budgetTier: 'low' | 'med' | 'high';
    };
    onApply: (newPreferences: any) => void;
}

export default function TripCustomizationModal({
    isOpen,
    onClose,
    currentPreferences,
    onApply
}: TripCustomizationModalProps) {
    const [dietary, setDietary] = useState<string[]>(currentPreferences.dietary);
    const [styles, setStyles] = useState<string[]>(currentPreferences.styles);
    const [budgetTier, setBudgetTier] = useState<'low' | 'med' | 'high'>(currentPreferences.budgetTier);

    const toggleDietary = (tag: string) => {
        setDietary(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const toggleStyle = (tag: string) => {
        setStyles(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleApply = () => {
        onApply({ dietary, styles, budgetTier });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] overflow-hidden border-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-0 bg-white">
                <DialogHeader className="px-10 pt-12 pb-6 text-left">
                    <DialogTitle className="text-[2.6rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
                        Customize Your Trip
                    </DialogTitle>
                    <DialogDescription className="hidden">
                        Adjust your preferences to tailor your itinerary.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-10 pb-8 space-y-10 overflow-y-auto max-h-[70vh]">
                    <DietaryTags selected={dietary} onToggle={toggleDietary} />
                    <StyleTags selected={styles} onToggle={toggleStyle} />
                    <BudgetTierCards selected={budgetTier} onChange={setBudgetTier} />
                </div>

                <DialogFooter className="px-10 pb-12 pt-4 bg-white">
                    <Button
                        onClick={handleApply}
                        className="w-full rounded-[1.5rem] bg-[#42707D] hover:bg-[#355963] text-white font-bold h-[4.2rem] shadow-xl transition-all active:scale-[0.98] text-[1.1rem] tracking-wide"
                    >
                        Apply Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
