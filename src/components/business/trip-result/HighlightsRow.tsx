import React from 'react';
import { PlaceHighlight } from '@/types';
import { getSmartImage } from '@/utils/image-generator';

interface HighlightsRowProps {
    highlights?: PlaceHighlight[];
    destination: string;
}

export default function HighlightsRow({ highlights, destination }: HighlightsRowProps) {
    return null; // Temporarily disabled due to broken dynamic image service

    return (
        <div className="flex flex-wrap justify-center gap-6 py-8">
            {(highlights || []).map((h, i) => {
                const imageUrl = getSmartImage(`${destination} ${h.title}`, 'activity');
                return (
                    <div key={i} className="group relative h-32 w-56 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
                        <img
                            src={imageUrl}
                            alt={h.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-bold text-[10px] text-slate-400 p-4 text-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 text-white">
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-0.5">Highlight</p>
                            <p className="font-bold text-lg leading-tight">{h.title}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
