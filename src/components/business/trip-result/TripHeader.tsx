import React, {useState} from 'react';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Save, Share2, Printer, Loader2, CheckCircle2, Trash2, MapPin, Sparkles, History} from 'lucide-react';
import {TripResponse} from '@/types';
import {useRouter} from 'next/navigation';
import {toast} from "sonner";
import {useAuth} from "@clerk/nextjs";

interface TripHeaderProps {
    data: TripResponse;
    totalBudget: number;
    isHistoryView?: boolean;
}

export default function TripHeader({data, isHistoryView = false}: TripHeaderProps) {
    const {trip, plan} = data;
    const router = useRouter();
    const {getToken} = useAuth();

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isFinalized = isHistoryView || isSaved;

    const getCityImage = (city: string) => {
        return `https://source.unsplash.com/1600x900/?${city},travel,landscape`;
    };

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
                headers: {'Authorization': `Bearer ${token}`}
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

    return (
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 mb-8 group">

            {/* 1. BACKGROUND IMAGE & OVERLAY */}
            <div className="absolute inset-0 bg-slate-900">
                {/* Kita gunakan Unsplash Source sebagai placeholder visual cantik */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-[3s]"
                    style={{backgroundImage: `url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1920&q=80')`}} // Default Bali/Tropical vibe, bisa diganti dynamic
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"/>
            </div>

            {/* 2. CONTENT CONTAINER */}
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6 mt-20">

                {/* LEFT: Trip Info */}
                <div className="space-y-4 text-white">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        {!isFinalized ? (
                            <Badge
                                className="bg-amber-500/20 backdrop-blur-md text-amber-200 border border-amber-500/50 px-3 py-1 text-xs uppercase tracking-widest font-bold">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mr-2"/>
                                Draft Mode
                            </Badge>
                        ) : (
                            <Badge
                                className="bg-emerald-500/20 backdrop-blur-md text-emerald-200 border border-emerald-500/50 px-3 py-1 text-xs uppercase tracking-widest font-bold">
                                <CheckCircle2 className="w-3 h-3 mr-2 text-emerald-400"/>
                                Saved Trip
                            </Badge>
                        )}

                        {/* Days Badge */}
                        <Badge variant="outline" className="text-white border-white/30 backdrop-blur-sm">
                            {trip.trip_days} Days
                        </Badge>
                    </div>

                    {/* Title */}
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-2 drop-shadow-lg">
                            {trip.destination}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-slate-300 font-medium">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-teal-400"/>
                                <span>From {trip.origin}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-500"/>
                            <div className="flex items-start gap-3 mt-4">
                                <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 shrink-0"/>

                                {/* Container Tags dengan flex-wrap agar turun ke bawah jika penuh */}
                                <div className="flex flex-wrap gap-2">
                                    {trip.style ? (
                                        trip.style.split(',').map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-slate-100 text-sm backdrop-blur-sm font-medium leading-relaxed hover:bg-white/20 transition-colors"
                                            >
                                                {tag.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 italic">General Trip</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-3">

                    {/* Save / Unlock Button */}
                    {!isHistoryView ? (
                        !isSaved ? (
                            <Button
                                onClick={handleSaveTrip}
                                disabled={isSaving}
                                size="lg"
                                className="bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all font-bold h-14 px-8 rounded-full shadow-xl shadow-black/20"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> :
                                    <Save className="w-5 h-5 mr-2 text-blue-600"/>}
                                Save & Unlock Trip
                            </Button>
                        ) : (
                            <Button
                                onClick={() => router.push('/history')}
                                size="lg"
                                className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 h-14 px-8 rounded-full"
                            >
                                <History className="w-5 h-5 mr-2"/>
                                View in History
                            </Button>
                        )
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={handleDeleteTrip}
                            disabled={isDeleting}
                            className="h-12 px-6 rounded-full"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> :
                                <Trash2 className="w-4 h-4 mr-2"/>}
                            Delete
                        </Button>
                    )}

                    {/* Premium Buttons (Share/Print) - Only if finalized */}
                    {isFinalized && (
                        <div className="flex gap-2">
                            <Button size="icon"
                                    className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10">
                                <Share2 className="w-5 h-5"/>
                            </Button>
                            <Button size="icon"
                                    className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
                                    onClick={() => window.print()}>
                                <Printer className="w-5 h-5"/>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}