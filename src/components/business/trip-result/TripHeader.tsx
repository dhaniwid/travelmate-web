import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Share2, Printer, Loader2, Trash2, MapPin, Sparkles, History, Sliders, Utensils } from 'lucide-react';
import { TripResponse, UserPreferences } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { getSmartImage } from '@/utils/image-generator';
import { useEffect } from 'react';

interface TripHeaderProps {
    data: TripResponse;
    totalBudget: number;
    isHistoryView?: boolean;
    onOpenCustomize?: () => void;
    onSaveSuccess?: () => void;
    preferences?: UserPreferences;
}

export default function TripHeader({
    data,
    totalBudget,
    isHistoryView = false,
    onOpenCustomize,
    onSaveSuccess,
    preferences
}: TripHeaderProps) {
    const { trip, plan } = data;
    const router = useRouter();
    const { getToken } = useAuth();

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [heroImage, setHeroImage] = useState<string>("");

    useEffect(() => {
        // Using dynamic destination image
        setHeroImage(getSmartImage(trip.destination, 'hero'));
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

            const payload = {
                id: trip.id,
                user_id: trip.user_id,
                destination: trip.destination,
                origin: trip.origin,
                start_date: trip.start_date,
                trip_days: trip.trip_days,
                style: trip.style,
                budget: trip.budget,
                plan_data: plan
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
    const formattedDate = trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    }) : 'Oct 12';

    const startDateObj = trip.start_date ? new Date(trip.start_date) : new Date();
    const endDateObj = new Date(startDateObj.getTime() + (trip.trip_days - 1) * 24 * 60 * 60 * 1000);
    const endDate = endDateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden group shadow-2xl">
            {/* 1. CINEMATIC HERO IMAGE */}
            <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[10s] ease-out bg-slate-900"
                style={{ backgroundImage: heroImage ? `url('${heroImage}')` : 'none' }}
            />

            {/* 2. THE OVERLAY (Cinematic Gradient) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* 3. TOP ACTIONS (Share, Print) */}
            <div className="absolute top-6 right-8 flex gap-3 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.print()}
                    className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 transition-all active:scale-95"
                >
                    <Printer className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 transition-all active:scale-95"
                >
                    <Share2 className="w-5 h-5" />
                </Button>
            </div>

            {/* 4. BOTTOM CONTENT (Title & Meta) */}
            <div className="absolute bottom-24 md:bottom-28 left-0 right-0 p-8 md:p-12 z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="flex-1">
                    {/* Pills Row (Glassmorphism) */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[0.7rem] font-black uppercase tracking-widest border border-white/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{preferences?.budgetTier || trip.budget_range || trip.budget} Tier</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[0.7rem] font-black uppercase tracking-widest border border-white/20">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{trip.origin}</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-2xl">
                        {trip.destination}
                    </h1>

                    <p className="text-white/70 text-lg md:text-xl font-medium tracking-tight flex items-center gap-2">
                        {formattedDate} — {endDate}
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        {trip.trip_days} Days Journey
                    </p>
                </div>

                {/* Primary Actions (Right aligned) */}
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={onOpenCustomize}
                        className="rounded-full bg-[#42707D] hover:bg-[#355963] text-white font-bold h-14 md:h-16 px-8 shadow-2xl transition-all active:scale-[0.98] text-lg border border-teal-500/30"
                    >
                        <Sliders className="w-5 h-5 mr-3" />
                        Customize
                    </Button>

                    {!isHistoryView && !isSaved && (
                        <Button
                            id="save-trip-btn"
                            onClick={handleSaveTrip}
                            disabled={isSaving}
                            className="rounded-full bg-white hover:bg-slate-200 text-black font-bold h-14 md:h-16 px-8 shadow-2xl transition-all active:scale-[0.98] text-lg"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> :
                                <Save className="w-5 h-5 mr-3" />}
                            Secure Journey
                        </Button>
                    )}

                    {isHistoryView && (
                        <Button
                            variant="ghost"
                            onClick={handleDeleteTrip}
                            disabled={isDeleting}
                            className="h-16 px-6 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors font-bold text-lg"
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Gradient Border Accent */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400/80 via-white/20 to-orange-400/80" />
        </div>
    );
}