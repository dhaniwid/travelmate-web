'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon, RefreshCw, Save, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LandmarkConfig {
    slug: string;
    city_name: string;
    landmark_name: string;
    landmark_desc: string;
    geo_context: string;
}

const VARIANTS = ['landscape', 'crisp_morning', 'mood_rain', 'neon_night'] as const;
type Variant = typeof VARIANTS[number];

const VARIANT_LABELS: Record<Variant, string> = {
    landscape:     'Landscape',
    crisp_morning: 'Crisp Morning',
    mood_rain:     'Mood Rain',
    neon_night:    'Neon Night',
};

type RegenerateStatus = 'idle' | 'deleting' | 'generating' | 'done' | 'error';

export default function LandmarkConfigPanel() {
    const [configs, setConfigs] = useState<LandmarkConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expanded, setExpanded] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, { landmark_desc: string; geo_context: string }>>({});
    const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'done' | 'error'>>({});
    const [regenStatus, setRegenStatus] = useState<Record<string, RegenerateStatus>>({});

    // All admin API calls go through Next.js Route Handlers — token never reaches the browser.
    const fetchConfigs = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/landmark/configs', { signal, cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setConfigs(data.configs ?? []);
        } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') return;
            setError('Gagal memuat landmark configs');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchConfigs(controller.signal);
        return () => controller.abort();
    }, [fetchConfigs]);

    function toggleExpand(slug: string, cfg: LandmarkConfig) {
        if (expanded === slug) {
            setExpanded(null);
        } else {
            setExpanded(slug);
            if (!drafts[slug]) {
                setDrafts(prev => ({
                    ...prev,
                    [slug]: { landmark_desc: cfg.landmark_desc, geo_context: cfg.geo_context },
                }));
            }
        }
    }

    async function handleSave(slug: string) {
        setSaveStatus(prev => ({ ...prev, [slug]: 'saving' }));
        try {
            const res = await fetch(`/api/admin/landmark/configs?slug=${encodeURIComponent(slug)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(drafts[slug]),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setSaveStatus(prev => ({ ...prev, [slug]: 'done' }));
            setConfigs(prev => prev.map(c =>
                c.slug === slug
                    ? { ...c, landmark_desc: drafts[slug].landmark_desc, geo_context: drafts[slug].geo_context }
                    : c
            ));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, [slug]: 'idle' })), 2000);
        } catch (e) {
            console.error(e);
            setSaveStatus(prev => ({ ...prev, [slug]: 'error' }));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, [slug]: 'idle' })), 3000);
        }
    }

    const handleRegenerate = useCallback(async (slug: string, variant: Variant) => {
        const key = `${slug}:${variant}`;
        const controller = new AbortController();

        setRegenStatus(prev => ({ ...prev, [key]: 'deleting' }));
        try {
            // 1. Delete cache via proxy route
            const delRes = await fetch(`/api/admin/landmark/cache/${slug}/${variant}`, {
                method: 'DELETE',
                signal: controller.signal,
            });
            if (!delRes.ok) throw new Error(`delete cache HTTP ${delRes.status}`);

            // 2. Trigger generation via seed proxy
            setRegenStatus(prev => ({ ...prev, [key]: 'generating' }));
            const seedRes = await fetch('/api/admin/landmark/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slugs: [slug], variants: [variant] }),
                signal: controller.signal,
            });
            if (!seedRes.ok) throw new Error(`seed HTTP ${seedRes.status}`);
            const data = await seedRes.json();
            const result = data.results?.[0];
            if (result?.error) throw new Error(result.error);

            setRegenStatus(prev => ({ ...prev, [key]: 'done' }));
            setTimeout(() => setRegenStatus(prev => ({ ...prev, [key]: 'idle' })), 4000);
        } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') return;
            console.error(e);
            setRegenStatus(prev => ({ ...prev, [key]: 'error' }));
            setTimeout(() => setRegenStatus(prev => ({ ...prev, [key]: 'idle' })), 4000);
        }
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ImageIcon className="h-4 w-4" /> Landmark Configs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" /> Memuat configs...
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
                        <ImageIcon className="h-4 w-4" /> Landmark Configs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-3 py-6">
                        <XCircle className="h-6 w-6 text-red-500" />
                        <p className="text-sm text-red-600">{error}</p>
                        <button
                            onClick={() => fetchConfigs()}
                            className="text-xs text-teal-600 hover:underline"
                        >
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
                <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="h-4 w-4" /> Landmark Configs
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Edit deskripsi &amp; geo context, atau trigger re-generate per variant.
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {configs.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">Tidak ada config ditemukan.</p>
                    )}
                    {configs.map(cfg => {
                        const isExpanded = expanded === cfg.slug;
                        const draft = drafts[cfg.slug];
                        const save = saveStatus[cfg.slug] ?? 'idle';

                        return (
                            <div key={cfg.slug}>
                                <button
                                    onClick={() => toggleExpand(cfg.slug, cfg)}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div>
                                        <p className="font-medium text-sm">{cfg.city_name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{cfg.slug} · {cfg.landmark_name}</p>
                                    </div>
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                </button>

                                {isExpanded && draft && (
                                    <div className="px-6 pb-6 space-y-5 bg-gray-50/50 border-t">
                                        <div className="space-y-3 pt-4">
                                            <div>
                                                <label className="text-xs font-medium text-slate-600 block mb-1">
                                                    Landmark Description
                                                </label>
                                                <textarea
                                                    value={draft.landmark_desc}
                                                    onChange={e => setDrafts(prev => ({
                                                        ...prev,
                                                        [cfg.slug]: { ...prev[cfg.slug], landmark_desc: e.target.value },
                                                    }))}
                                                    rows={4}
                                                    className="w-full text-sm border rounded-md px-3 py-2 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-600 block mb-1">
                                                    Geo Context
                                                    <span className="ml-1 font-normal text-muted-foreground">(opsional)</span>
                                                </label>
                                                <textarea
                                                    value={draft.geo_context}
                                                    onChange={e => setDrafts(prev => ({
                                                        ...prev,
                                                        [cfg.slug]: { ...prev[cfg.slug], geo_context: e.target.value },
                                                    }))}
                                                    rows={2}
                                                    className="w-full text-sm border rounded-md px-3 py-2 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleSave(cfg.slug)}
                                                    disabled={save === 'saving'}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    {save === 'saving' ? (
                                                        <><Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...</>
                                                    ) : (
                                                        <><Save className="h-3 w-3" /> Simpan</>
                                                    )}
                                                </button>
                                                {save === 'done' && (
                                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                                        <CheckCircle className="h-3 w-3" /> Tersimpan
                                                    </span>
                                                )}
                                                {save === 'error' && (
                                                    <span className="flex items-center gap-1 text-xs text-red-600">
                                                        <XCircle className="h-3 w-3" /> Gagal menyimpan
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-slate-600 mb-2">Re-generate Variant</p>
                                            <div className="flex flex-wrap gap-2">
                                                {VARIANTS.map(variant => {
                                                    const key = `${cfg.slug}:${variant}`;
                                                    const status = regenStatus[key] ?? 'idle';
                                                    const isActive = status === 'deleting' || status === 'generating';

                                                    return (
                                                        <button
                                                            key={variant}
                                                            onClick={() => handleRegenerate(cfg.slug, variant)}
                                                            disabled={isActive}
                                                            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition-colors disabled:opacity-60 ${
                                                                status === 'done'
                                                                    ? 'border-green-300 text-green-700 bg-green-50'
                                                                    : status === 'error'
                                                                    ? 'border-red-300 text-red-700 bg-red-50'
                                                                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            {isActive ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : status === 'done' ? (
                                                                <CheckCircle className="h-3 w-3" />
                                                            ) : status === 'error' ? (
                                                                <XCircle className="h-3 w-3" />
                                                            ) : (
                                                                <RefreshCw className="h-3 w-3" />
                                                            )}
                                                            {VARIANT_LABELS[variant]}
                                                            {status === 'deleting' && ' · hapus cache...'}
                                                            {status === 'generating' && ' · generating...'}
                                                            {status === 'done' && ' · done'}
                                                            {status === 'error' && ' · error'}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-2">
                                                Generate membutuhkan ~40–60 detik per variant.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
