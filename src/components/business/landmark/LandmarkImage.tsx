'use client';

import { useEffect, useState } from 'react';

type Mood = 'landscape' | 'crisp_morning' | 'mood_rain' | 'neon_night' | 'auto';
type Size = 'stamp' | 'card' | 'header';
type Status = 'loading' | 'pending' | 'ready' | 'error';

interface Props {
    slug: string;
    mood?: Mood;
    size?: Size;
    alt?: string;
    className?: string;
    dark?: boolean;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8889/api/v1').replace(/\/+$/, '');

// Pre-bundled static WebP landmarks shipped in /public/assets/landmarks/
const STATIC_LANDMARK_SLUGS = new Set([
    'bali',
    'bandung',
    'jakarta',
    'semarang',
    'yogyakarta',
]);

// Alias mapping so regional sub-cities resolve to their pre-bundled landmark
const SLUG_ALIASES: Record<string, string> = {
    'denpasar': 'bali',
    'ubud': 'bali',
    'kuta': 'bali',
    'canggu': 'bali',
    'sanur': 'bali',
    'seminyak': 'bali',
    'nusa-dua': 'bali',
    'jogja': 'yogyakarta',
    'jogjakarta': 'yogyakarta',
    'sleman': 'yogyakarta',
    'bantul': 'yogyakarta',
    'dki-jakarta': 'jakarta',
    'jakarta-selatan': 'jakarta',
    'jakarta-pusat': 'jakarta',
};

// Curated scenic fallbacks for destinations not yet pre-bundled as 3D renders
const CURATED_LANDMARK_URLS: Record<string, string> = {
    'lombok': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=80',
    'labuan-bajo': 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=1200&q=80',
    'medan': 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1200&q=80',
    'makassar': 'https://images.unsplash.com/photo-1559628233-100c798642d4?w=1200&q=80',
    'surabaya': 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1200&q=80',
};

const DEFAULT_FALLBACK_URL = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80';

function normalizeLandmarkSlug(rawSlug: string): string {
    const clean = rawSlug.trim().toLowerCase().replace(/\s+/g, '-');
    return SLUG_ALIASES[clean] ?? clean;
}

function getStaticLandmarkPath(rawSlug: string, variant: Exclude<Mood, 'auto'>): string | null {
    const normalized = normalizeLandmarkSlug(rawSlug);
    if (STATIC_LANDMARK_SLUGS.has(normalized)) {
        return `/assets/landmarks/${normalized}_${variant}.webp`;
    }
    if (CURATED_LANDMARK_URLS[normalized]) {
        return CURATED_LANDMARK_URLS[normalized];
    }
    return null;
}

function resolveMood(mood: Mood): Exclude<Mood, 'auto'> {
    if (mood !== 'auto') return mood;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'crisp_morning';
    if (hour >= 18 || hour < 5) return 'neon_night';
    return 'mood_rain';
}

const SIZE_STYLES: Record<Size, string> = {
    stamp: 'w-[200px] h-[200px] rounded-full overflow-hidden flex-shrink-0',
    card: 'w-[400px] h-[400px] rounded-2xl overflow-hidden',
    header: 'w-full aspect-[16/9] rounded-2xl overflow-hidden',
};

export default function LandmarkImage({ slug, mood = 'auto', size = 'card', alt, className = '', dark = true }: Props) {
    const resolvedMood = resolveMood(mood);
    const variant = resolvedMood; // variant = mood for the backend
    const staticPath = getStaticLandmarkPath(slug, variant);

    const [status, setStatus] = useState<Status>(staticPath ? 'ready' : 'loading');
    const [pollCount, setPollCount] = useState(0);
    const [imagePath, setImagePath] = useState<string | null>(staticPath);

    useEffect(() => {
        const directPath = getStaticLandmarkPath(slug, variant);
        if (directPath) {
            setImagePath(directPath);
            setStatus('ready');
            return;
        }

        let cancelled = false;
        let pollTimer: ReturnType<typeof setTimeout> | null = null;
        const normalizedSlug = normalizeLandmarkSlug(slug);

        async function check() {
            try {
                const res = await fetch(`${API_BASE}/landmarks/${encodeURIComponent(normalizedSlug)}/${encodeURIComponent(variant)}`, {
                    cache: 'no-store',
                });

                if (cancelled) return;

                if (res.status === 200) {
                    const data = await res.json();
                    setImagePath(data.path ?? null);
                    setStatus('ready');
                    return;
                }

                if (res.status === 202) {
                    setStatus('pending');
                    setPollCount((c) => c + 1);
                    pollTimer = setTimeout(check, 5000);
                    return;
                }

                setStatus('error');
            } catch {
                if (!cancelled) setStatus('error');
            }
        }

        setStatus('loading');
        setImagePath(null);
        check();

        return () => {
            cancelled = true;
            if (pollTimer) clearTimeout(pollTimer);
        };
    }, [slug, variant]);

    const containerClass = `${SIZE_STYLES[size]} relative ${className}`;

    if (status === 'ready' && imagePath) {
        return (
            <div className={containerClass}>
                <img
                    src={imagePath}
                    alt={alt ?? `Foto landmark ${slug}`}
                    className="w-full h-full object-cover"
                    style={size === 'header' ? { objectPosition: 'center 20%' } : undefined}
                    loading="lazy"
                    onError={() => {
                        if (imagePath !== DEFAULT_FALLBACK_URL) {
                            setImagePath(DEFAULT_FALLBACK_URL);
                        } else {
                            setStatus('error');
                        }
                    }}
                />
            </div>
        );
    }

    // Skeleton — same dimensions, no layout shift
    const skeletonBg = dark ? 'bg-slate-700' : 'bg-slate-100';
    const skeletonText = dark ? 'text-slate-500' : 'text-slate-400';
    const skeletonIcon = dark ? 'text-slate-500' : 'text-slate-400';

    return (
        <div className={`${containerClass} ${skeletonBg}`} role="img" aria-label={status === 'error' ? 'Gambar tidak tersedia' : 'Memuat gambar…'}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                {status === 'loading' && (
                    <SkeletonPulse dark={dark} />
                )}
                {status === 'pending' && (
                    <>
                        <SkeletonPulse dark={dark} />
                        <span className={`text-[10px] ${skeletonText} text-center leading-tight mt-1`}>
                            Gambar sedang dibuat…{pollCount > 1 ? ` (${pollCount})` : ''}
                        </span>
                    </>
                )}
                {status === 'error' && (
                    <div className={`flex flex-col items-center gap-1 ${skeletonIcon}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3l18 18M3.75 5.25A2.25 2.25 0 006 3h12a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0118 21H6a2.25 2.25 0 01-2.25-2.25V5.25z" />
                        </svg>
                        <span className="text-[10px] text-center">Gambar tidak tersedia</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function SkeletonPulse({ dark }: { dark: boolean }) {
    const from = dark ? 'from-slate-700' : 'from-slate-100';
    const via = dark ? 'via-slate-600' : 'via-slate-200';
    const to = dark ? 'to-slate-700' : 'to-slate-100';
    return (
        <div className="absolute inset-0 overflow-hidden">
            <div className={`w-full h-full bg-gradient-to-r ${from} ${via} ${to} animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%]`} />
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
