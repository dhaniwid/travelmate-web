'use client';

import React, { useState } from 'react';
import { CulinarySignature } from '@/types';
import { Utensils, Compass, Info, Sparkles, Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface DiscoverySectionProps {
    culinary?: CulinarySignature[];
    hiddenGem?: unknown; // kept for API compat but ignored — stripped by backend
    history?: string;
    destination?: string;
}

function HiddenGemsPlaceholder({ destination }: { destination?: string }) {
    const { getToken, isSignedIn } = useAuth();
    const [notified, setNotified] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleNotify = async () => {
        if (!isSignedIn || notified || loading) return;
        setLoading(true);
        try {
            const token = await getToken();
            await fetch('/api/v1/feature-interest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ feature_key: 'hidden_gems' }),
            });
            setNotified(true);
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden group text-white h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative z-10 space-y-4">
                <div className="text-teal-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 flex items-center gap-2">
                    <Compass className="w-4 h-4" /> Local&apos;s Secret
                    <span className="ml-auto bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest">
                        COMING SOON
                    </span>
                </div>
                <h3 className="text-2xl font-black tracking-tight">
                    Hidden Gems
                    <span className="ml-2 text-sm font-normal text-teal-400">✨ PRO</span>
                </h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                    Kami sedang mengkurasi hidden gems terbaik
                    {destination ? ` untuk ${destination}` : ''} — hanya yang terverifikasi lokal, bukan sekadar AI.
                </p>
                <p className="text-xs text-slate-400">
                    Segera hadir untuk PRO members.
                </p>

                {isSignedIn && (
                    <button
                        onClick={handleNotify}
                        disabled={notified || loading}
                        className="flex items-center gap-2 mt-2 text-xs font-bold text-teal-300 hover:text-teal-100 transition-colors disabled:opacity-60"
                    >
                        {notified ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                                Kamu akan diberitahu saat siap!
                            </>
                        ) : (
                            <>
                                <Bell className="w-4 h-4" />
                                {loading ? 'Menyimpan...' : 'Notify me when ready →'}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function DiscoverySection({ culinary, history, destination }: DiscoverySectionProps) {
    if (!culinary?.length && !history) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
            <div className="lg:col-span-12 space-y-8">
                {history && (
                    <div className="border-l-4 border-teal-500 pl-6 py-2">
                        <p className="text-2xl font-serif italic text-slate-800 leading-relaxed">
                            &ldquo;{history}&rdquo;
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {culinary && culinary.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                                <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                                    <Utensils className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 uppercase tracking-tight">Taste of the City</h3>
                            </div>
                            <div className="space-y-6">
                                {culinary.map((food, idx) => (
                                    <div key={idx} className="group relative pl-6 border-l-2 border-slate-100 hover:border-orange-400 transition-colors">
                                        <h5 className="font-bold text-lg text-slate-900 group-hover:text-orange-600 transition-colors mb-1">
                                            {food.name}
                                        </h5>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-1 italic">
                                            &ldquo;{food.description}&rdquo;
                                        </p>
                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1">
                                            <Info className="w-3 h-3" /> {food.tip}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <HiddenGemsPlaceholder destination={destination} />
                </div>
            </div>
        </div>
    );
}
