'use client';

import React, { useState, useEffect } from 'react';
import { TripRequest } from '@/types';
import { tripService } from '@/services/trip';
import { Loader2, Sparkles, MapPin, X, Lock, Minus, Plus, Backpack, Scale, Gem } from 'lucide-react';
import { toast } from "sonner";
import { ProgressStep } from './GenerationProgress';
import { useUser, useAuth } from "@clerk/nextjs";
import { cn } from '@/lib/utils';

// Import Modular Components
import DestinationSection from './create-trip/DestinationSection';
import DateDurationSection from './create-trip/DateDurationSection';
import LoadingOverlay from './create-trip/LoadingOverlay';
import { trackEventAction } from '@/actions/analytics';
import DiscoveryTeaser from './create-trip/DiscoveryTeaser';
import { useSubscription } from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';

interface CreateTripFormProps {
    onSuccess: (data: any) => void;
    onClose?: () => void;
    initialDestination?: string;
    initialIsSurprise?: boolean;
    initialSocialVal?: number;
    initialTheme?: string;
}

const BUDGET_OPTIONS = [
    { value: 1, label: 'Backpacker', icon: Backpack, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/40' },
    { value: 2, label: 'Comfort', icon: Scale, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/40' },
    { value: 3, label: 'Premium', icon: Gem, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/40' },
];

export default function CreateTripForm({
    onSuccess, onClose,
    initialDestination = '', initialIsSurprise = false, initialSocialVal = 50, initialTheme = ''
}: CreateTripFormProps) {
    const { user } = useUser();
    const router = useRouter();
    const { getToken } = useAuth();
    const { subscription } = useSubscription();
    const isPro = subscription?.subscription_tier === 'PRO';

    // --- FORM STATE ---
    const [isAutoDest, setIsAutoDest] = useState(initialIsSurprise);
    const [isFlexibleDate, setIsFlexibleDate] = useState(false);
    const [isDurationFlexible, setIsDurationFlexible] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [showDurationUpgrade, setShowDurationUpgrade] = useState(false);
    const [pax, setPax] = useState(2);

    // socialVal retained for backwards-compat with callers but not shown in UI
    const socialVal = [initialSocialVal];

    // Travel DNA (fetched from backend)
    const [userPace, setUserPace] = useState<string>('BALANCED');

    // Data
    const [formData, setFormData] = useState<TripRequest>({
        origin: '',
        destination: '' + initialDestination,
        start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        trip_days: 3,
        style: initialTheme,
        budget: 2, // default Comfort
    });

    const [savedOrigin] = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('lastOrigin') ?? '' : ''
    );

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

    // Fetch Travel DNA
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const data = await tripService.getUserPreferences(token);
                setUserPace(data.pace || 'BALANCED');
            } catch {
                // use default
            }
        };
        if (user?.id) fetchPreferences();
    }, [user?.id, getToken]);

    const generateStyleString = () => {
        const parts: string[] = [];

        if (userPace === 'RELAXED') parts.push('Very Relaxed, mostly Staycation (60% Hotel time)');
        else if (userPace === 'FAST') parts.push('Fast paced, heavy exploration, maximize every hour');
        else parts.push('Balanced mix of rest and activity');

        if (socialVal[0] < 30) parts.push('Hidden gems, quiet places, avoid crowds');
        else if (socialVal[0] < 70) parts.push('Mix of popular spots and local secrets');
        else parts.push('Trendy spots, viral locations, social vibes');

        if (formData.budget === 1) parts.push('Budget-friendly options, street food, saving costs');
        else if (formData.budget === 2) parts.push('Mid-range comfort, good value');
        else if (formData.budget === 3) parts.push('Luxury experience, fine dining, premium spots');

        const safePax = Math.min(20, Math.max(1, pax));
        if (safePax > 1) parts.push(`Group of ${safePax} people`);

        if (initialTheme) parts.push(`Theme: ${initialTheme}`);

        return parts.join(', ');
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (!user) {
            const guestUsage = localStorage.getItem('miru_guest_usage');
            if (guestUsage && parseInt(guestUsage) >= 1) {
                toast.error('Buat akun gratis untuk melanjutkan!', {
                    description: 'Guest trip sudah digunakan. Sign up untuk generate trip tanpa batas.',
                    action: { label: 'Sign Up', onClick: () => router.push('/sign-up') },
                });
                setIsSubmitting(false);
                return;
            }
        }

        if (!isAutoDest && !formData.destination) {
            toast.error('Destinasi belum diisi. Pilih kota atau coba Surprise Me!');
            setIsSubmitting(false);
            return;
        }

        setIsStreaming(true);
        setIsDone(false);
        setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
        updateStep('meta', 'loading');

        const finalStyle = generateStyleString();
        const resolvedTripDays = isDurationFlexible
            ? (isPro ? 5 : 3)
            : formData.trip_days;

        const payload = {
            ...formData,
            origin: formData.origin.trim() || 'Anywhere',
            destination: isAutoDest ? 'SURPRISE' : formData.destination,
            style: finalStyle,
            start_date: isFlexibleDate ? new Date().toISOString().split('T')[0] : formData.start_date,
            trip_days: resolvedTripDays,
            budget: 0,
            user_id: user?.id || '',
        };

        trackEventAction('trip_started', {
            destination: payload.destination,
            is_guest: !user,
            days: payload.trip_days,
        });

        try {
            const token = await getToken();

            await tripService.createTripStreaming(
                payload,
                token,
                (tripId) => {
                    updateStep('meta', 'complete');
                    updateStep('iti', 'complete');
                    updateStep('log', 'loading');
                    trackEventAction('trip_success', {
                        trip_id: tripId,
                        destination: payload.destination,
                        is_guest: !user,
                    });
                    setIsDone(true);
                    toast.success('Trip dibuat! Menuju halaman perjalanan... ✨', {
                        description: 'Itinerary sedang dimuat.',
                    });
                    if (!user) {
                        localStorage.setItem('pending_trip_id', tripId);
                        localStorage.setItem('pending_claim_trip_id', tripId);
                        localStorage.setItem('miru_guest_usage', '1');
                    }
                    setTimeout(() => router.push(`/trips/${tripId}`), 800);
                },
                (tripId) => {
                    // skeleton_complete
                    updateStep('log', 'complete');
                    updateStep('final', 'complete');
                },
                (message) => {
                    throw new Error(message);
                },
            );

        } catch (error: any) {
            if (error.response?.status === 403 && error.response?.data?.code === 'free_tier_limit') {
                trackEventAction('paywall_shown', { trigger: 'duration_gate' });
                setShowDurationUpgrade(true);
                setIsStreaming(false);
                setIsSubmitting(false);
                return;
            }
            trackEventAction('trip_error', {
                error: (error as Error).message || 'Unknown error',
                destination: payload.destination,
                is_guest: !user,
            });
            setIsStreaming(false);
            setIsSubmitting(false);
            toast.error('Something went wrong', { description: error.message || 'Please try again later.' });
        }
    };

    if (isStreaming) {
        return <LoadingOverlay steps={steps} isDone={isDone} />;
    }

    const destLabel = isAutoDest
        ? 'Surprise me! 🎲'
        : (formData.destination || initialDestination || '');

    return (
        <div className="bg-[#0A1628] rounded-t-3xl md:rounded-3xl w-full overflow-hidden shadow-2xl">
            {/* DRAG HANDLE (mobile only) — larger tap zone */}
            <div className="flex justify-center py-3 md:hidden">
                <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* HEADER */}
            <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-white/10">
                <div>
                    <p className="text-[11px] text-white/40 tracking-[0.8px]">Rencanakan trip</p>
                    <p className="text-[17px] font-medium text-white mt-0.5">Buat itinerary baru</p>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="w-8 h-8 rounded-full bg-white/8 border border-white/8 flex items-center justify-center hover:bg-white/12 transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                )}
            </div>

            {/* FORM BODY — scrollable, keyboard-aware */}
            <form
                onSubmit={handleSubmit}
                className="px-5 py-5 space-y-5 overflow-y-auto overscroll-contain"
                style={{ maxHeight: 'min(calc(85dvh - 80px), calc(75svh - 60px))' }}
            >
                {/* GUEST BANNER */}
                {!user && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-teal-500/8 border border-teal-500/20 rounded-xl">
                        <Sparkles className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[12px] text-teal-300 leading-relaxed">
                            Coba Miru gratis — sign in setelah selesai untuk menyimpan trip.
                        </p>
                    </div>
                )}

                {/* DESTINATION */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] text-white/70 font-medium">Destinasi</p>
                        {initialDestination && (
                            <a href="/explore" className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors">
                                Ganti →
                            </a>
                        )}
                    </div>

                    {(initialDestination || isAutoDest) ? (
                        <div className="flex items-center gap-3 px-4 py-3 bg-[#060F1E] border border-teal-500/40 rounded-xl">
                            <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                            <span className="text-[14px] font-medium text-white flex-1">{destLabel}</span>
                            {initialDestination && <Lock className="w-3.5 h-3.5 text-slate-600" />}
                        </div>
                    ) : (
                        <DestinationSection
                            origin={formData.origin}
                            savedOrigin={savedOrigin}
                            setOrigin={(val) => {
                                setFormData({ ...formData, origin: val });
                                if (val) localStorage.setItem('lastOrigin', val);
                            }}
                            destination={formData.destination}
                            setDestination={(val) => setFormData({ ...formData, destination: val })}
                            isAuto={isAutoDest}
                            setAuto={setIsAutoDest}
                        />
                    )}

                    {!isAutoDest && !initialDestination && formData.destination && (
                        <div className="mt-2">
                            <DiscoveryTeaser destination={formData.destination} />
                        </div>
                    )}
                </div>

                {/* DURATION */}
                <DateDurationSection
                    startDate={formData.start_date}
                    setStartDate={(val) => setFormData({ ...formData, start_date: val })}
                    tripDays={formData.trip_days}
                    setTripDays={(val) => { setFormData({ ...formData, trip_days: val }); setShowDurationUpgrade(false); }}
                    isFlexible={isFlexibleDate}
                    setFlexible={setIsFlexibleDate}
                    isDurationFlexible={isDurationFlexible}
                    setIsDurationFlexible={setIsDurationFlexible}
                    isPro={isPro}
                    onUpgradeNeeded={() => setShowDurationUpgrade(true)}
                />

                {/* DURATION UPGRADE NUDGE */}
                {showDurationUpgrade && !isPro && (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-400/8 border border-amber-400/20">
                        <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-amber-300">Trip lebih dari 3 hari tersedia di PRO</p>
                            <p className="text-[11px] text-amber-400/70 mt-0.5">Unlock 4–7 hari dan semua fitur premium.</p>
                        </div>
                        <a
                            href={process.env.NEXT_PUBLIC_MAYAR_CHECKOUT_URL || '/pricing'}
                            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 whitespace-nowrap underline underline-offset-2"
                        >
                            Upgrade →
                        </a>
                    </div>
                )}

                {/* BUDGET VIBE */}
                <div>
                    <p className="text-[13px] text-white/70 font-medium mb-2">Budget</p>
                    <div className="grid grid-cols-3 gap-2">
                        {BUDGET_OPTIONS.map((opt) => {
                            const selected = formData.budget === opt.value;
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, budget: opt.value })}
                                    className={cn(
                                        'flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all',
                                        selected
                                            ? `${opt.bg} ${opt.border} ${opt.color}`
                                            : 'bg-[#060F1E] border-white/8 text-slate-500 hover:border-white/20'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[11px] font-medium">{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PAX STEPPER */}
                <div>
                    <p className="text-[13px] text-white/70 font-medium mb-2">Jumlah orang</p>
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#060F1E] border border-white/8 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setPax(p => Math.max(1, p - 1))}
                            aria-label="Kurangi"
                            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/8 border border-white/10 text-white flex items-center justify-center hover:bg-white/12 active:scale-95 transition-all"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center text-[15px] font-medium text-white">{pax} orang</span>
                        <button
                            type="button"
                            onClick={() => setPax(p => Math.min(20, p + 1))}
                            aria-label="Tambah"
                            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/8 border border-white/10 text-white flex items-center justify-center hover:bg-white/12 active:scale-95 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* GENERATE BUTTON */}
                <button
                    type="submit"
                    disabled={isSubmitting || isStreaming}
                    className="w-full bg-[#0D9488] hover:bg-[#0B8275] text-white rounded-[14px] py-4 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                    {isSubmitting || isStreaming ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-[15px] font-medium truncate max-w-[220px]">
                                {destLabel ? `Buat itinerary ke ${destLabel}` : 'Buat itinerary'}
                            </span>
                        </>
                    )}
                </button>

                {/* Safe-area bottom padding for iOS */}
                <div className="h-safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
            </form>
        </div>
    );
}
