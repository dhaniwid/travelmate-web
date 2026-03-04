'use client';

import React, { useState, useEffect } from 'react';
import { TripRequest } from '@/types';
import { tripService } from '@/services/trip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles, Gauge } from 'lucide-react';
import { toast } from "sonner";
import { ProgressStep } from './GenerationProgress';
import { useUser, useAuth } from "@clerk/nextjs";
import PremiumBadge from '@/components/ui/PremiumBadge';

// Import Modular Components
import DestinationSection from './create-trip/DestinationSection';
import DateDurationSection from './create-trip/DateDurationSection';
import VibeSection from './create-trip/VibeSection';
import LoadingOverlay from './create-trip/LoadingOverlay';
import { generateTripAction } from '@/actions/trip';
import { trackEventAction } from '@/actions/analytics';
import QuotaBanner from '@/components/ui/QuotaBanner';
import DiscoveryTeaser from './create-trip/DiscoveryTeaser';

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
    const [showQuotaBanner, setShowQuotaBanner] = useState(false);
    const [quotaMessage, setQuotaMessage] = useState<string | undefined>();
    const [quotaAction, setQuotaAction] = useState({ label: "Upgrade to PRO", href: "/pricing" });

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
                if (!token) return;

                // Use tripService to avoid duplicate /api/v1 or base URL issues
                const data = await tripService.getUserPreferences(token);
                setUserPace(data.pace || 'BALANCED');
            } catch (error) {
                console.log('Travel DNA not set, using default pace');
            }
        };
        if (user?.id) fetchPreferences();
    }, [user?.id, getToken]);

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

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- SUBMISSION LOGIC ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return; // Guard
        setIsSubmitting(true);

        // 🛡️ SECURITY: Guest Quota (1 Trip Limit)
        if (!user) {
            const guestUsage = localStorage.getItem('miru_guest_usage');
            if (guestUsage && parseInt(guestUsage) >= 1) {
                setQuotaMessage("Guest trip limit reached! Discovering more destinations requires a free account.");
                setQuotaAction({ label: "Create Account", href: "/sign-up" });
                setShowQuotaBanner(true);
                setIsSubmitting(false); // Enable again so they can fix account/quota
                return;
            }
        }

        // Validasi Origin
        if (!formData.origin.trim()) {
            toast.error("Please enter a starting point (Origin)");
            setIsSubmitting(false);
            return;
        }

        if (!isAutoDest && !formData.destination) {
            toast.error("Where are we going? Or choose 'Surprise Me'!");
            setIsSubmitting(false);
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

        // Track trip start
        trackEventAction('trip_started', {
            destination: payload.destination,
            is_guest: !user,
            days: payload.trip_days
        });

        try {
            // STEP 1: ASYNC GENERATION REQUEST
            // Use tripService.createTrip instead of manual fetch
            const token = await getToken();
            const data = await tripService.createTrip(payload, token);

            // Track successful trip generation
            trackEventAction('trip_success', {
                trip_id: data.trip_id,
                destination: payload.destination,
                is_guest: !user
            });

            setIsDone(true);

            console.log("🚀 Trip Started!", data);
            toast.success("Trip Drafted! Your itinerary is ready ✨", {
                description: "Taking you to your trip page now."
            });

            // Store ID if anonymous (Preview-First Flow)
            if (!user) {
                localStorage.setItem('pending_trip_id', data.trip_id);
                localStorage.setItem('pending_claim_trip_id', data.trip_id); // For transfer logic
                localStorage.setItem('miru_guest_usage', '1'); // Set guest limit
            }

            // Redirect after allowing completion animation to breathe
            setTimeout(() => {
                router.push(`/trips/${data.trip_id}`);
            }, 1000);

        } catch (error: any) {
            // Check for quota error (Axios style)
            if (error.response?.status === 403 && error.response?.data?.code === 'quota_exceeded') {
                trackEventAction('paywall_shown', { trigger: 'quota_limit' });
                setQuotaMessage(error.response.data.message || "Monthly trip generation limit reached. Upgrade to PRO for unlimited planning.");
                setQuotaAction({ label: "Upgrade to PRO", href: "/pricing" });
                setShowQuotaBanner(true);
                setIsStreaming(false);
                return;
            }

            // Track trip generation error
            trackEventAction('trip_error', {
                error: (error as Error).message || "Unknown error",
                destination: payload.destination,
                is_guest: !user
            });

            console.error("Trip Creator Error:", error);
            setIsStreaming(false);
            setIsSubmitting(false); // Enable button again on error
            toast.error("Something went wrong", {
                description: error.message || "Please try again later."
            });
        }
    };

    if (isStreaming) {
        return <LoadingOverlay steps={steps} isDone={isDone} />;
    }

    return (
        <Card className="w-full max-w-xl mx-auto border-none shadow-2xl bg-white/90 backdrop-blur-sm ring-1 ring-slate-200/50 overflow-x-hidden">
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                    Design Your Trip 🎨
                </CardTitle>
                <CardDescription>
                    No complex forms. Just tell us the vibe.
                </CardDescription>

                {/* TRAVEL DNA BADGE */}
                {userPace && (
                    <div className="flex items-center gap-2 mt-2">
                        <PremiumBadge text={`Travel DNA Active: ${userPace} Pace`} />
                    </div>
                )}

                {/* GUEST MODE BANNER */}
                {!user && (
                    <div className="mt-4 p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="mt-0.5">
                            <Sparkles className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-teal-900 leading-tight">
                                Try Miru for free! ✨
                            </p>
                            <p className="text-[10px] text-teal-800/70 font-medium leading-relaxed">
                                You're generating a preview. Sign in later to save your trip!
                            </p>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                <QuotaBanner
                    isVisible={showQuotaBanner}
                    onClose={() => setShowQuotaBanner(false)}
                    message={quotaMessage}
                    actionLabel={quotaAction.label}
                    actionHref={quotaAction.href}
                />
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

                    {/* Discovery Teaser — shows RAG local whispers as user types ✨ */}
                    {!isAutoDest && (
                        <DiscoveryTeaser destination={formData.destination} />
                    )}

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

                    <Button type="submit" disabled={isSubmitting || isStreaming}
                        className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-lg py-6 rounded-xl shadow-lg transition-all hover:scale-[1.01]"
                    >
                        {isSubmitting || isStreaming ? <Loader2 className="animate-spin" /> : "Plan My Trip ✨"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}