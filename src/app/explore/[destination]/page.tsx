'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Heart,
    Calendar,
    Clock,
    Wallet,
    Sparkles,
    Plus,
    Check,
    X,
    Loader2,
    Trash2,
    Backpack,
    Scale,
    Gem,
} from 'lucide-react';
import { getDestination, DestinationData } from '@/data/destinations';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth, useUser } from '@clerk/nextjs';
import LandmarkImage from '@/components/business/landmark/LandmarkImage';
import { tripService } from '@/services/trip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import UpgradeModal from '@/components/ui/UpgradeModal';

// ─── Province map ─────────────────────────────────────────────────────────────

const PROVINCE: Record<string, string> = {
    bali: 'Bali',
    denpasar: 'Bali',
    yogyakarta: 'DI Yogyakarta',
    semarang: 'Jawa Tengah',
    jakarta: 'DKI Jakarta',
    bandung: 'Jawa Barat',
    lombok: 'Nusa Tenggara Barat',
    'labuan-bajo': 'Nusa Tenggara Timur',
    medan: 'Sumatera Utara',
    makassar: 'Sulawesi Selatan',
    surabaya: 'Jawa Timur',
};

// ─── Pickable Place Item Type ─────────────────────────────────────────────────

type PlaceCategory = 'eksotik' | 'kuliner' | 'budaya';

interface PickablePlace {
    id: string;
    name: string;
    category: PlaceCategory;
    badge: string;
    hook: string;
    suggestedSlot: string;
}

interface ScheduleEntry {
    day: number;
    timeSlot: string;
}

const TIME_SLOTS = [
    'Waktu Fleksibel',
    'Pagi (08:00)',
    'Siang (12:30)',
    'Sore (16:00)',
    'Malam (19:30)',
];

const BUDGET_OPTIONS = [
    { value: 1, label: 'Backpacker', icon: Backpack },
    { value: 2, label: 'Comfort', icon: Scale },
    { value: 3, label: 'Premium', icon: Gem },
];

// Curated seed for Denpasar & fallback generator so any city immediately has rich options
const DENPASAR_CURATED: PickablePlace[] = [
    {
        id: 'denpasar-sanur',
        name: 'Pantai Sanur & Jalur Sepeda Pesisir',
        category: 'eksotik',
        badge: '🏝️ Tempat Eksotik',
        hook: 'Pantai matahari terbit paling ikonik di Denpasar dengan boardwalk panjang yang tenang.',
        suggestedSlot: 'Pagi (08:00)',
    },
    {
        id: 'denpasar-bajra',
        name: 'Monumen Bajra Sandhi Renon',
        category: 'budaya',
        badge: '🏛️ Budaya & Sejarah',
        hook: 'Arsitektur megah perjuangan rakyat Bali di tengah lapangan hijau luas.',
        suggestedSlot: 'Sore (16:00)',
    },
    {
        id: 'denpasar-betutu',
        name: 'Ayam Betutu Khas Gilimanuk (Renon)',
        category: 'kuliner',
        badge: '🍜 Kuliner Khas',
        hook: 'Rempah base genep Bali yang meresap sempurna, wajib dicoba untuk makan siang.',
        suggestedSlot: 'Siang (12:30)',
    },
    {
        id: 'denpasar-badung',
        name: 'Pasar Badung & Tepian Tukad Badung',
        category: 'budaya',
        badge: '🏛️ Budaya & Kota',
        hook: 'Pasar tradisional terbesar di Bali dengan tepian sungai yang tertata artistik.',
        suggestedSlot: 'Pagi (08:00)',
    },
    {
        id: 'denpasar-tahura',
        name: 'Hutan Mangrove Tahura Ngurah Rai',
        category: 'eksotik',
        badge: '🏝️ Tempat Eksotik',
        hook: 'Jembatan kayu eksotis membelah hutan bakau hijau yang sejuk dan fotogenik.',
        suggestedSlot: 'Sore (16:00)',
    },
    {
        id: 'denpasar-wardani',
        name: 'Nasi Campur Bali Warung Wardani',
        category: 'kuliner',
        badge: '🍜 Kuliner Khas',
        hook: 'Kuliner legendaris Denpasar dengan sate lilit dan sambal matah autentik.',
        suggestedSlot: 'Siang (12:30)',
    },
];

function buildInitialPlaces(slug: string, displayName: string, staticDest: DestinationData | null): PickablePlace[] {
    if (slug.toLowerCase() === 'denpasar') {
        return DENPASAR_CURATED;
    }

    if (staticDest) {
        const items: PickablePlace[] = [];
        // Primary landmark
        items.push({
            id: `${slug}-landmark`,
            name: staticDest.landmark,
            category: 'eksotik',
            badge: '🏝️ Tempat Eksotik',
            hook: `Ikon utama ${staticDest.name} yang wajib masuk daftar kunjungan pertamamu.`,
            suggestedSlot: 'Pagi (08:00)',
        });

        // Vibe cards
        staticDest.vibeCards.forEach((vc, idx) => {
            const text = `${vc.title} ${vc.subtitle}`.toLowerCase();
            const isFood = text.includes('kuliner') || text.includes('lumpia') || text.includes('makan') || text.includes('kopi') || text.includes('soto') || text.includes('rawon') || text.includes('coto');
            const isNature = text.includes('pantai') || text.includes('alam') || text.includes('gunung') || text.includes('pulau') || text.includes('laut') || text.includes('danau');
            const category: PlaceCategory = isFood ? 'kuliner' : isNature ? 'eksotik' : 'budaya';
            const badge = isFood ? '🍜 Kuliner Khas' : isNature ? '🏝️ Tempat Eksotik' : '🏛️ Budaya & Kota';
            items.push({
                id: `${slug}-vibe-${idx}`,
                name: vc.title,
                category,
                badge,
                hook: vc.subtitle,
                suggestedSlot: isFood ? 'Siang (12:30)' : idx % 2 === 0 ? 'Pagi (08:00)' : 'Sore (16:00)',
            });
        });

        // Local tips as actionable spots
        staticDest.tipsLokal.forEach((tip, idx) => {
            const tagTitle = tip.tags?.[0] || `Spot Favorit ${staticDest.name} #${idx + 1}`;
            const isFood = tip.tags?.some(t => t.toLowerCase().includes('kuliner') || t.toLowerCase().includes('rawon') || t.toLowerCase().includes('makan')) || tip.text.toLowerCase().includes('warung') || tip.text.toLowerCase().includes('kuliner');
            const category: PlaceCategory = isFood ? 'kuliner' : 'budaya';
            items.push({
                id: `${slug}-tip-${idx}`,
                name: tagTitle,
                category,
                badge: isFood ? '🍜 Kuliner Khas' : '🏛️ Budaya & Hidden Gem',
                hook: tip.text,
                suggestedSlot: isFood ? 'Malam (19:30)' : 'Pagi (08:00)',
            });
        });

        return items;
    }

    // Generic initial seed for any other city while AI Discovery loads
    return [
        {
            id: `${slug}-1`,
            name: `Landmark & Ikon Utama ${displayName}`,
            category: 'eksotik',
            badge: '🏝️ Tempat Eksotik',
            hook: `Spot panorama dan landmark paling populer di jantung ${displayName}.`,
            suggestedSlot: 'Pagi (08:00)',
        },
        {
            id: `${slug}-2`,
            name: `Pusat Kuliner & Street Food ${displayName}`,
            category: 'kuliner',
            badge: '🍜 Kuliner Khas',
            hook: `Cicipi hidangan autentik favorit warga lokal di ${displayName}.`,
            suggestedSlot: 'Siang (12:30)',
        },
        {
            id: `${slug}-3`,
            name: `Kawasan Budaya & Kota Tua ${displayName}`,
            category: 'budaya',
            badge: '🏛️ Budaya & Sejarah',
            hook: `Menelusuri sejarah, arsitektur khas, dan suasana lokal ${displayName}.`,
            suggestedSlot: 'Sore (16:00)',
        },
        {
            id: `${slug}-4`,
            name: `Spot Sunset & Alam ${displayName}`,
            category: 'eksotik',
            badge: '🏝️ Tempat Eksotik',
            hook: `Tempat terbaik menikmati pemandangan sore dan udara segar di ${displayName}.`,
            suggestedSlot: 'Sore (16:00)',
        },
    ];
}

// ─── Main Page Component (ADR-001: Explore-First & Dual-Mode Flow) ────────────

export default function DestinationPage({
    params,
}: {
    params: Promise<{ destination: string }>;
}) {
    const { destination: slug } = use(params);
    const staticDest = getDestination(slug);
    const displayName = staticDest?.name ?? decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const province = PROVINCE[slug.toLowerCase()] ?? 'Destinasi Pilihan';

    const { isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const { subscription } = useSubscription();
    const isPro = subscription?.subscription_tier === 'PRO';
    const router = useRouter();

    // ── View Mode: 'explore' (Screen 2) vs 'canvas' (Screen 3) ────────────────
    const [viewMode, setViewMode] = useState<'explore' | 'canvas'>('explore');
    const [activeCategory, setActiveCategory] = useState<'all' | PlaceCategory>('all');
    const [places, setPlaces] = useState<PickablePlace[]>(() => buildInitialPlaces(slug, displayName, staticDest));
    const [isEnrichingPlaces, setIsEnrichingPlaces] = useState(false);

    // ── Picklist & Flexible Schedule State ────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [scheduleMap, setScheduleMap] = useState<Record<string, ScheduleEntry>>({});
    const [totalDays, setTotalDays] = useState<number>(1);
    const [activeDay, setActiveDay] = useState<number>(1);
    const [customSpotInput, setCustomSpotInput] = useState('');

    // ── Option B (AI Modal) & Generation State ────────────────────────────────
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiDuration, setAiDuration] = useState<'Fleksibel' | '1' | '2' | '3'>('Fleksibel');
    const [budgetTier, setBudgetTier] = useState<number>(2);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);

    // ── Restore Draft Picklist & Schedule from sessionStorage (after Sign-In) ─
    const draftStorageKey = `miru_explore_draft_${slug.toLowerCase()}`;

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(draftStorageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.customPlaces) && parsed.customPlaces.length > 0) {
                setPlaces((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const newCustom = parsed.customPlaces.filter((cp: PickablePlace) => !existingIds.has(cp.id));
                    return [...newCustom, ...prev];
                });
            }
            if (Array.isArray(parsed.selectedIds)) setSelectedIds(parsed.selectedIds);
            if (parsed.scheduleMap && typeof parsed.scheduleMap === 'object') setScheduleMap(parsed.scheduleMap);
            if (typeof parsed.totalDays === 'number' && parsed.totalDays >= 1) setTotalDays(parsed.totalDays);
            if (typeof parsed.activeDay === 'number' && parsed.activeDay >= 1) setActiveDay(parsed.activeDay);
            if (parsed.viewMode === 'canvas' || parsed.viewMode === 'explore') setViewMode(parsed.viewMode);
        } catch {
            // ignore corrupted sessionStorage
        }
    }, [draftStorageKey]);

    useEffect(() => {
        try {
            if (selectedIds.length === 0 && totalDays === 1) {
                sessionStorage.removeItem(draftStorageKey);
                return;
            }
            const customPlaces = places.filter((p) => p.id.startsWith('custom-'));
            sessionStorage.setItem(
                draftStorageKey,
                JSON.stringify({
                    selectedIds,
                    scheduleMap,
                    totalDays,
                    activeDay,
                    viewMode,
                    customPlaces,
                })
            );
        } catch {
            // ignore storage quota errors
        }
    }, [draftStorageKey, selectedIds, scheduleMap, totalDays, activeDay, viewMode, places]);

    // ── Fetch Dynamic AI Discovery from Go Backend (/api/v1/discovery?city=...) ──
    useEffect(() => {
        let cancelled = false;
        async function fetchDynamicDiscovery() {
            setIsEnrichingPlaces(true);
            try {
                const discovery = await tripService.getCityDiscovery(displayName);
                if (cancelled || !discovery) return;

                const minedPlaces: PickablePlace[] = [];

                // 1. Highlights -> Tempat Eksotik / Budaya
                (discovery.highlights || []).forEach((h: any, idx: number) => {
                    const title = h.name || h.title;
                    if (!title) return;
                    const t = (h.type || '').toLowerCase();
                    const isCulture = t.includes('culture') || t.includes('history') || t.includes('urban');
                    minedPlaces.push({
                        id: `ai-hl-${idx}`,
                        name: title,
                        category: isCulture ? 'budaya' : 'eksotik',
                        badge: isCulture ? '🏛️ Budaya & Kota' : '🏝️ Tempat Eksotik',
                        hook: h.hook || `Spot unggulan di ${displayName}.`,
                        suggestedSlot: idx % 2 === 0 ? 'Pagi (08:00)' : 'Sore (16:00)',
                    });
                });

                // 2. Culinary Signature -> Kuliner Khas
                (discovery.culinary_signature || []).forEach((c: any, idx: number) => {
                    if (!c.name) return;
                    minedPlaces.push({
                        id: `ai-cul-${idx}`,
                        name: c.name,
                        category: 'kuliner',
                        badge: '🍜 Kuliner Khas',
                        hook: `${c.description || ''}${c.tip ? ` · Tip: ${c.tip}` : ''}`,
                        suggestedSlot: idx % 2 === 0 ? 'Siang (12:30)' : 'Malam (19:30)',
                    });
                });

                // 3. Hidden Gem
                if (discovery.hidden_gem?.name) {
                    minedPlaces.push({
                        id: 'ai-gem-0',
                        name: discovery.hidden_gem.name,
                        category: 'budaya',
                        badge: '💎 Hidden Gem Lokal',
                        hook: discovery.hidden_gem.description || `Spot tersembunyi favorit warga lokal di ${displayName}.`,
                        suggestedSlot: 'Sore (16:00)',
                    });
                }

                if (minedPlaces.length > 0) {
                    setPlaces((prev) => {
                        // If non-static city (except denpasar curated), replace generic placeholders with real AI mined places
                        if (!staticDest && slug.toLowerCase() !== 'denpasar') {
                            return minedPlaces;
                        }
                        // Otherwise merge non-duplicate names
                        const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
                        const uniqueNew = minedPlaces.filter((m) => !existingNames.has(m.name.toLowerCase()));
                        return [...prev, ...uniqueNew];
                    });
                }
            } catch {
                // Keep initial curated / fallback places silently
            } finally {
                if (!cancelled) setIsEnrichingPlaces(false);
            }
        }

        fetchDynamicDiscovery();
        return () => {
            cancelled = true;
        };
    }, [displayName, slug, staticDest]);

    // ── Filtered Places ───────────────────────────────────────────────────────
    const filteredPlaces = useMemo(() => {
        if (activeCategory === 'all') return places;
        return places.filter((p) => p.category === activeCategory);
    }, [places, activeCategory]);

    // ── Handlers for Selecting & Scheduling Places ────────────────────────────
    const togglePlace = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                const next = prev.filter((item) => item !== id);
                setScheduleMap((mapPrev) => {
                    const copy = { ...mapPrev };
                    delete copy[id];
                    return copy;
                });
                return next;
            } else {
                setScheduleMap((mapPrev) => ({
                    ...mapPrev,
                    [id]: { day: activeDay, timeSlot: 'Waktu Fleksibel' },
                }));
                return [...prev, id];
            }
        });
    };

    const handleAddCustomSpot = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = customSpotInput.trim();
        if (!trimmed) return;

        const newId = `custom-${Date.now()}`;
        const newPlace: PickablePlace = {
            id: newId,
            name: trimmed,
            category: 'eksotik',
            badge: '📍 Pilihanmu Sendiri',
            hook: `Tempat kustom yang kamu tambahkan di ${displayName}.`,
            suggestedSlot: 'Waktu Fleksibel',
        };

        setPlaces((prev) => [newPlace, ...prev]);
        setSelectedIds((prev) => [...prev, newId]);
        setScheduleMap((prev) => ({
            ...prev,
            [newId]: { day: activeDay, timeSlot: 'Waktu Fleksibel' },
        }));
        setCustomSpotInput('');
        toast.success(`"${trimmed}" ditambahkan ke pilihanmu!`);
    };

    const handleAutoArrangeCanvas = () => {
        setScheduleMap((prev) => {
            const next = { ...prev };
            selectedIds.forEach((id) => {
                const place = places.find((p) => p.id === id);
                if (place && next[id]) {
                    next[id] = { ...next[id], timeSlot: place.suggestedSlot };
                }
            });
            return next;
        });
        toast.success('Urutan waktu telah dirapikan oleh Miru! ✨');
    };

    const handleAddDay = () => {
        if (!isPro && totalDays >= 3) {
            setShowUpgrade(true);
            return;
        }
        const nextDay = totalDays + 1;
        setTotalDays(nextDay);
        setActiveDay(nextDay);
    };

    const updateTimeSlot = (id: string, slot: string) => {
        setScheduleMap((prev) => ({
            ...prev,
            [id]: { ...(prev[id] || { day: 1 }), timeSlot: slot },
        }));
    };

    const movePlaceDay = (id: string, targetDay: number) => {
        setScheduleMap((prev) => ({
            ...prev,
            [id]: { ...(prev[id] || { timeSlot: 'Waktu Fleksibel' }), day: targetDay },
        }));
    };

    // ── Generate / Save Trip to Backend (Works for both Manual and AI Mode) ───
    const handleGenerateTrip = async (sourceMode: 'manual' | 'ai') => {
        if (isGenerating) return;

        if (sourceMode === 'manual' && selectedIds.length === 0) {
            toast.error('Belum ada tempat di kanvas manual', {
                description: 'Pilih minimal 1 tempat terlebih dahulu, atau gunakan tombol "Buatkan Rute Otomatis".',
            });
            return;
        }

        if (!isSignedIn) {
            const redirectUrl = encodeURIComponent(`/explore/${slug}`);
            router.push(`/sign-in?redirect_url=${redirectUrl}`);
            return;
        }

        setIsGenerating(true);
        setIsAiModalOpen(false);

        try {
            const token = await getToken();

            // Helper to convert UI slot label into HH:MM
            const resolveSlotTime = (slot: string, indexInDay: number): string => {
                if (slot.includes('08:00')) return '08:00';
                if (slot.includes('12:30')) return '12:30';
                if (slot.includes('16:00')) return '16:00';
                if (slot.includes('19:30')) return '19:30';
                const fallbackSlots = ['09:00', '12:30', '16:00', '19:30'];
                return fallbackSlots[indexInDay % fallbackSlots.length];
            };

            const resolveCategoryType = (cat: PlaceCategory): string => {
                if (cat === 'kuliner') return 'Culinary';
                if (cat === 'eksotik') return 'Nature';
                return 'Sightseeing';
            };

            const chosenPlaceNames = selectedIds
                .map((id) => places.find((item) => item.id === id)?.name)
                .filter(Boolean) as string[];

            // Determine flexible days
            let resolvedDays = 2;
            if (sourceMode === 'manual') {
                const maxScheduledDay = selectedIds.reduce((maxD, id) => {
                    const d = scheduleMap[id]?.day || 1;
                    return d > maxD ? d : maxD;
                }, totalDays);
                resolvedDays = Math.max(1, maxScheduledDay);
            } else if (aiDuration === 'Fleksibel') {
                resolvedDays = chosenPlaceNames.length > 0 ? Math.min(3, Math.max(1, Math.ceil(chosenPlaceNames.length / 3))) : 2;
            } else {
                resolvedDays = parseInt(aiDuration, 10) || 2;
            }

            // Build exact manual itinerary if sourceMode === 'manual'
            let manualPlanData: any = undefined;
            if (sourceMode === 'manual') {
                const itineraryDays = Array.from({ length: resolvedDays }, (_, idx) => {
                    const dayNumber = idx + 1;
                    const dayPlaceIds = selectedIds.filter((id) => (scheduleMap[id]?.day || 1) === dayNumber);
                    const activities = dayPlaceIds
                        .map((id, actIdx) => {
                            const place = places.find((p) => p.id === id);
                            if (!place) return null;
                            const sched = scheduleMap[id] || { day: dayNumber, timeSlot: 'Waktu Fleksibel' };
                            return {
                                time: resolveSlotTime(sched.timeSlot, actIdx),
                                activity: place.name,
                                place_name: place.name,
                                description: place.hook,
                                description_short: place.hook,
                                type: resolveCategoryType(place.category),
                            };
                        })
                        .filter(Boolean);

                    return {
                        day: dayNumber,
                        title: `Eksplorasi ${displayName} — Hari ${dayNumber}`,
                        activities,
                    };
                }).filter((d) => d.activities.length > 0);

                // Re-number sequential days if an intermediate day was left empty
                itineraryDays.forEach((d, i) => {
                    d.day = i + 1;
                    d.title = `Eksplorasi ${displayName} — Hari ${i + 1}`;
                });
                resolvedDays = Math.max(1, itineraryDays.length);
                manualPlanData = { itinerary: itineraryDays };
            }

            const budgetRangeLabel =
                budgetTier === 1 ? 'Hemat' : budgetTier === 3 ? 'Sultan' : 'Seimbang';

            const baseStyleLabel =
                sourceMode === 'manual'
                    ? 'Susunan Manual'
                    : budgetTier === 1
                    ? 'Hemat & Kuliner Lokal'
                    : budgetTier === 3
                    ? 'Premium & Nyaman'
                    : 'Seimbang & Santai';

            const finalStyle =
                sourceMode === 'ai' && chosenPlaceNames.length > 0
                    ? `${baseStyleLabel} · Wajib Kunjungi: ${chosenPlaceNames.join(', ')}`
                    : baseStyleLabel;

            const payload = {
                origin: 'Jakarta',
                destination: displayName,
                start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                trip_days: resolvedDays,
                style: finalStyle,
                budget: 0,
                budget_range: budgetRangeLabel,
                user_id: user?.id || '',
                ...(manualPlanData ? { plan_data: manualPlanData } : {}),
            };

            if (sourceMode === 'manual') {
                await tripService.createTripStreaming(
                    payload,
                    token,
                    () => {},
                    (tripId) => {
                        sessionStorage.removeItem(draftStorageKey);
                        toast.success(`Rencana perjalanan ke ${displayName} siap! ✨`);
                        router.push(`/trips/${tripId}`);
                    },
                    (msg) => {
                        throw new Error(msg);
                    }
                );
            } else {
                await tripService.createTripStreaming(
                    payload,
                    token,
                    (tripId) => {
                        sessionStorage.removeItem(draftStorageKey);
                        toast.success(`Rencana perjalanan ke ${displayName} siap! ✨`);
                        router.push(`/trips/${tripId}`);
                    },
                    () => {},
                    (msg) => {
                        throw new Error(msg);
                    }
                );
            }
        } catch (err: any) {
            setIsGenerating(false);
            if (err?.code === 'free_tier_limit' || err?.status === 403 || err?.message?.includes('PRO')) {
                setShowUpgrade(true);
                return;
            }
            toast.error('Gagal menyusun itinerary', {
                description: err?.message || 'Silakan coba beberapa saat lagi.',
            });
        }
    };

    // ─── RENDER: FULL-SCREEN LOADING OVERLAY WHEN GENERATING ─────────────────
    if (isGenerating) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center mb-4 shadow-lg">
                    <Loader2 className="w-7 h-7 animate-spin text-teal-400" />
                </div>
                <h2 className="text-xl font-bold text-zinc-950">Menyusun Rencana {displayName}...</h2>
                <p className="text-xs text-zinc-500 mt-1.5 max-w-xs leading-relaxed">
                    {selectedIds.length > 0
                        ? `Miru sedang merangkai ${selectedIds.length} tempat pilihanmu beserta rute peta terbaik.`
                        : `Miru sedang memilihkan tempat eksotis, kuliner, dan rute terbaik di ${displayName}.`}
                </p>
            </div>
        );
    }

    // ─── RENDER: SCREEN 3 — FLEXIBLE ITINERARY CANVAS (MODE A) ───────────────
    if (viewMode === 'canvas') {
        const idsOnActiveDay = selectedIds.filter((id) => (scheduleMap[id]?.day || 1) === activeDay);

        return (
            <div className="min-h-screen bg-white text-zinc-950 pb-32 max-w-[480px] md:max-w-2xl mx-auto px-4 pt-5 space-y-5">
                {/* Top Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setViewMode('explore')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                            <ArrowLeft className="w-4 h-4 text-zinc-950" />
                        </div>
                        <span>← Tambah Tempat dari {displayName}</span>
                    </button>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wide">
                        Penyusunan Manual
                    </span>
                </div>

                {/* Canvas Header Box */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="font-display text-xl font-bold tracking-tight text-zinc-950 leading-snug">Rencana Trip {displayName}</h1>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Durasi &amp; jam fleksibel · Kamu bebas menambah hari kapan saja tanpa harus tahu di awal
                        </p>
                    </div>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleAutoArrangeCanvas}
                            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            Rapikan Jam dgn AI
                        </button>
                    )}
                </div>

                {/* Dynamic Day Pills (+ Tambah Hari) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => {
                        const count = selectedIds.filter((id) => (scheduleMap[id]?.day || 1) === dayNum).length;
                        const isActive = dayNum === activeDay;
                        return (
                            <button
                                key={dayNum}
                                onClick={() => setActiveDay(dayNum)}
                                className={cn(
                                    'shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all',
                                    isActive
                                        ? 'bg-zinc-950 text-white shadow-sm'
                                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                )}
                            >
                                Hari {dayNum} ({count})
                            </button>
                        );
                    })}
                    <button
                        onClick={handleAddDay}
                        className="shrink-0 px-3.5 py-2 rounded-full border border-dashed border-zinc-400 text-xs font-bold text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 transition-colors inline-flex items-center gap-1"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Hari
                    </button>
                </div>

                {/* Activities on Active Day */}
                <div className="space-y-3">
                    {idsOnActiveDay.length === 0 ? (
                        <div className="p-8 rounded-2xl border border-zinc-200 bg-zinc-50 text-center space-y-3">
                            <p className="text-sm font-bold text-zinc-900">Belum ada tempat di Hari {activeDay}</p>
                            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                                Pilih tempat menarik dari daftar eksplorasi {displayName} atau tambahkan tempat incaranmu sendiri di bawah.
                            </p>
                            <button
                                onClick={() => setViewMode('explore')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-bold"
                            >
                                + Pilih Tempat dari {displayName}
                            </button>
                        </div>
                    ) : (
                        idsOnActiveDay.map((id, idx) => {
                            const place = places.find((p) => p.id === id);
                            if (!place) return null;
                            const sched = scheduleMap[id] || { day: 1, timeSlot: 'Waktu Fleksibel' };

                            return (
                                <div
                                    key={id}
                                    className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="inline-block text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                                                {place.badge}
                                            </span>
                                            <h3 className="text-sm font-bold text-zinc-950 mt-1">
                                                {idx + 1}. {place.name}
                                            </h3>
                                            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{place.hook}</p>
                                        </div>
                                        <button
                                            onClick={() => togglePlace(id)}
                                            className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                                            aria-label="Hapus tempat"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Flexible Time & Day Controls */}
                                    <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-zinc-100">
                                        <span className="text-xs font-semibold text-zinc-500">Waktu:</span>
                                        <select
                                            value={sched.timeSlot}
                                            onChange={(e) => updateTimeSlot(id, e.target.value)}
                                            className="text-xs font-bold bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                                        >
                                            {TIME_SLOTS.map((slot) => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>

                                        {totalDays > 1 && (
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <span className="text-xs font-semibold text-zinc-500">Pindah ke:</span>
                                                <select
                                                    value={sched.day}
                                                    onChange={(e) => movePlaceDay(id, Number(e.target.value))}
                                                    className="text-xs font-bold bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                                                >
                                                    {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                                                        <option key={d} value={d}>
                                                            Hari {d}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Add Custom Place Inline Form */}
                <form onSubmit={handleAddCustomSpot} className="flex gap-2">
                    <input
                        type="text"
                        value={customSpotInput}
                        onChange={(e) => setCustomSpotInput(e.target.value)}
                        placeholder={`+ Ketik tempat lain di ${displayName} lalu Enter...`}
                        className="flex-1 h-11 px-4 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-950"
                    />
                    <button
                        type="submit"
                        className="px-4 h-11 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
                    >
                        Tambah
                    </button>
                </form>

                <button
                    onClick={() => setViewMode('explore')}
                    className="w-full py-3 rounded-xl border border-dashed border-zinc-300 text-xs font-bold text-zinc-600 hover:border-zinc-950 hover:text-zinc-950 transition-colors"
                >
                    + Pilih Lagi dari Katalog Eksplor {displayName}
                </button>

                {/* Sticky Bottom Save/Finalize CTA */}
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-4">
                    <div className="max-w-[480px] md:max-w-2xl mx-auto flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold text-zinc-950">
                                {selectedIds.length} tempat · {totalDays} hari fleksibel
                            </p>
                            <p className="text-xs text-zinc-500">Siap dipetakan ke rute perjalananmu</p>
                        </div>
                        <button
                            onClick={() => handleGenerateTrip('manual')}
                            className="px-5 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Sparkles className="w-4 h-4 text-teal-400" />
                            <span>Simpan &amp; Buka Peta Rute →</span>
                        </button>
                    </div>
                </div>

                <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
            </div>
        );
    }

    // ─── RENDER: SCREEN 2 — CITY DISCOVERY & PICKLIST (DEFAULT) ──────────────
    return (
        <div className="min-h-screen bg-white text-zinc-950 pb-40 max-w-[480px] md:max-w-2xl mx-auto">
            {/* Zone 1: Hero */}
            <div className="relative h-[260px] bg-zinc-950 overflow-hidden">
                <LandmarkImage
                    slug={staticDest?.slug ?? slug}
                    mood="landscape"
                    size="header"
                    alt={`Landmark ${displayName}`}
                    className="!absolute inset-0 !aspect-auto !h-full !rounded-none opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/20" />

                {/* Top Controls */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-5 z-20">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 shadow-sm border border-zinc-200 hover:bg-white transition-colors text-xs font-bold text-zinc-950"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 text-zinc-950" />
                        <span>Ganti Kota</span>
                    </Link>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `${displayName} — Miru`,
                                    text: staticDest?.tagline ?? `Eksplor ${displayName} bersama Miru`,
                                    url: window.location.href,
                                });
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('Tautan disalin!');
                            }
                        }}
                        className="w-9 h-9 rounded-full bg-white/95 shadow-sm flex items-center justify-center border border-zinc-200 hover:bg-white transition-colors"
                        aria-label="Bagikan"
                    >
                        <Heart className="w-4 h-4 text-zinc-950" />
                    </button>
                </div>

                {/* Bottom Hero Text */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-20">
                    <div className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-400/40 rounded-full px-2.5 py-0.5 mb-2 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        <span className="text-xs font-semibold text-teal-200 tracking-wide">{province}</span>
                    </div>
                    <h1 className="font-display text-white text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                        {displayName}
                    </h1>
                    <p className="text-zinc-300 text-xs mt-1 leading-relaxed max-w-xl">
                        {staticDest?.tagline ??
                            `Pilih destinasi favoritmu di bawah. Kamu bebas mengatur jadwal sendiri atau langsung terima rute siap jalan dari Miru.`}
                    </p>
                </div>
            </div>

            {/* Quick Facts Strip (if staticDest has quickFacts) */}
            {staticDest && (
                <div className="px-4 pt-4 grid grid-cols-3 gap-2">
                    {[
                        { icon: <Calendar className="w-3.5 h-3.5 text-teal-600" />, label: 'Waktu terbaik', value: staticDest.quickFacts.bestTime },
                        { icon: <Clock className="w-3.5 h-3.5 text-teal-600" />, label: 'Durasi ideal', value: staticDest.quickFacts.duration },
                        { icon: <Wallet className="w-3.5 h-3.5 text-teal-600" />, label: 'Budget harian', value: staticDest.quickFacts.budget },
                    ].map((fact, i) => (
                        <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5">
                            <div className="flex items-center gap-1 text-zinc-500 text-xs">
                                {fact.icon}
                                <span className="truncate">{fact.label}</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-950 mt-1 truncate">{fact.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Category Filter Tabs */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-100 px-4 pt-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
                {[
                    { id: 'all', label: `Semua (${places.length})` },
                    { id: 'eksotik', label: '🏝️ Tempat Eksotik' },
                    { id: 'kuliner', label: '🍜 Kuliner Khas' },
                    { id: 'budaya', label: '🏛️ Budaya & Hidden Gem' },
                ].map((tab) => {
                    const isActive = activeCategory === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveCategory(tab.id as any)}
                            className={cn(
                                'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all',
                                isActive
                                    ? 'bg-zinc-950 text-white'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950'
                            )}
                        >
                            {tab.label}
                        </button>
                    );
                })}
                {isEnrichingPlaces && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs text-teal-700 font-semibold ml-auto">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Memuat spot lokal...
                    </span>
                )}
            </div>

            {/* Picklist Instruction Banner */}
            <div className="px-4 pt-4">
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-600">
                        💡 Klik <strong className="text-zinc-950">+ Pilih</strong> pada tempat yang ingin kamu kunjungi, atau langsung klik tombol di bawah.
                    </p>
                </div>
            </div>

            {/* Pickable Places List */}
            <div className="px-4 pt-3 space-y-3">
                {filteredPlaces.map((place) => {
                    const isSelected = selectedIds.includes(place.id);
                    return (
                        <div
                            key={place.id}
                            onClick={() => togglePlace(place.id)}
                            className={cn(
                                'p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3',
                                isSelected
                                    ? 'border-2 border-zinc-950 bg-zinc-50/90 shadow-sm'
                                    : 'border-zinc-200 bg-white hover:border-zinc-400'
                            )}
                        >
                            <div className="space-y-1 flex-1 min-w-0">
                                <span className="inline-block text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                                    {place.badge}
                                </span>
                                <h3 className="text-sm font-bold text-zinc-950 pt-0.5">{place.name}</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed">{place.hook}</p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlace(place.id);
                                }}
                                className={cn(
                                    'shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1',
                                    isSelected
                                        ? 'bg-zinc-950 text-white'
                                        : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                                )}
                            >
                                {isSelected ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-teal-400" />
                                        <span>Dipilih</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Pilih</span>
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}

                {/* Add Custom Place Input */}
                <form onSubmit={handleAddCustomSpot} className="pt-2 flex gap-2">
                    <input
                        type="text"
                        value={customSpotInput}
                        onChange={(e) => setCustomSpotInput(e.target.value)}
                        placeholder={`Punya tempat incaran lain di ${displayName}? Ketik di sini...`}
                        className="flex-1 h-11 px-4 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-950"
                    />
                    <button
                        type="submit"
                        className="px-4 h-11 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-colors shrink-0"
                    >
                        + Tambah
                    </button>
                </form>
            </div>

            {/* Option B: AI Config Mini Drawer */}
            {isAiModalOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4"
                    onClick={() => setIsAiModalOpen(false)}
                >
                    <div
                        className="bg-white w-full max-w-[460px] rounded-2xl p-5 space-y-4 border border-zinc-200 shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase text-teal-600 tracking-wide">✨ Penyusun Rute Pintar</span>
                                <h3 className="text-base font-bold text-zinc-950">Biarkan Miru Menyusun Rute {displayName}</h3>
                            </div>
                            <button
                                onClick={() => setIsAiModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed">
                            {selectedIds.length > 0 ? (
                                <>
                                    Miru akan menyusun jadwal &amp; rute peta yang{' '}
                                    <strong className="text-zinc-950">wajib memasukkan {selectedIds.length} tempat pilihanmu</strong>, ditambah rekomendasi searah.
                                </>
                            ) : (
                                <>
                                    Kamu belum memilih tempat spesifik —{' '}
                                    <strong className="text-zinc-950">AI Miru akan memilihkan spot eksotis &amp; kuliner terbaik di {displayName}</strong> secara otomatis.
                                </>
                            )}
                        </div>

                        {/* Flexible Duration Selector */}
                        <div>
                            <p className="text-xs font-bold text-zinc-900 mb-2">Durasi Perjalanan (Bisa Fleksibel)</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'Fleksibel', label: '✨ Fleksibel' },
                                    { id: '1', label: '1 Hari' },
                                    { id: '2', label: '2 Hari' },
                                    { id: '3', label: '3 Hari' },
                                ].map((d) => {
                                    const active = aiDuration === d.id;
                                    return (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => setAiDuration(d.id as any)}
                                            className={cn(
                                                'py-2.5 px-2 rounded-xl text-xs font-bold transition-all',
                                                active
                                                    ? 'border-2 border-zinc-950 bg-zinc-950 text-white'
                                                    : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                                            )}
                                        >
                                            {d.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1.5">
                                {aiDuration === 'Fleksibel'
                                    ? 'Miru menentukan jumlah hari paling ideal secara otomatis berdasarkan jarak & kepadatan tempat.'
                                    : `Miru akan membagi jadwal perjalanan ${displayName} ke dalam ${aiDuration} hari.`}
                            </p>
                        </div>

                        {/* Budget Vibe Selector */}
                        <div>
                            <p className="text-xs font-bold text-zinc-900 mb-2">Gaya Budget</p>
                            <div className="grid grid-cols-3 gap-2">
                                {BUDGET_OPTIONS.map((opt) => {
                                    const selected = budgetTier === opt.value;
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setBudgetTier(opt.value)}
                                            className={cn(
                                                'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all',
                                                selected
                                                    ? 'border-2 border-zinc-950 bg-zinc-50 text-zinc-950'
                                                    : 'border border-zinc-200 bg-white text-zinc-600'
                                            )}
                                        >
                                            <Icon className={cn('w-3.5 h-3.5', selected ? 'text-teal-600' : 'text-zinc-500')} />
                                            <span>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleGenerateTrip('ai')}
                            className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                            <Sparkles className="w-4 h-4 text-teal-400" />
                            <span>Generate Itinerary Sekarang</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Zone 5: Sticky Dual-Action Bottom Bar (Opsi A vs Opsi B) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 pb-safe bg-white/95 backdrop-blur-md border-t border-zinc-200">
                <div className="max-w-[480px] md:max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-900">
                            {selectedIds.length > 0
                                ? `${selectedIds.length} tempat dipilih di ${displayName}`
                                : 'Belum ada tempat dipilih (Opsional)'}
                        </span>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => {
                                    setSelectedIds([]);
                                    setScheduleMap({});
                                }}
                                className="text-xs font-semibold text-zinc-500 hover:text-zinc-950"
                            >
                                Reset pilihan
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        {/* SUSUN MANUAL */}
                        <button
                            type="button"
                            onClick={() => setViewMode('canvas')}
                            className="py-2.5 px-3 rounded-xl border-2 border-zinc-950 bg-white hover:bg-zinc-50 active:bg-zinc-100 text-zinc-950 text-xs font-bold flex flex-col items-center justify-center transition-all"
                        >
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-zinc-950" />
                                <span>Susun Manual</span>
                            </span>
                            <span className="text-xs font-normal text-zinc-500 mt-0.5">
                                {selectedIds.length > 0 ? `Atur ${selectedIds.length} tempat ini` : 'Atur hari & jam bebas'}
                            </span>
                        </button>

                        {/* BUATKAN RUTE OTOMATIS */}
                        <button
                            type="button"
                            onClick={() => setIsAiModalOpen(true)}
                            className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 active:bg-zinc-900 text-white text-xs font-bold flex flex-col items-center justify-center transition-all shadow-sm"
                        >
                            <span className="inline-flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                                <span>Buatkan Rute Otomatis</span>
                            </span>
                            <span className="text-xs font-normal text-teal-300 mt-0.5">
                                {selectedIds.length > 0 ? `Sertakan ${selectedIds.length} tempat + AI` : 'Langsung terima rute siap jalan'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
        </div>
    );
}
