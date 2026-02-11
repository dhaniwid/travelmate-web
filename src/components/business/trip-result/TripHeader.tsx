import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Share2, Printer, Loader2, Trash2, MapPin, Sparkles, History, Sliders, Utensils, ChevronLeft } from 'lucide-react';
import { TripResponse, UserPreferences } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { fetchUnsplashImage } from '@/services/imageService';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface TripHeaderProps {
    data: TripResponse;
    planState?: any; // Add this to support state-managed plans
    totalBudget: number;
    isHistoryView?: boolean;
    onOpenCustomize?: () => void;
    onSaveSuccess?: () => void;
    preferences?: UserPreferences;
    compact?: boolean;
}

export default function TripHeader({
    data,
    planState,
    totalBudget,
    isHistoryView = false,
    onOpenCustomize,
    onSaveSuccess,
    preferences,
    compact = false
}: TripHeaderProps) {
    const { trip, plan } = data;
    const activePlan = planState || plan; // Use the latest plan from state if available
    const router = useRouter();
    const { getToken, userId } = useAuth();

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(data.is_saved || isHistoryView || false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [heroImage, setHeroImage] = useState<string>("");

    // Sync isSaved state if data prop changes
    useEffect(() => {
        setIsSaved(data.is_saved || isHistoryView || false);
    }, [data.is_saved, isHistoryView]);

    useEffect(() => {
        let isMounted = true;
        const loadHero = async () => {
            const url = await fetchUnsplashImage(trip.destination);
            if (isMounted) {
                if (url) {
                    setHeroImage(url);
                } else {
                    // Fallback handled by CSS if heroImage is empty
                    // Or we can set a fallback state here if we want a specific behavior
                }
            }
        };
        loadHero();
        return () => { isMounted = false; };
    }, [trip.destination]);

    const isFinalized = isHistoryView || isSaved;

    const handleSaveTrip = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            if (!token) {
                toast.error("You must be logged in to save a trip.");
                return;
            }

            const finalUserId = userId || (trip as any).user_id || "";

            if (!finalUserId) {
                console.warn("Saving trip without User ID (Token was present, but userId is empty)");
            }

            // [FIX] Ensure trip ID is present (handle both id and ID just in case)
            const tripId = trip.id || (trip as any).ID || "";
            if (!tripId) {
                toast.error("Trip ID is missing. Cannot save.");
                console.error("Missing Trip ID. Trip Object Contents:", JSON.stringify(trip));
                console.error("Full Data Object:", JSON.stringify(data));
                return;
            }

            const payload = {
                id: tripId,
                user_id: finalUserId,
                destination: trip.destination,
                origin: trip.origin,
                start_date: trip.start_date,
                trip_days: trip.trip_days,
                style: trip.style,
                budget: trip.budget,
                plan_data: activePlan
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to save trip");
            }

            setIsSaved(true);
            onSaveSuccess?.();
            toast.success("Trip secured! It's now in your history.", {
                action: {
                    label: "View History",
                    onClick: () => router.push('/history')
                }
            });

        } catch (error) {
            console.error("Save Error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save trip.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTrip = async () => {
        if (!confirm("Are you sure you want to delete this trip?")) return;
        setIsDeleting(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${trip.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Trip deleted");
                router.push('/history');
            } else {
                throw new Error();
            }
        } catch (e) {
            toast.error("Failed to delete");
            setIsDeleting(false);
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/trips/${trip.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Trip link copied to clipboard!");
    };

    // Calculate Dates
    const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const startDateObj = parseDate(trip.start_date);
    const formattedDate = startDateObj ? startDateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    }) : 'Date TBD';

    let endDate = '';
    if (startDateObj && trip.trip_days > 0) {
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + (trip.trip_days - 1));
        endDate = endDateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    return (
        <div className={cn(
            "relative w-full overflow-hidden group transition-all duration-500 rounded-2xl shadow-2xl",
            "h-80 md:h-96"
        )}>
            {/* 1. HERO IMAGE with Ken Burns effect */}
            <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-[15s] ease-out bg-slate-900"
                style={{ backgroundImage: heroImage ? `url('${heroImage}')` : 'none' }}
            />

            {/* 2. STRONGER GRADIENT OVERLAY + VIGNETTE */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.4)]" />

            {/* 3. TOP NAVIGATION (Minimal - Back + Share only) */}
            <div className="absolute top-6 left-6 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => isHistoryView ? router.push('/history') : router.back()}
                    className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 transition-all active:scale-95 shadow-lg"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
            </div>

            <div className="absolute top-6 right-6 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 transition-all active:scale-95 shadow-lg"
                >
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>

            {/* 4. CONTENT (Bottom) */}
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="flex-1">
                    {/* Budget Badge (Small, Teal) */}
                    <div className="inline-flex items-center gap-1.5 bg-teal-500 text-white px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-widest mb-3 shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        <span>{preferences?.budgetTier || trip.budget_range || 'Budget'} Tier</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
                        {trip.destination || 'Trip to Unknown'}
                    </h1>

                    <p className="text-white/80 text-base md:text-lg font-medium tracking-tight flex items-center gap-2">
                        {formattedDate}
                        {endDate && ` — ${endDate}`}
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                        {trip.trip_days || 0} Days Journey
                    </p>
                </div>

                {/* Primary CTA + Edit Link */}
                <div className="flex flex-col items-start md:items-end gap-2">
                    {/* Show 'Secure Journey' if NOT saved */}
                    {!(isSaved || (trip.user_id && trip.user_id === userId)) && (
                        <Button
                            id="save-trip-btn"
                            onClick={handleSaveTrip}
                            disabled={isSaving}
                            className="rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold h-12 px-8 shadow-xl transition-all active:scale-[0.98] text-sm"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> :
                                <Sparkles className="w-4 h-4 mr-2" />}
                            Secure Journey
                        </Button>
                    )}

                    {/* Edit Link (Subtle) */}
                    <button
                        onClick={onOpenCustomize}
                        className="text-white/60 hover:text-white text-sm font-medium transition-colors underline underline-offset-2"
                    >
                        Edit Trip Details
                    </button>

                    {/* Delete (only in history view) */}
                    {isHistoryView && trip.user_id === userId && (
                        <Button
                            variant="ghost"
                            onClick={handleDeleteTrip}
                            disabled={isDeleting}
                            className="h-10 px-4 text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}