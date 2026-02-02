import React from 'react';

interface SuggestionChipsProps {
    onSelect: (city: string) => void;
}

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
    const popularCities = ['Bali', 'Yogyakarta', 'Bandung', 'Tokyo', 'Paris'];

    return (
        <div className="mt-4 flex flex-wrap justify-center gap-3 animate-in fade-in zoom-in duration-500 delay-150">
            {popularCities.map(city => (
                <button
                    key={city}
                    onClick={() => onSelect(city)}
                    className="px-5 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-slate-600 border border-slate-200 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all shadow-sm"
                >
                    Try {city}
                </button>
            ))}
        </div>
    );
}