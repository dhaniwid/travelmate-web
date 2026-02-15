'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    MapPin as MapPinIcon,
    Calendar as CalendarIcon,
    Gauge as GaugeIcon,
    Printer as PrinterIcon,
    Share2 as ShareIcon,
    Trash2 as TrashIcon,
    Sparkles as SparklesIcon,
    ChevronLeft as ChevronLeftIcon,
    MoreHorizontal as MoreHorizontalIcon,
    Loader2 as LoaderIcon,
    Wallet,
} from 'lucide-react';
import { TripResponse, UserPreferences } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { trackEventAction } from '@/actions/analytics';
import { useSubscription } from '@/hooks/useSubscription';
import { fetchUnsplashImage } from '@/services/imageService';
import { cn, formatDate } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { generateTripPDF } from '@/lib/pdfGenerator';
import { tripService } from '@/services/trip';

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
    const activePlan = planState || plan;
    const router = useRouter();
    const { getToken, userId } = useAuth();
    const { subscription } = useSubscription();
    const isPro = subscription?.subscription_tier === 'PRO';

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(data.is_saved || isHistoryView || false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [heroImage, setHeroImage] = useState<string>("");
    const [showPremiumInfo, setShowPremiumInfo] = useState(false);

    useEffect(() => {
        setIsSaved(data.is_saved || isHistoryView || false);
    }, [data.is_saved, isHistoryView]);

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
                const tripId = trip.id || (trip as any).ID || "";
                if (tripId) {
                    localStorage.setItem('pending_trip_id', tripId);
                }
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
                budget_range: trip.budget_range || "",
                plan_data: activePlan
            };

            await tripService.saveTrip(payload, token);

            setIsSaved(true);
            onSaveSuccess?.();
            toast.success("Trip secured!");
        } catch (error: any) {
            console.error("Save Error:", error);
            if (error.response?.status === 403 && error.response?.data?.error === 'quota_exceeded') {
                trackEventAction('paywall_shown', { trigger: 'trip_save' });
                toast.error("Limit Reached 🚫", { description: error.response.data.message });
                return;
            }
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
            await tripService.deleteTrip(trip.id, token);
            toast.success("Trip deleted");
            router.push('/history');
        } catch (e) {
            toast.error("Failed to delete");
            setIsDeleting(false);
        }
    };

    const handleExportPDF = async () => {
        const toastId = toast.loading("Verifying PRO Status...");
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            await tripService.verifyProStatus(trip.id, token);

            trackEventAction('pdf_downloaded', { trip_id: trip.id, destination: trip.destination });
            toast.loading("Generating High-Fidelity Magazine...", { id: toastId });
            await generateTripPDF('trip-content', trip.destination || 'Trip');

            toast.dismiss(toastId);
            toast.success("PDF Magazine Generated!");
        } catch (error: any) {
            console.error(error);
            toast.dismiss(toastId);

            if (error.response?.status === 403) {
                trackEventAction('paywall_shown', { trigger: 'pdf_export' });
                toast.error("Premium Feature 💎", {
                    description: "Upgrade to Miru PRO to export magazine-style PDFs!",
                    action: {
                        label: "Upgrade",
                        onClick: () => {
                            trackEventAction('upgrade_clicked', { source: 'pdf_paywall' });
                            router.push('/pricing');
                        }
                    }
                });
                return;
            }

            toast.error("Generation Failed", {
                description: "Try again or check your connection."
            });
        }
    };

    const handleShare = () => {
        if (typeof window === "undefined") return;
        const url = `${window.location.origin}/trips/${trip.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
    };

    const startDateObj = trip.start_date ? new Date(trip.start_date) : null;
    let dateRange = 'TBD';

    if (startDateObj && !isNaN(startDateObj.getTime())) {
        const formattedStart = formatDate(startDateObj);

        let formattedEnd = '';
        if (trip.trip_days > 0) {
            const endDateObj = new Date(startDateObj);
            endDateObj.setDate(startDateObj.getDate() + (trip.trip_days - 1));
            formattedEnd = formatDate(endDateObj);
        }

        dateRange = formattedEnd ? `${formattedStart} - ${formattedEnd}` : formattedStart;
    }

    const pace = preferences?.pace || trip.user_preferences?.pace || 'Balanced';

    return (
        <div className={cn(
            "relative w-full overflow-hidden group transition-all duration-500 rounded-3xl shadow-2xl isolate mb-6",
            "h-[28rem] md:h-[32rem]"
        )}>
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-out scale-105 group-hover:scale-110 bg-slate-900"
                style={{ backgroundImage: heroImage ? `url('${heroImage}')` : 'none' }}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />

            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 pdf-exclude">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => isHistoryView ? router.push('/history') : router.back()}
                    className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10 transition-all active:scale-95 shadow-sm"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2">
                    {!(isSaved || (trip.user_id && trip.user_id === userId)) && (
                        <Button
                            onClick={handleSaveTrip}
                            disabled={isSaving}
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-teal-600/80 backdrop-blur-xl text-white hover:bg-teal-700 border border-white/10 transition-all active:scale-95 shadow-sm"
                        >
                            {isSaving ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleShare}
                        className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10 transition-all active:scale-95 shadow-sm"
                    >
                        <ShareIcon className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleExportPDF}
                        className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10 transition-all active:scale-95 shadow-sm group/pdf relative"
                    >
                        <PrinterIcon className="w-4 h-4" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600 border border-white/50"></span>
                        </span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10 transition-all active:scale-95 shadow-sm"
                            >
                                <MoreHorizontalIcon className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-xl border-slate-200 rounded-2xl p-1.5 shadow-xl">
                            <DropdownMenuItem onClick={handleShare} className="cursor-pointer text-slate-700 focus:bg-slate-50">
                                <ShareIcon className="w-4 h-4 mr-2" />
                                Share Link
                            </DropdownMenuItem>
                            {isHistoryView && (
                                <DropdownMenuItem
                                    onClick={handleDeleteTrip}
                                    className="cursor-pointer text-rose-600 focus:bg-rose-50"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <LoaderIcon className="w-4 h-4 mr-2 animate-spin" /> : <TrashIcon className="w-4 h-4 mr-2" />}
                                    Delete Trip
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* PREMIUM INFO BANNER (MODAL OVERLAP FIX) */}
            {showPremiumInfo && !isPro && (
                <div className="absolute top-20 left-6 right-6 z-30 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-white/95 backdrop-blur-xl border border-amber-200 shadow-2xl rounded-2xl p-4 flex items-start gap-4 ring-1 ring-amber-500/20">
                        <div className="bg-amber-100/50 p-2 rounded-xl">
                            <SparklesIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-black text-slate-900 leading-tight">Premium Feature 💎</p>
                            <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                                Customize itinerary with AI is a Miru PRO feature.
                            </p>
                            <div className="flex items-center gap-2 mt-2 pt-1">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        trackEventAction('upgrade_clicked', { source: 'customize_paywall' });
                                        router.push('/pricing');
                                    }}
                                    className="h-8 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 text-[10px] font-bold"
                                >
                                    Upgrade Now
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowPremiumInfo(false)}
                                    className="h-8 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                                >
                                    Maybe Later
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 z-10 flex flex-col justify-end gap-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
                    {trip.destination || 'Trip to Unknown'}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarIcon className="w-4 h-4 text-white/70" />
                        <span className="text-gray-200">{dateRange}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-gray-200">{trip.trip_days} Days</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-white/20" />
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <GaugeIcon className="w-4 h-4 text-white/70" />
                        <span className="text-gray-200 capitalize">{pace}</span>
                    </div>
                    {totalBudget > 0 && <div className="hidden md:block w-px h-4 bg-white/20" />}
                    {totalBudget > 0 && (
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <SparklesIcon className="w-4 h-4 text-teal-400" />
                            <span className="text-gray-200">{preferences?.budgetTier || trip.budget_range || 'Standard'}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <Button
                        onClick={() => {
                            if (isPro) {
                                onOpenCustomize?.();
                            } else {
                                setShowPremiumInfo(!showPremiumInfo);
                                trackEventAction('paywall_shown', { trigger: 'customize_button' });
                            }
                        }}
                        variant="outline"
                        size="sm"
                        className={cn(
                            "w-fit rounded-full bg-white/20 backdrop-blur-md border-white/40 text-white hover:bg-white/30 transition-all active:scale-95 flex items-center gap-2 px-6",
                            !isPro && "border-amber-400/50"
                        )}
                    >
                        <SparklesIcon className={cn("w-3.5 h-3.5", isPro ? "text-teal-400" : "text-amber-400")} />
                        <span>Customize with AI</span>
                        {!isPro && (
                            <Badge variant="outline" className="ml-1 bg-amber-500/20 text-amber-300 border-none px-1.5 py-0 text-[8px] font-black uppercase tracking-tighter">
                                PRO
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}