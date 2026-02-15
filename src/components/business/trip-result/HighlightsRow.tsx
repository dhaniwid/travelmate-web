'use client';

import React from 'react';
import { TripHighlight } from '@/types';
import { Compass, Mountain, Building2, MapPin, Camera, Sun, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HighlightsRowProps {
    highlights?: TripHighlight[];
    destination: string;
}

const getIconForType = (type: string): LucideIcon => {
    const t = type.toLowerCase();
    if (t.includes('nature') || t.includes('mountain')) return Mountain;
    if (t.includes('culture') || t.includes('history') || t.includes('building')) return Building2;
    if (t.includes('urban') || t.includes('city')) return MapPin;
    if (t.includes('photo') || t.includes('view')) return Camera;
    if (t.includes('beach') || t.includes('sun')) return Sun;
    return Compass;
};

const HighlightCard = ({ place }: { place: TripHighlight }) => {
    const Icon = getIconForType(place.type || '');
    const imageUrl = (place as any).image_url; // Some highlights might have enriched URLs

    return (
        <div className="flex-none w-64 h-80 relative rounded-[2rem] overflow-hidden group transition-all duration-500 hover:scale-[1.02] snap-start shadow-lg border border-white/10">
            {/* Background: Image or Gradient fallback */}
            {imageUrl ? (
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                    <Icon className="w-20 h-20 text-white/20 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" />
                </div>
            )}

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-white/90">
                        <Icon className="w-3 h-3 text-teal-300" />
                        {place.type || 'SPOT'}
                    </div>
                    <h4 className="text-xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                        {place.title}
                    </h4>
                    <p className="text-xs font-semibold text-white/70 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {place.hook}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function HighlightsRow({ highlights }: HighlightsRowProps) {
    if (!highlights || highlights.length === 0) return null;

    return (
        <div className="relative group/carousel">
            {/* Carousel Container */}
            <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x px-4 md:px-0 pb-8 pt-4">
                {highlights.map((h, i) => (
                    <HighlightCard key={i} place={h} />
                ))}
            </div>

            {/* Subtle Gradient Fades for Scroll */}
            <div className="absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
            <div className="absolute top-0 left-0 bottom-8 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
        </div>
    );
}
