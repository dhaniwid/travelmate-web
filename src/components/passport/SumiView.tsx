'use client';

import { useState } from "react";
import { PassportStamp } from "./PassportStamp";
import { StampReveal } from "./StampReveal";
import PageHeader from "@/components/layout/PageHeader";
import { Stamp as StampIcon, Loader2 } from "lucide-react";
import { usePassportStamps } from "@/hooks/usePassportStamps";

export function SumiView() {
    const { stamps, loading, error } = usePassportStamps();
    const [isRevealOpen, setIsRevealOpen] = useState(false);
    const [revealStampIdx, setRevealStampIdx] = useState(0);

    const revealStamp = stamps[revealStampIdx] ?? null;

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            <PageHeader
                title="Sumi Collection"
                subtitle="Your Living Travel Ink"
                className="bg-stone-900 border-b border-stone-800"
            />

            <div className="px-6 lg:px-8 max-w-7xl mx-auto mt-6">
                <div className="relative w-full aspect-[4/3] max-w-5xl mx-auto bg-[#F5F1E8] rounded-[2rem] shadow-2xl overflow-hidden border border-[#E2D9C8]">
                    {/* Paper texture */}
                    <div className="absolute inset-0 opacity-60 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]" />
                    <div className="absolute inset-0 z-0 bg-stone-100/10 mix-blend-multiply pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-8 p-8 md:p-12">
                        {loading && (
                            <div className="col-span-2 md:col-span-3 flex flex-col items-center justify-center py-20 gap-3 text-stone-400">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="text-sm font-medium">Memuat koleksimu...</p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="col-span-2 md:col-span-3 flex flex-col items-center justify-center py-20 gap-3 text-stone-500">
                                <div className="w-16 h-16 rounded-full bg-stone-200/60 flex items-center justify-center mb-2">
                                    <StampIcon className="w-8 h-8 text-stone-400" />
                                </div>
                                <p className="font-bold text-stone-700">Belum ada stamp</p>
                                <p className="text-sm italic text-stone-400 font-serif">
                                    "Mulai perjalananmu dan Sumi akan mencatat setiap momen"
                                </p>
                            </div>
                        )}

                        {!loading && !error && stamps.length === 0 && (
                            <div className="col-span-2 md:col-span-3 flex flex-col items-center justify-center py-20 gap-3 text-stone-500">
                                <div className="w-16 h-16 rounded-full bg-stone-200/60 flex items-center justify-center mb-2">
                                    <StampIcon className="w-8 h-8 text-stone-400" />
                                </div>
                                <p className="font-bold text-stone-700">Belum ada stamp</p>
                                <p className="text-sm italic text-stone-400 font-serif">
                                    "Mulai perjalananmu dan Sumi akan mencatat setiap momen"
                                </p>
                            </div>
                        )}

                        {!loading && !error && stamps.map((stamp, idx) => (
                            <div
                                key={stamp.id}
                                className="relative group mix-blend-multiply opacity-90 hover:opacity-100 transition-opacity duration-500 cursor-pointer"
                                onClick={() => { setRevealStampIdx(idx); setIsRevealOpen(true); }}
                            >
                                <PassportStamp
                                    imageSrc={stamp.image_url}
                                    city={stamp.city}
                                    date={stamp.date}
                                    serialCode={stamp.serial}
                                    rotation={stamp.rotation}
                                />
                            </div>
                        ))}

                        {/* Empty slot — shown after stamps when no error */}
                        {!loading && !error && (
                            <div className="col-span-1 border-2 border-dashed border-stone-300 rounded-full aspect-square flex flex-col items-center justify-center p-6 text-center opacity-60 hover:opacity-100 transition-all group bg-white/20">
                                <div className="w-12 h-12 rounded-full bg-stone-200/50 flex items-center justify-center mb-3 group-hover:bg-stone-200 group-hover:text-stone-700 transition-colors">
                                    <StampIcon className="w-6 h-6 text-stone-400" />
                                </div>
                                <h3 className="text-stone-800 font-bold text-sm mb-1">Collect Moments</h3>
                                <p className="text-stone-500 font-serif text-xs italic">"Sumi captures the soul of your journey..."</p>
                            </div>
                        )}
                    </div>
                </div>

                {stamps.length > 0 && (
                    <p className="text-center text-sm text-stone-400 font-medium mt-4">
                        {stamps.length} stamp{stamps.length > 1 ? 's' : ''} dikumpulkan
                    </p>
                )}
            </div>

            {revealStamp && (
                <StampReveal
                    isOpen={isRevealOpen}
                    onClose={() => setIsRevealOpen(false)}
                    city={revealStamp.city}
                    mood={revealStamp.mood}
                    stampImage={revealStamp.image_url}
                />
            )}
        </div>
    );
}
