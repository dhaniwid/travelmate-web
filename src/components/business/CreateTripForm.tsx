'use client';

import React, { useState, useEffect } from 'react';
import { TripRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles, Gauge } from 'lucide-react';
import { toast } from "sonner";
import { ProgressStep } from './GenerationProgress';
import { useUser, useAuth } from "@clerk/nextjs";

// Import Modular Components
import DestinationSection from './create-trip/DestinationSection';
import DateDurationSection from './create-trip/DateDurationSection';
import VibeSection from './create-trip/VibeSection';
import LoadingOverlay from './create-trip/LoadingOverlay';
import { generateTripAction } from '@/actions/trip';

interface CreateTripFormProps {
    onSuccess: (data: any) => void;
    initialDestination?: string;
    initialIsSurprise?: boolean;
}

import { useRouter } from 'next/navigation';

export default function CreateTripForm({ onSuccess, initialDestination = '', initialIsSurprise = false }: CreateTripFormProps) {
    const { user } = useUser();
    const router = useRouter();
    const { getToken } = useAuth();

    // --- FORM STATE ---
    const [isAutoDest, setIsAutoDest] = useState(initialIsSurprise);
    const [isFlexibleDate, setIsFlexibleDate] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isDone, setIsDone] = useState(false);

    // Slider (social vibe only - pace comes from Travel DNA)
    const [socialVal, setSocialVal] = useState([50]);

    // Travel DNA (fetched from backend)
    const [userPace, setUserPace] = useState<string>('BALANCED');

    // Data
    // Data
    const [formData, setFormData] = useState<TripRequest>({
        origin: 'Jakarta', // Will be updated by useEffect
        destination: '' + initialDestination,
        start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Default to tomorrow
        trip_days: 5, // Smart default: 5 days is most common
        style: '',
        budget: 0, // 0=Any, 1=Budget, 2=Mid, 3=Luxury
    });

    // Smart Defaults (Origin)
    useEffect(() => {
        const lastOrigin = localStorage.getItem('lastOrigin');
        if (lastOrigin) {
            setFormData(prev => ({ ...prev, origin: lastOrigin }));
        }
    }, []);

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

    // Fetch Travel DNA on mount
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/preferences`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserPace(data.pace || 'BALANCED');
                }
            } catch (error) {
                console.log('Travel DNA not set, using default pace');
            }
        };
        if (user?.id) fetchPreferences();
    }, [user?.id]);

    // Helper: Generate Vibe String for AI (uses Travel DNA pace)
    const generateStyleString = () => {
        let styleDesc = [];

        // Pace Logic from Travel DNA
        if (userPace === 'RELAXED') styleDesc.push("Very Relaxed, mostly Staycation (60% Hotel time)");
        else if (userPace === 'FAST') styleDesc.push("Fast paced, heavy exploration, maximize every hour");
        else styleDesc.push("Balanced mix of rest and activity");

        // Social Logic from trip-specific slider
        if (socialVal[0] < 30) styleDesc.push("Hidden gems, quiet places, avoid crowds");
        else if (socialVal[0] < 70) styleDesc.push("Mix of popular spots and local secrets");
        else styleDesc.push("Trendy spots, viral locations, social vibes");

        // Budget Logic (New)
        if (formData.budget === 1) styleDesc.push("Budget-friendly options, street food, saving costs");
        else if (formData.budget === 2) styleDesc.push("Mid-range comfort, good value");
        else if (formData.budget === 3) styleDesc.push("Luxury experience, fine dining, premium spots");

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
        setIsDone(false);
        // Reset steps for visual effect
        setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));

        const finalStyle = generateStyleString();
        const payload = {
            ...formData,
            destination: isAutoDest ? 'SURPRISE' : formData.destination,
            style: finalStyle,
            start_date: isFlexibleDate ? new Date().toISOString().split('T')[0] : formData.start_date,
            budget: 0,
            user_id: user?.id || "",
        };

        try {
            // STEP 1: ASYNC GENERATION REQUEST
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8889/api/v1'}/trips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Try to parse error message
                const errData = await response.json().catch(() => ({}));
                // Check for quota error
                if (response.status === 403 && errData.error === 'quota_exceeded') {
                    toast.error("Trip limit reached! 🚫", {
                        description: errData.message || "Upgrade to Pro for unlimited trips!"
                    });
                    setIsStreaming(false);
                    return;
                }
                throw new Error(errData.message || "Failed to start trip generation");
            }

            const data = await response.json();

            setIsDone(true);

            console.log("🚀 Trip Started!", data);
            toast.success("Trip Drafted! Your itinerary is ready ✨", {
                description: "Taking you to your trip page now."
            });

            // Redirect after allowing completion animation to breathe
            setTimeout(() => {
                router.push(`/trips/${data.trip_id}`);
            }, 1000);

        } catch (error: any) {
            console.error("Trip Creator Error:", error);
            setIsStreaming(false);
            toast.error("Something went wrong", {
                description: error.message || "Please try again later."
            });
        }
    };

    if (isStreaming) {
        return <LoadingOverlay steps={steps} isDone={isDone} />;
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

                {/* TRAVEL DNA BADGE */}
                {userPace && (
                    <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-500">
                        <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200 gap-1.5 py-1 px-2">
                            <Gauge className="w-3 h-3" />
                            Travel DNA Active: <span className="font-bold">{userPace} Pace</span>
                        </Badge>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">

                    <DestinationSection
                        origin={formData.origin}
                        setOrigin={(val) => {
                            setFormData({ ...formData, origin: val });
                            localStorage.setItem('lastOrigin', val);
                        }}
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

                    {/* BUDGET SECTION (New) */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                            <label className="text-base font-semibold text-slate-700">Budget Range 💰</label>
                            <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                                {formData.budget === 0 ? "Flexible / Not Set" :
                                    formData.budget === 1 ? "Budget Friendly" :
                                        formData.budget === 2 ? "Mid-Range" : "Luxury Splurge"}
                            </span>
                        </div>
                        <div className="pt-2 px-1">
                            {/* Using a simple 0-3 scale for now since actual currency is complex */}
                            <Slider
                                value={[formData.budget]}
                                onValueChange={(val) => setFormData({ ...formData, budget: val[0] })}
                                max={3}
                                step={1}
                                className="py-2"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                                <span>Any</span>
                                <span>$</span>
                                <span>$$</span>
                                <span>$$$</span>
                            </div>
                        </div>
                    </div>

                    <VibeSection
                        socialVal={socialVal}
                        setSocialVal={setSocialVal}
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