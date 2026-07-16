'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, CheckCircle, XCircle, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

interface ValidationItem {
    Slug: string;
    Variant: string;
    Status: string;
    Score: number;
    Reason: string;
    RejectNotes: string;
    ValidatedAt: string | null;
    PublicPath: string; // static file path served by Go backend, e.g. /landmark-images/bandung_landscape.webp
}

const VARIANT_LABELS: Record<string, string> = {
    landscape:     'Landscape',
    crisp_morning: 'Crisp Morning',
    mood_rain:     'Mood Rain',
    neon_night:    'Neon Night',
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8891';

// Mirror of LANDMARK_VALIDATION_THRESHOLD env var on the backend (default 0.85).
// Update here if the backend default changes.
const VALIDATION_THRESHOLD = 0.85;

function scoreColor(score: number) {
    if (score >= VALIDATION_THRESHOLD) return 'text-green-600';
    if (score >= 0.6)                  return 'text-amber-600';
    return 'text-red-600';
}

export default function ValidationQueuePanel() {
    const [items, setItems] = useState<ValidationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionStatus, setActionStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({});
    const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
    const [showRejectForm, setShowRejectForm] = useState<Record<string, boolean>>({});

    const fetchQueue = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/landmark/validations/queue', { signal, cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data.items ?? []);
        } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') return;
            setError('Gagal memuat validation queue');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchQueue(controller.signal);
        return () => controller.abort();
    }, [fetchQueue]);

    async function handleApprove(slug: string, variant: string) {
        const key = `${slug}:${variant}`;
        setActionStatus(prev => ({ ...prev, [key]: 'loading' }));
        try {
            const res = await fetch(`/api/admin/landmark/validations/${slug}/${variant}/approve`, { method: 'PUT' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setItems(prev => prev.filter(i => !(i.Slug === slug && i.Variant === variant)));
            setActionStatus(prev => ({ ...prev, [key]: 'done' }));
        } catch (e) {
            console.error(e);
            setActionStatus(prev => ({ ...prev, [key]: 'error' }));
            setTimeout(() => setActionStatus(prev => ({ ...prev, [key]: 'idle' })), 3000);
        }
    }

    async function handleReject(slug: string, variant: string) {
        const key = `${slug}:${variant}`;
        setActionStatus(prev => ({ ...prev, [key]: 'loading' }));
        try {
            const res = await fetch(`/api/admin/landmark/validations/${slug}/${variant}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: rejectNotes[key] ?? '' }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setItems(prev => prev.filter(i => !(i.Slug === slug && i.Variant === variant)));
            setActionStatus(prev => ({ ...prev, [key]: 'done' }));
            setShowRejectForm(prev => ({ ...prev, [key]: false }));
        } catch (e) {
            console.error(e);
            setActionStatus(prev => ({ ...prev, [key]: 'error' }));
            setTimeout(() => setActionStatus(prev => ({ ...prev, [key]: 'idle' })), 3000);
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="h-4 w-4" /> Antrian Validasi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" /> Memuat queue...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="h-4 w-4" /> Antrian Validasi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-3 py-6">
                        <XCircle className="h-6 w-6 text-red-500" />
                        <p className="text-sm text-red-600">{error}</p>
                        <button onClick={() => fetchQueue()} className="text-xs text-teal-600 hover:underline">
                            Coba lagi
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="h-4 w-4" /> Antrian Validasi
                        {items.length > 0 && (
                            <span className="ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
                                {items.length}
                            </span>
                        )}
                    </CardTitle>
                    <button
                        onClick={() => fetchQueue()}
                        aria-label="Perbarui daftar antrian validasi"
                        className="text-xs text-muted-foreground hover:text-teal-600 flex items-center gap-1"
                    >
                        <RefreshCw className="h-3 w-3" /> Perbarui
                    </button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Gambar dengan score GPT-4o Vision &lt; {VALIDATION_THRESHOLD} — perlu human review sebelum ditampilkan.
                </p>
            </CardHeader>
            <CardContent className="p-0">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                        <p className="text-sm font-medium text-slate-600">Queue kosong</p>
                        <p className="text-xs text-muted-foreground">Semua gambar sudah approved atau belum ada yang di-generate.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {items.map(item => {
                            const key = `${item.Slug}:${item.Variant}`;
                            const status = actionStatus[key] ?? 'idle';
                            const isLoading = status === 'loading';
                            const showReject = showRejectForm[key] ?? false;
                            // Use static file path directly — the GET /landmarks endpoint returns 202 for pending items, not binary image.
                            const thumbnailUrl = item.PublicPath ? `${apiBase}${item.PublicPath}` : '';

                            return (
                                <div key={key} className="p-5 space-y-4">
                                    {/* Header row */}
                                    <div className="flex items-start gap-4">
                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0 w-24 h-16 rounded-md overflow-hidden bg-slate-100 border flex items-center justify-center">
                                            {thumbnailUrl ? (
                                                <img
                                                    src={thumbnailUrl}
                                                    alt={`Thumbnail ${item.Slug} — ${VARIANT_LABELS[item.Variant] ?? item.Variant}`}
                                                    className="w-full h-full object-cover"
                                                    onError={e => {
                                                        const img = e.target as HTMLImageElement;
                                                        img.className = 'hidden';
                                                        const parent = img.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = '<span class="text-[10px] text-slate-400 text-center px-1">Gambar tidak tersedia</span>';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-[10px] text-slate-400 text-center px-1">Gambar tidak tersedia</span>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm capitalize">{item.Slug}</span>
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                                                    {VARIANT_LABELS[item.Variant] ?? item.Variant}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                <span className={`text-xs font-semibold ${scoreColor(item.Score)}`}>
                                                    Score {(item.Score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.Reason}</p>
                                            {item.ValidatedAt && (
                                                <p className="text-[11px] text-muted-foreground mt-1">
                                                    Divalidasi: {new Date(item.ValidatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action row */}
                                    {status === 'done' ? (
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Berhasil diproses
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(item.Slug, item.Variant)}
                                                    disabled={isLoading}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    {isLoading && !showReject ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-3 w-3" />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectForm(prev => ({ ...prev, [key]: !prev[key] }))}
                                                    disabled={isLoading}
                                                    aria-expanded={showReject}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                    {showReject ? 'Batal' : 'Reject'}
                                                </button>
                                                {status === 'error' && (
                                                    <span className="text-xs text-red-600">Gagal — coba lagi</span>
                                                )}
                                            </div>

                                            {showReject && (
                                                <div className="space-y-2 pl-1">
                                                    <label className="text-[11px] font-medium text-slate-500 block">
                                                        Catatan untuk re-generate berikutnya (opsional)
                                                    </label>
                                                    <textarea
                                                        value={rejectNotes[key] ?? ''}
                                                        onChange={e => setRejectNotes(prev => ({ ...prev, [key]: e.target.value }))}
                                                        placeholder="contoh: 'Spire harus runcing, bukan dome'"
                                                        rows={2}
                                                        aria-label="Catatan reject untuk re-generate berikutnya"
                                                        className="w-full text-xs border rounded-md px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-red-400"
                                                    />
                                                    <button
                                                        onClick={() => handleReject(item.Slug, item.Variant)}
                                                        disabled={isLoading}
                                                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md transition-colors"
                                                    >
                                                        {isLoading && showReject ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3" />
                                                        )}
                                                        Konfirmasi Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
