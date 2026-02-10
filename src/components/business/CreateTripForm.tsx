'use client';

import React, { useState } from 'react';
import { TripRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { ProgressStep } from './GenerationProgress';
import { useUser } from "@clerk/nextjs";

// Import Modular Components
import DestinationSection from './create-trip/DestinationSection';
import DateDurationSection from './create-trip/DateDurationSection';
import VibeSection from './create-trip/VibeSection';
import LoadingOverlay from './create-trip/LoadingOverlay';
import { generateTripAction } from '@/actions/trip';

interface CreateTripFormProps {
    onSuccess: (data: any) => void;
    initialDestination?: string;
}

export default function CreateTripForm({ onSuccess, initialDestination = '' }: CreateTripFormProps) {
    const { user } = useUser();

    // --- FORM STATE ---
    const [isAutoDest, setIsAutoDest] = useState(false);
    const [isFlexibleDate, setIsFlexibleDate] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    // Sliders
    const [paceVal, setPaceVal] = useState([50]);
    const [socialVal, setSocialVal] = useState([50]);

    // Data
    const [formData, setFormData] = useState<TripRequest>({
        origin: 'Jakarta',
        destination: '' + initialDestination,
        start_date: new Date().toISOString().split('T')[0],
        trip_days: 3,
        style: '',
        budget: 0,
    });

    // Loading Steps
    const [steps, setSteps] = useState<ProgressStep[]>([
        { id: 'meta', label: 'Analyzing Vibe...', status: 'pending' },
        { id: 'iti', label: 'Crafting Experience', status: 'pending' },
        { id: 'log', label: 'Planning Strategy', status: 'pending' },
        { id: 'final', label: 'Finalizing', status: 'pending' },
    ]);

    const updateStep = (id: string, status: 'loading' | 'complete') => {
        setSteps(prev => prev.map(step => step.id === id ? { ...step, status } : step));
    };

    // Helper: Generate Vibe String for AI
    const generateStyleString = () => {
        let styleDesc = [];
        // Pace Logic
        if (paceVal[0] < 30) styleDesc.push("Very Relaxed, mostly Staycation (60% Hotel time)");
        else if (paceVal[0] < 70) styleDesc.push("Balanced mix of rest and activity");
        else styleDesc.push("Fast paced, heavy exploration, maximize every hour");

        // Social Logic
        if (socialVal[0] < 30) styleDesc.push("Hidden gems, quiet places, avoid crowds");
        else if (socialVal[0] < 70) styleDesc.push("Mix of popular spots and local secrets");
        else styleDesc.push("Trendy spots, viral locations, social vibes");

        return styleDesc.join(", ");
    };

    // --- SUBMISSION LOGIC ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi Origin
        if (!formData.origin.trim()) {
            toast.error("Please enter a starting point (Origin)");
            return;
        }

        if (!isAutoDest && !formData.destination) {
            toast.error("Where are we going? Or choose 'Surprise Me'!");
            return;
        }

        setIsStreaming(true);
        setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
        updateStep('meta', 'loading');

        const finalStyle = generateStyleString();
        const payload = {
            ...formData,
            destination: isAutoDest ? '' : formData.destination,
            style: finalStyle,
            start_date: isFlexibleDate ? new Date().toISOString().split('T')[0] : formData.start_date,
            budget: 0,
            user_id: user?.id || "",
        };

        try {
            // STEP 1: Metadata / Initial Analysis
            updateStep('meta', 'loading');

            const data = await generateTripAction(payload);

            // Advance steps to give a sense of progress
            updateStep('meta', 'complete');
            updateStep('iti', 'loading');

            setTimeout(() => {
                updateStep('iti', 'complete');
                updateStep('log', 'loading');
            }, 800);

            setTimeout(() => {
                updateStep('log', 'complete');
                updateStep('final', 'loading');
            }, 1600);

            setTimeout(() => {
                updateStep('final', 'complete');
                toast.success("Itinerary Ready! 🚀");
            }, 2400);

            setTimeout(() => {
                onSuccess(data);
                setIsStreaming(false);
            }, 3200);

        } catch (error) {
            console.error("Trip Generation Error:", error);
            setIsStreaming(false);
            toast.error("AI is taking a nap. Please try again.");
        }
    };

    if (isStreaming) {
        return <LoadingOverlay steps={steps} />;
    }

    return (
        <Card className="w-full max-w-xl mx-auto border-none shadow-2xl bg-white/90 backdrop-blur-sm ring-1 ring-slate-200/50">
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                    Design Your Trip 🎨
                </CardTitle>
                <CardDescription>
                    No complex forms. Just tell us the vibe.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">

                    <DestinationSection
                        origin={formData.origin}
                        setOrigin={(val) => setFormData({ ...formData, origin: val })}
                        destination={formData.destination}
                        setDestination={(val) => setFormData({ ...formData, destination: val })}
                        isAuto={isAutoDest}
                        setAuto={setIsAutoDest}
                    />

                    <DateDurationSection
                        startDate={formData.start_date}
                        setStartDate={(val) => setFormData({ ...formData, start_date: val })}
                        tripDays={formData.trip_days}
                        setTripDays={(val) => setFormData({ ...formData, trip_days: val })}
                        isFlexible={isFlexibleDate}
                        setFlexible={setIsFlexibleDate}
                    />

                    <VibeSection
                        paceVal={paceVal} setPaceVal={setPaceVal}
                        socialVal={socialVal} setSocialVal={setSocialVal}
                    />

                    <Button type="submit" disabled={isStreaming}
                        className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-lg py-6 rounded-xl shadow-lg transition-all hover:scale-[1.01]"
                    >
                        {isStreaming ? <Loader2 className="animate-spin" /> : "Plan My Trip ✨"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}