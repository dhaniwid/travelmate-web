'use client';

import React from 'react';
import { TripHighlight } from '@/types';
import { Compass, Mountain, Building2, MapPin } from 'lucide-react';

interface HighlightsRowProps {
    highlights?: TripHighlight[];
    destination: string;
}

const HighlightCard = ({ place }: { place: TripHighlight }) => {
    let bgClass = "bg-slate-50";
    let textClass = "text-slate-600";
    let Icon = Compass;

    const t = (place.type || '').toLowerCase();
    if (t.includes('nature')) {
        bgClass = "bg-[#F3F6F1]"; // Soft Sage Green
        textClass = "text-[#3D5A40]";
        Icon = Mountain;
    } else if (t.includes('culture') || t.includes('history')) {
        bgClass = "bg-[#FDF6F0]"; // Soft Warm Beige
        textClass = "text-[#8D5B4C]";
        Icon = Building2;
    } else if (t.includes('urban')) {
        bgClass = "bg-[#F0F4F8]"; // Soft Cool Blue
        textClass = "text-[#334E68]";
        Icon = MapPin;
    }

    return (
        <div className={`${bgClass} rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full min-h-[240px] flex flex-col justify-between border border-black/5`}>
            {/* Watermark Icon */}
            <Icon className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-5 ${textClass} group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 rotate-12`} />

            {/* Content */}
            <div className="relative z-10">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 ${textClass} text-[10px] font-bold uppercase tracking-widest mb-4`}>
                    <Icon className="w-3 h-3" /> {place.type || 'SIGHTSEEING'}
                </div>
                <h4 className={`text-2xl font-black mb-2 ${textClass} leading-tight`}>
                    {place.title}
                </h4>
            </div>

            <div className="relative z-10 pt-4 border-t border-black/5 mt-auto">
                <p className={`text-sm font-medium opacity-80 leading-relaxed ${textClass}`}>
                    {place.hook}
                </p>
            </div>
        </div>
    );
};

export default function HighlightsRow({ highlights }: HighlightsRowProps) {
    if (!highlights || highlights.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
            {highlights.map((h, i) => (
                <HighlightCard key={i} place={h} />
            ))}
        </div>
    );
}
