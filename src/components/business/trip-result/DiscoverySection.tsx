'use client';

import React from 'react';
import { CulinarySignature, HiddenGem } from '@/types';
import { Utensils, Compass, Info } from 'lucide-react';

interface DiscoverySectionProps {
    culinary?: CulinarySignature[];
    hiddenGem?: HiddenGem | null;
    history?: string;
}

export default function DiscoverySection({ culinary, hiddenGem, history }: DiscoverySectionProps) {
    if (!culinary?.length && !hiddenGem && !history) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
            {/* Left: Culinary & History */}
            <div className="lg:col-span-12 space-y-8">
                {/* History Snippet (Editorial Style) */}
                {history && (
                    <div className="border-l-4 border-teal-500 pl-6 py-2">
                        <p className="text-2xl font-serif italic text-slate-800 leading-relaxed">
                            "{history}"
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Culinary List */}
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
                                            "{food.description}"
                                        </p>
                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1">
                                            <Info className="w-3 h-3" /> {food.tip}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hidden Gem */}
                    {hiddenGem && (
                        <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden group text-white h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity" />
                            <div className="relative z-10 space-y-4">
                                <div className="text-teal-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 flex items-center gap-2">
                                    <Compass className="w-4 h-4 animate-pulse" /> Local's Secret
                                </div>
                                <h3 className="text-3xl font-black tracking-tight">
                                    {hiddenGem.name}
                                </h3>
                                <p className="text-base text-slate-300 font-light leading-relaxed">
                                    {hiddenGem.description}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
