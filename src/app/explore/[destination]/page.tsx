'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Heart,
    Lock,
    Calendar,
    Clock,
    Wallet,
    Sparkles,
    ChevronRight,
} from 'lucide-react';
import { getDestination, DestinationData } from '@/data/destinations';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import LandmarkImage from '@/components/business/landmark/LandmarkImage';

// ─── Province map ─────────────────────────────────────────────────────────────

const PROVINCE: Record<string, string> = {
    bali: 'Bali',
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

// ─── Zone 1: Hero ─────────────────────────────────────────────────────────────

function DestinationHero({ destination }: { destination: DestinationData }) {
    const province = PROVINCE[destination.slug] ?? 'Indonesia';

    return (
        <div className="relative h-[320px] bg-[#0A1628] overflow-hidden">
            {/* LandmarkImage hero */}
            <LandmarkImage
                slug={destination.slug}
                mood="landscape"
                size="header"
                alt={`Landmark ${destination.name}`}
                className="!absolute inset-0 !aspect-auto !h-full !rounded-none"
            />

            {/* Bottom gradient for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/95 via-[#0A1628]/40 to-transparent" />

            {/* Top controls */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-5 z-20">
                <Link
                    href="/explore"
                    className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"
                >
                    <ArrowLeft className="w-4 h-4 text-white" />
                </Link>
                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({ title: `${destination.name} — Miru`, text: destination.tagline, url: window.location.href });
                        } else {
                            navigator.clipboard.writeText(window.location.href);
                        }
                    }}
                    className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"
                >
                    <Heart className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Bottom text */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-20">
                <div className="inline-flex items-center gap-1.5 bg-teal-400/20 border border-teal-400/30 rounded-full px-2.5 py-1 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span className="text-[11px] text-teal-300 tracking-wide">{province}</span>
                </div>
                <h1 className="text-white text-[30px] font-medium leading-tight mb-1">{destination.name}</h1>
                <p className="text-white/60 text-[13px]">{destination.tagline}</p>
            </div>
        </div>
    );
}

// ─── Zone 2: Vibe Cards ───────────────────────────────────────────────────────

function VibeSection({ destination }: { destination: DestinationData }) {
    const CARD_COLORS = ['#0A1628', '#1A0A00', '#0A1628'];

    return (
        <div className="px-4 pt-5 pb-1">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.8px] mb-3">Vibes</p>
            <div className="grid grid-cols-3 gap-2">
                {destination.vibeCards.map((card, i) => (
                    <div
                        key={i}
                        className="rounded-xl p-3 text-center"
                        style={{ background: CARD_COLORS[i % CARD_COLORS.length] }}
                    >
                        <span className="text-xl block mb-1.5">{card.emoji}</span>
                        <p className="text-white text-[11px] font-semibold leading-tight">{card.title}</p>
                        <p className="text-white/40 text-[10px] mt-0.5 leading-tight line-clamp-2">{card.subtitle}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Zone 3: Quick Facts ──────────────────────────────────────────────────────

function QuickFactsSection({ destination }: { destination: DestinationData }) {
    const facts = [
        { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Waktu terbaik', value: destination.quickFacts.bestTime },
        { icon: <Clock className="w-3.5 h-3.5" />, label: 'Durasi ideal', value: destination.quickFacts.duration },
        { icon: <Wallet className="w-3.5 h-3.5" />, label: 'Budget harian', value: destination.quickFacts.budget },
    ];

    return (
        <div className="px-4 pt-5 pb-1">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.8px] mb-3">Info Cepat</p>
            <div className="grid grid-cols-2 gap-2">
                {facts.map(({ icon, label, value }, i) => (
                    <div key={i} className="bg-[#0A1628] border border-white/5 rounded-xl px-3 py-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-slate-500">{icon}</span>
                            <span className="text-[11px] text-slate-500">{label}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-white">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Zone 4a: Harus Dikunjungi ────────────────────────────────────────────────

function MustVisitSection({ destination }: { destination: DestinationData }) {
    const ICON_COLORS = ['#0D9488', '#F97316', '#AFA9EC'];
    const ICON_BG = ['#0A1628', '#1A0A00', '#0A1628'];

    return (
        <div className="px-4 pt-5 pb-1">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.8px] mb-3">Harus Dikunjungi</p>
            <div className="flex flex-col gap-2">
                {destination.vibeCards.map((card, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-3 bg-[#0A1628] border border-white/5 rounded-xl"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                            style={{ background: ICON_BG[i % ICON_BG.length] }}
                        >
                            <span>{card.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-white leading-tight">{card.title}</p>
                            <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">{card.subtitle}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Zone 4b: Hidden Gems ─────────────────────────────────────────────────────

function HiddenGemsSection({ destination, isPro }: { destination: DestinationData; isPro: boolean }) {
    return (
        <div className="px-4 pt-5 pb-1">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.8px]">Hidden Gems</p>
                <span className="text-[11px] text-teal-400 bg-teal-400/10 px-2.5 py-0.5 rounded-full">PRO</span>
            </div>

            {isPro ? (
                <div className="bg-[#0A1628] border border-white/5 rounded-xl p-4">
                    <p className="text-[13px] text-white/70 leading-relaxed">{destination.hiddenGems}</p>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden">
                    {/* Blurred content */}
                    <div className="blur-[3px] pointer-events-none select-none">
                        <div className="flex flex-col gap-2">
                            {[1, 2].map((n) => (
                                <div key={n} className="flex gap-3 items-center px-3 py-3 bg-[#0A1628] border border-white/5 rounded-xl">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-slate-700 rounded w-3/4 mb-2" />
                                        <div className="h-2.5 bg-slate-800 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Lock overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Lock className="w-5 h-5 text-white" />
                        <p className="text-[13px] font-medium text-white text-center">2 hidden gems tersembunyi</p>
                        <p className="text-[12px] text-slate-400 text-center">Hanya untuk PRO members</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Zone 5: Sticky CTA ───────────────────────────────────────────────────────

function StickyCTA({ destination }: { destination: DestinationData }) {
    const { isSignedIn } = useAuth();
    const router = useRouter();

    const handlePlan = () => {
        if (isSignedIn) {
            localStorage.setItem('pending_planner_destination', destination.name);
            router.push(`/dashboard?destination=${encodeURIComponent(destination.name)}&open=planner`);
        } else {
            const redirectUrl = encodeURIComponent(`/dashboard?destination=${encodeURIComponent(destination.name)}`);
            router.push(`/sign-in?redirect_url=${redirectUrl}`);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 pb-safe bg-[#060F1E]/90 backdrop-blur-xl border-t border-white/5">
            <button
                onClick={handlePlan}
                className="w-full bg-[#0A1628] hover:bg-[#0D1F38] active:bg-[#060F1E] text-white border border-white/10 rounded-[14px] py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 transition-colors"
            >
                <Sparkles className="w-4 h-4 text-teal-400" />
                Rencanakan trip {destination.name}
            </button>
        </div>
    );
}

// ─── Not Found ────────────────────────────────────────────────────────────────

function DestinationNotFound({ slug }: { slug: string }) {
    return (
        <div className="min-h-screen bg-[#060F1E] flex flex-col items-center justify-center px-6 text-center">
            <div className="text-5xl mb-5">🗺️</div>
            <h1 className="text-white text-xl font-bold mb-2">Destinasi tidak ditemukan</h1>
            <p className="text-slate-500 text-sm mb-7 max-w-xs">
                Kami belum punya halaman untuk &quot;{slug}&quot;.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Link href="/dashboard?open=planner">
                    <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl h-11">
                        Buat Itinerary Sekarang
                    </Button>
                </Link>
                <Link href="/explore">
                    <Button variant="outline" className="w-full border-white/15 text-white/60 hover:text-white rounded-xl h-11">
                        Lihat Destinasi Lain
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DestinationPage({
    params,
}: {
    params: Promise<{ destination: string }>;
}) {
    const { destination: slug } = use(params);
    const destination = getDestination(slug);
    const { subscription } = useSubscription();
    const isPro = subscription?.subscription_tier === 'PRO';

    if (!destination) {
        return <DestinationNotFound slug={slug} />;
    }

    return (
        <div className="min-h-screen bg-[#060F1E] text-white pb-24 max-w-[480px] md:max-w-2xl mx-auto">
            {/* Zone 1 — Hero */}
            <DestinationHero destination={destination} />

            {/* Zone 2 — Vibe cards */}
            <VibeSection destination={destination} />

            {/* Zone 3 — Quick facts */}
            <QuickFactsSection destination={destination} />

            {/* Zone 4a — Harus dikunjungi */}
            <MustVisitSection destination={destination} />

            {/* Zone 4b — Hidden gems */}
            <HiddenGemsSection destination={destination} isPro={isPro} />

            {/* Footer spacing */}
            <div className="h-8" />

            {/* Zone 5 — Sticky CTA */}
            <StickyCTA destination={destination} />
        </div>
    );
}
