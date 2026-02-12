import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Share2,
    Loader2,
    Trash2,
    Sparkles,
    ChevronLeft,
    Pencil,
    MoreHorizontal,
    Calendar,
    Gauge,
    Download,
    Lock
} from 'lucide-react';
import { TripResponse, UserPreferences } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { fetchUnsplashImage } from '@/services/imageService';
import { cn, formatDate } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TripHeaderProps {
    data: TripResponse;
    planState?: any;
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

    // State
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(data.is_saved || isHistoryView || false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [heroImage, setHeroImage] = useState<string>("");

    // Sync isSaved state
    useEffect(() => {
        setIsSaved(data.is_saved || isHistoryView || false);
    }, [data.is_saved, isHistoryView]);

    // Load Hero Image
    useEffect(() => {
        let isMounted = true;
        const loadHero = async () => {
            const url = await fetchUnsplashImage(trip.destination);
            if (isMounted && url) setHeroImage(url);
        };
        loadHero();
        return () => { isMounted = false; };
    }, [trip.destination]);

    const handleSaveTrip = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            if (!token) {
                router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`);
                return;
            }

            const finalUserId = userId || (trip as any).user_id || "";
            const tripId = trip.id || (trip as any).ID || "";

            if (!tripId) {
                toast.error("Trip ID is missing.");
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
                if (response.status === 403 && errData.error === 'quota_exceeded') {
                    toast.error("Limit Reached 🚫", { description: errData.message });
                    return;
                }
                throw new Error(errData.message || "Failed to save trip");
            }

            setIsSaved(true);
            onSaveSuccess?.();
            toast.success("Trip secured!");
        } catch (error) {
            console.error("Save Error:", error);
            toast.error("Failed to save trip.");
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



    const handleExportPDF = async () => {
        const toastId = toast.loading("Generating PDF Magazine...");
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${trip.id}/export/pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 403) {
                toast.dismiss(toastId);
                toast.error("Premium Feature 💎", {
                    description: "Upgrade to Miru PRO to export magazine-style PDFs!",
                    action: {
                        label: "Upgrade",
                        onClick: () => router.push('/subscription')
                    }
                });
                return;
            }

            if (!res.ok) throw new Error("Export failed");

            // Handle Blob Download
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Miru_Trip_${trip.destination}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.dismiss(toastId);
            toast.success("PDF Downloaded!");
        } catch (e) {
            console.error(e);
            toast.dismiss(toastId);
            toast.error("Failed to generate PDF");
        }
    };

    const handleShare = () => {
        if (typeof window === "undefined") return;
        const url = `${window.location.origin}/trips/${trip.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
    };

    // Date Calculation
    const startDateObj = trip.start_date ? new Date(trip.start_date) : null;
    let dateRange = 'TBD';

    if (startDateObj && !isNaN(startDateObj.getTime())) {
        const formattedStart = formatDate(startDateObj); // e.g. 11 Feb 2026

        let formattedEnd = '';
        if (trip.trip_days > 0) {
            const endDateObj = new Date(startDateObj);
            endDateObj.setDate(startDateObj.getDate() + (trip.trip_days - 1));
            formattedEnd = formatDate(endDateObj);
        }

        // Use shorter format for range if same month/year
        // But for now, full format is safer and clearer as per requirement
        dateRange = formattedEnd ? `${formattedStart} - ${formattedEnd}` : formattedStart;
    }

    const pace = preferences?.pace || trip.user_preferences?.pace || 'Balanced';

    return (
        <div className={cn(
            "relative w-full overflow-hidden group transition-all duration-500 rounded-3xl shadow-2xl isolate mb-6",
            "h-[28rem] md:h-[32rem]"
        )}>
            {/* 1. HERO IMAGE */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-out scale-105 group-hover:scale-110 bg-slate-900"
                style={{ backgroundImage: heroImage ? `url('${heroImage}')` : 'none' }}
            />

            {/* 2. GRADIENT OVERLAY (Task 1: Updated) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />

            {/* 3. TOP NAVIGATION (Task 2 & 4) */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
                {/* Left: Glassmorphic Back Button (Task 4) */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => isHistoryView ? router.push('/history') : router.back()}
                    className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10 transition-all active:scale-95 shadow-sm"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                {/* Right: Glassmorphic Action Bar (Task 2) */}
                <div className="flex items-center gap-2">
                    {/* Save Button (If not saved) */}
                    {!(isSaved || (trip.user_id && trip.user_id === userId)) && (
                        <Button
                            onClick={handleSaveTrip}
                            disabled={isSaving}
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-teal-500/80 backdrop-blur-xl text-white hover:bg-teal-500 border border-white/10 transition-all active:scale-95 shadow-sm"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </Button>
                    )}

                    {/* Share Button (Existing) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleShare}
                        className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10 transition-all active:scale-95 shadow-sm"
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>

                    {/* Edit Button (New Icon) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onOpenCustomize}
                        className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10 transition-all active:scale-95 shadow-sm"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>

                    {/* More Menu (New Dropdown) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10 transition-all active:scale-95 shadow-sm"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white/95 backdrop-blur-xl border-white/20">
                            {isHistoryView && trip.user_id === userId && (
                                <DropdownMenuItem
                                    onClick={handleDeleteTrip}
                                    disabled={isDeleting}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Trip
                                </DropdownMenuItem>
                            )}

                            {/* EXPORT PDF - Always Visible but Protected */}
                            <DropdownMenuItem
                                onClick={handleExportPDF}
                                className="cursor-pointer text-slate-700 focus:bg-slate-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export as PDF
                                <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-teal-400 to-emerald-500 text-transparent bg-clip-text border border-teal-200 rounded px-1">
                                    PRO
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* 4. HERO CONTENT (Bottom) */}
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 z-10 flex flex-col justify-end gap-3">

                {/* Title (Task 1: Typography) */}
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
                    {trip.destination || 'Trip to Unknown'}
                </h1>

                {/* Metadata Row (Task 3: Refine Metadata Layout) */}
                <div className="flex flex-wrap items-center gap-4 text-white/90">

                    {/* Date & Duration */}
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="w-4 h-4 text-white/70" />
                        <span className="text-gray-200">{dateRange}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-gray-200">{trip.trip_days} Days</span>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-4 bg-white/20" />

                    {/* Pace Tag (Moved from top) */}
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Gauge className="w-4 h-4 text-white/70" />
                        <span className="text-gray-200 capitalize">{pace}</span>
                    </div>

                    {/* Divider */}
                    {totalBudget > 0 && <div className="hidden md:block w-px h-4 bg-white/20" />}

                    {/* Budget Tag */}
                    {totalBudget > 0 && (
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Sparkles className="w-4 h-4 text-teal-300" />
                            <span className="text-gray-200">{preferences?.budgetTier || trip.budget_range || 'Standard'}</span>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}