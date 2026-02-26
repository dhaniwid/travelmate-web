'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const CATEGORIES = ['cafe', 'restaurant', 'attraction', 'route', 'hidden_gem', 'tip', 'market', 'nature'];

interface IngestResult {
    success: boolean;
    id?: string;
    name?: string;
    dims?: number;
    error?: string;
}

export default function KnowledgeFeedPanel() {
    const [form, setForm] = useState({
        city: 'Bandung',
        name: '',
        category: 'attraction',
        description: '',
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<IngestResult | null>(null);

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8889/api/v1').replace(/\/+$/, '');
    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'travelmate_admin_secret_2026';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.description || !form.city) return;

        setStatus('loading');
        setResult(null);

        try {
            const res = await fetch(`${apiBase}/admin/knowledge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': adminSecret,
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus('error');
                setResult({ success: false, error: data.message || 'Something went wrong' });
                return;
            }

            setStatus('success');
            setResult({ success: true, id: data.id, name: data.name, dims: data.dims });

            // Clear form fields (keep city + category as sticky context)
            setForm((prev) => ({ ...prev, name: '', description: '' }));
        } catch (err) {
            setStatus('error');
            setResult({ success: false, error: 'Network error — is the backend running?' });
        }
    };

    const isLoading = status === 'loading';

    return (
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50/60 to-purple-50/40">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-violet-900">
                    <Brain className="h-5 w-5 text-violet-600" />
                    Local Knowledge Feed <span className="text-violet-500 font-normal text-xs ml-1">(RAG)</span>
                </CardTitle>
                <CardDescription className="text-violet-700/70 text-xs">
                    Feed hyper-local knowledge into the AI. Each entry is embedded with OpenAI and stored as a vector for RAG retrieval.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row: City + Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">City</label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                                placeholder="e.g. Bandung"
                                disabled={isLoading}
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                                disabled={isLoading}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Name / Title</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Warung Nasi Ibu Entin"
                            disabled={isLoading}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">
                            Description <span className="text-slate-400 font-normal">(this is what gets embedded)</span>
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            placeholder="Write rich local context: what makes this place special, insider tips, best time to visit, what to order…"
                            rows={4}
                            disabled={isLoading}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50 resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading || !form.name || !form.description}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Embedding & saving…
                            </>
                        ) : (
                            <>
                                <Brain className="h-4 w-4" />
                                Ingest into RAG
                            </>
                        )}
                    </button>

                    {/* Toast-style feedback */}
                    {status === 'success' && result?.success && (
                        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-emerald-800">Ingested successfully!</p>
                                <p className="text-emerald-700 text-xs mt-0.5">
                                    <span className="font-mono">{result.id?.substring(0, 8)}…</span>
                                    {result.dims && <> · {result.dims}-dim vector stored</>}
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && result && (
                        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-red-800">Ingestion failed</p>
                                <p className="text-red-700 text-xs mt-0.5">{result.error}</p>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
