import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Share2, Printer, Loader2, Trash2, MapPin, Sparkles, History, Sliders } from 'lucide-react';
import { TripResponse } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

interface TripHeaderProps {
    data: TripResponse;
    totalBudget: number;
    isHistoryView?: boolean;
    onOpenCustomize?: () => void;
}

export default function TripHeader({ data, totalBudget, isHistoryView = false, onOpenCustomize }: TripHeaderProps) {
    const { trip, plan } = data;
    const router = useRouter();
    const { getToken } = useAuth();

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
        <div className="relative w-full h-[600px] mb-32 group">
            {/* 1. HERO IMAGE (Background Layer) */}
            <div className="absolute top-0 left-0 w-full h-[450px] z-0 rounded-[2.5rem] overflow-hidden shadow-xl">
                <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[5s]"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Secondary Actions (Floating on top of image) */}
                <div className="absolute top-6 right-8 flex gap-3 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.print()}
                        className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 transition-all active:scale-95"
                    >
                        <Printer className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleShare}
                        className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 transition-all active:scale-95"
                    >
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* 2. FLOATING SUMMARY CARD (Foreground Layer) */}
            <div className="absolute top-[450px] left-1/2 -translate-x-1/2 -translate-y-[40%] w-[90%] max-w-3xl bg-white rounded-[2rem] p-8 md:p-10 z-10 shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-slate-50">
                <div className="flex flex-col items-center text-center">
                    {/* Title & Dates */}
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2 tracking-tight">
                            Trip to {trip.destination}
                        </h1>
                        <p className="text-slate-500 font-medium text-lg">
                            {formattedDate} - {endDate} • {trip.trip_days} Days
                        </p>
                    </div>

                    {/* Pills Row */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2.5 rounded-full text-sm font-bold border border-teal-100/50">
                            <Sparkles className="w-4 h-4" />
                            <span>{trip.budget} Tier</span>
                        </div>
                        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2.5 rounded-full text-sm font-bold border border-teal-100/50">
                            <MapPin className="w-4 h-4" />
                            <span>From {trip.origin}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2.5 rounded-full text-sm font-bold border border-teal-100/50">
                            <History className="w-4 h-4" />
                            <span>{trip.style || 'Leisure'}</span>
                        </div>
                    </div>

                    {/* Primary Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <Button
                            onClick={onOpenCustomize}
                            className="rounded-full bg-[#42707D] hover:bg-[#355963] text-white font-bold h-16 px-10 shadow-lg shadow-teal-900/10 transition-all active:scale-[0.98] text-lg"
                        >
                            <Sliders className="w-5 h-5 mr-3" />
                            Customize Trip
                        </Button>

                        {!isHistoryView && !isSaved && (
                            <Button
                                onClick={handleSaveTrip}
                                disabled={isSaving}
                                className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-16 px-10 shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98] text-lg"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> :
                                    <Save className="w-5 h-5 mr-3" />}
                                Save & Unlock
                            </Button>
                        )}

                        {isHistoryView && (
                            <Button
                                variant="ghost"
                                onClick={handleDeleteTrip}
                                disabled={isDeleting}
                                className="h-16 px-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors font-bold text-lg"
                            >
                                <Trash2 className="w-5 h-5 mr-3" />
                                Delete
                            </Button>
                        )}
                    </div>

                    {/* Gradient Border Detail */}
                    <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-orange-400 rounded-full opacity-80 mt-10" />
                </div>
            </div>
        </div>
    );
}