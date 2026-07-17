'use client';

import React, { useState } from 'react';
import { Share2, ChevronLeft, Loader2, Sparkles, Trash2, Printer } from 'lucide-react';
import { TripResponse, UserPreferences } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth, UserButton } from '@clerk/nextjs';
import { trackEventAction } from '@/actions/analytics';
import { formatDate } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { generateTripPDF } from '@/lib/pdfGenerator';
import { tripService } from '@/services/trip';
import LandmarkImage from '@/components/business/landmark/LandmarkImage';
import UpgradeModal from '@/components/ui/UpgradeModal';

function toSlug(destination: string): string {
    return destination.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
}

interface TripHeaderProps {
    data: TripResponse;
    planState?: any;
    totalBudget: number;
    isHistoryView?: boolean;
    onSaveSuccess?: () => void;
    preferences?: UserPreferences;
    compact?: boolean;
    onShare?: () => void;
}

const BUDGET_LABEL: Record<number, string> = { 1: 'Backpacker', 2: 'Comfort', 3: 'Premium' };

export default function TripHeader({
    data,
    planState,
    totalBudget,
    isHistoryView = false,
    onSaveSuccess,
    preferences,
    onShare,
}: TripHeaderProps) {
    const { trip, plan } = data;
    const activePlan = planState || plan;
    const router = useRouter();
    const { getToken, userId } = useAuth();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => { setMounted(true); }, []);

    const [isSaving, setIsSaving] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [isSaved, setIsSaved] = useState(data.is_saved || isHistoryView || false);
    const [isDeleting, setIsDeleting] = useState(false);

    React.useEffect(() => {
        setIsSaved(data.is_saved || isHistoryView || false);
    }, [data.is_saved, isHistoryView]);

    const handleSaveTrip = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            if (!token) {
                const tripId = trip.id || (trip as any).ID || '';
                if (tripId) localStorage.setItem('pending_trip_id', tripId);
                router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`);
                return;
            }
            const tripId = trip.id || (trip as any).ID || '';
            if (!tripId) { toast.error('Trip ID is missing.'); return; }
            await tripService.saveTrip({
                id: tripId,
                user_id: userId || '',
                destination: trip.destination,
                origin: trip.origin,
                start_date: trip.start_date ?? '',
                trip_days: trip.trip_days,
                style: trip.style,
                budget: trip.budget,
                budget_range: trip.budget_range || '',
                plan_data: activePlan,
            } as any, token);
            setIsSaved(true);
            onSaveSuccess?.();
            toast.success('Trip secured!');
        } catch (error: any) {
            if (error.response?.status === 403 && error.response?.data?.error === 'quota_exceeded') {
                trackEventAction('paywall_shown', { trigger: 'trip_save' });
                toast.error('Limit Reached 🚫', { description: error.response.data.message });
                return;
            }
            toast.error('Failed to save trip.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTrip = async () => {
        if (!confirm('Are you sure you want to delete this trip?')) return;
        setIsDeleting(true);
        try {
            const token = await getToken();
            await tripService.deleteTrip(trip.id, token);
            toast.success('Trip deleted');
            router.push('/history');
        } catch {
            toast.error('Failed to delete');
            setIsDeleting(false);
        }
    };

    const handleExportPDF = async () => {
        const toastId = toast.loading('Verifying PRO Status...');
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            await tripService.verifyProStatus(trip.id, token);
            trackEventAction('pdf_downloaded', { trip_id: trip.id, destination: trip.destination });
            toast.loading('Generating PDF...', { id: toastId });
            await generateTripPDF('trip-content', trip.destination || 'Trip');
            toast.dismiss(toastId);
            toast.success('PDF Generated!');
        } catch (error: any) {
            toast.dismiss(toastId);
            if (error.response?.status === 403) {
                trackEventAction('paywall_shown', { trigger: 'pdf_export' });
                toast.error('Premium Feature 💎', {
                    description: 'Upgrade to Miru PRO to export PDF!',
                    action: { label: 'Upgrade', onClick: () => setShowUpgrade(true) },
                });
                return;
            }
            toast.error('Generation Failed');
        }
    };

    const handleShare = () => {
        if (onShare) { onShare(); return; }
        if (typeof window === 'undefined') return;
        const url = `${window.location.origin}/share/${trip.id}`;
        navigator.clipboard?.writeText(url);
        toast.success('Link copied! 🔗');
    };

    // Date chips
    const startDateObj = trip.start_date ? new Date(trip.start_date) : null;
    let dateChip = '';
    if (startDateObj && !isNaN(startDateObj.getTime())) {
        const s = formatDate(startDateObj);
        if (trip.trip_days > 0) {
            const end = new Date(startDateObj);
            end.setDate(startDateObj.getDate() + (trip.trip_days - 1));
            dateChip = `${s} – ${formatDate(end)}`;
        } else {
            dateChip = s;
        }
    }

    const budgetLabel =
        BUDGET_LABEL[trip.budget as number] ||
        preferences?.budgetTier ||
        trip.budget_range ||
        'Comfort';

    const chips = [
        budgetLabel,
        trip.trip_days ? `${trip.trip_days} hari` : null,
        dateChip || null,
    ].filter(Boolean) as string[];

    const isOwner = trip.user_id === userId;

    return (
        <>
        <div className="bg-[#0A1628] px-5 pt-14 pb-4">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={() => {
                        const referrer = typeof document !== 'undefined' ? document.referrer : '';
                        const fromSameOrigin = !!referrer && new URL(referrer).origin === window.location.origin;
                        if (fromSameOrigin) {
                            router.back();
                        } else {
                            router.push('/dashboard');
                        }
                    }}
                    className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition-colors active:scale-95"
                    aria-label="Kembali"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <div className="flex items-center gap-2">
                    {/* Save button — only if not owner/saved */}
                    {!(isSaved || isOwner) && (
                        <button
                            onClick={handleSaveTrip}
                            disabled={isSaving}
                            className="w-9 h-9 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 flex items-center justify-center transition-colors active:scale-95"
                            aria-label="Simpan trip"
                        >
                            {isSaving
                                ? <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                                : <Sparkles className="w-4 h-4 text-teal-400" />
                            }
                        </button>
                    )}

                    {/* Share */}
                    <button
                        onClick={handleShare}
                        className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition-colors active:scale-95"
                        aria-label="Bagikan trip"
                    >
                        <Share2 className="w-4 h-4 text-white" />
                    </button>

                    {/* More — PDF + Delete */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition-colors active:scale-95" aria-label="Opsi lainnya">
                                <Printer className="w-4 h-4 text-white" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-[#0A1628] border-white/10 rounded-2xl p-1.5 shadow-xl">
                            <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer text-white/80 focus:bg-white/8 rounded-xl text-sm gap-2">
                                <Printer className="w-4 h-4" /> Export PDF
                            </DropdownMenuItem>
                            {isHistoryView && (
                                <DropdownMenuItem
                                    onClick={handleDeleteTrip}
                                    className="cursor-pointer text-rose-400 focus:bg-rose-500/10 rounded-xl text-sm gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Hapus Trip
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Avatar → profile (desktop only) */}
                    {mounted && (
                        <div className="hidden md:block">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    )}
                </div>
            </div>

            {/* Landmark image */}
            <LandmarkImage
                slug={toSlug(trip.destination)}
                mood="landscape"
                size="header"
                alt={`Landmark ${trip.destination}`}
                className="!w-full !h-48 !rounded-xl mb-4"
            />

            {/* Eyebrow */}
            <p className="text-[11px] uppercase tracking-widest text-white/45 mb-1">
                {trip.destination}{trip.trip_days ? ` · ${trip.trip_days} hari` : ''}
            </p>

            {/* Trip name */}
            <h1 className="text-[20px] font-medium text-white leading-snug mb-3">
                {activePlan?.tagline || trip.destination || 'Perjalananku'}
            </h1>

            {/* Chips */}
            {chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {chips.map((chip, i) => (
                        <span
                            key={i}
                            className="text-[11px] text-white/60 bg-white/8 px-3 py-1 rounded-full"
                        >
                            {chip}
                        </span>
                    ))}
                </div>
            )}
        </div>
        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
        </>
    );
}
