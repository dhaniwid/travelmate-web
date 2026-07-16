'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface TrendingDestinationsProps {
    onCreateTrip: () => void;
}

const TRENDING_PLACES = [
    {
        slug: 'bali',
        name: 'Bali',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
        description: 'Pura, sawah, dan ombak — semua dalam satu pulau.',
        tags: ['Alam', 'Budaya'],
    },
    {
        slug: 'yogyakarta',
        name: 'Yogyakarta',
        image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
        description: 'Borobudur, Prambanan, dan kedalaman budaya Jawa.',
        tags: ['Sejarah', 'Warisan Dunia'],
    },
    {
        slug: 'semarang',
        name: 'Semarang',
        image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=600&q=80',
        description: 'Kota kolonial yang belum ditemukan banyak orang.',
        tags: ['Kolonial', 'Kuliner'],
    },
];

export default function TrendingDestinations({ onCreateTrip }: TrendingDestinationsProps) {
    return (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Trending Minggu Ini
                </h2>
                <Link href="/explore">
                    <Button variant="ghost" className="text-teal-600 font-bold hover:text-teal-700 hover:bg-teal-50">
                        Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TRENDING_PLACES.map((place, idx) => (
                    <Link
                        key={idx}
                        href={`/explore/${place.slug}`}
                        className="group relative h-[320px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 ring-1 ring-slate-900/5 hover:-translate-y-1 block"
                    >
                        {/* Image */}
                        <img
                            src={place.image}
                            alt={place.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 p-6 w-full transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                            {/* Tags */}
                            <div className="flex gap-2 mb-3">
                                {place.tags.map((tag, i) => (
                                    <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h3 className="text-white text-2xl font-bold leading-tight mb-2 group-hover:text-teal-200 transition-colors">
                                {place.name}
                            </h3>
                            <p className="text-white/80 text-sm font-medium line-clamp-2 mb-4">
                                {place.description}
                            </p>

                            <div className="w-full py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm hover:bg-white hover:text-slate-900">
                                Lihat Destinasi →
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
