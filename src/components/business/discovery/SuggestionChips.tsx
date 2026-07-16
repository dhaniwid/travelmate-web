'use client';

import React from 'react';
import Link from 'next/link';

interface SuggestionChipsProps {
    // Legacy callback kept so existing callers don't break (not used anymore)
    onSelect?: (city: string) => void;
}

const CHIPS = [
    { slug: 'bali', label: 'Bali' },
    { slug: 'yogyakarta', label: 'Yogyakarta' },
    { slug: 'semarang', label: 'Semarang' },
    { slug: 'jakarta', label: 'Jakarta' },
    { slug: 'bandung', label: 'Bandung' },
];

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
    return (
        <div className="mt-4 flex flex-wrap justify-center gap-3 animate-in fade-in zoom-in duration-500 delay-150">
            {CHIPS.map(({ slug, label }) => (
                <Link
                    key={slug}
                    href={`/explore/${slug}`}
                    className="px-5 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-slate-600 border border-slate-200 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all shadow-sm"
                    // Legacy support: fire onSelect if parent passes it
                    onClick={() => onSelect?.(label)}
                >
                    {label}
                </Link>
            ))}
        </div>
    );
}
