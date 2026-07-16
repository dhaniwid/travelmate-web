'use client';

import { useState } from 'react';
import { Search, MapPin, Umbrella, Building2, Mountain, Palette, Coffee, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Static Data for MVP
const CATEGORIES = [
    { id: 'beach', name: 'Beach', icon: Umbrella, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'city', name: 'City', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'nature', name: 'Nature', icon: Mountain, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'art', name: 'Art', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50' },
    { id: 'cafe', name: 'Cafe', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'all', name: 'More', icon: ArrowRight, color: 'text-slate-500', bg: 'bg-slate-50' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8891';

const POPULAR_DESTINATIONS = [
    { id: 1, slug: 'bali',        name: 'Bali',        rating: '4.8' },
    { id: 2, slug: 'yogyakarta',  name: 'Yogyakarta',  rating: '4.9' },
    { id: 3, slug: 'semarang',    name: 'Semarang',    rating: '4.7' },
    { id: 4, slug: 'jakarta',     name: 'Jakarta',     rating: '4.6' },
    { id: 5, slug: 'bandung',     name: 'Bandung',     rating: '4.7' },
];

export default function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header / Search */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 safe-area-top">
                <div className="flex items-center gap-3 mb-4 px-1">
                    <Link href="/" className="flex items-center gap-1.5 text-slate-500 hover:text-teal-600 transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Home
                    </Link>
                    <h1 className="text-2xl font-black text-slate-900">Explore</h1>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search destinations, vibes..."
                        className="pl-10 h-11 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-teal-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">

                {/* Categories */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="font-bold text-slate-900 text-lg">Categories</h2>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                        {CATEGORIES.map((cat) => (
                            <div key={cat.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                                    cat.bg
                                )}>
                                    <cat.icon className={cn("w-6 h-6", cat.color)} />
                                </div>
                                <span className="text-xs font-medium text-slate-600">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Popular Destinations */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="font-bold text-slate-900 text-lg">Popular Destinations</h2>
                        <Button variant="ghost" size="sm" className="text-teal-600 font-bold hover:text-teal-700 hover:bg-teal-50">
                            See All
                        </Button>
                    </div>

                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {POPULAR_DESTINATIONS.map((dest) => (
                            <Link key={dest.id} href={`/explore/${dest.slug}`} className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer block">
                                <img
                                    src={`${API_BASE}/landmark-images/${dest.slug}_landscape.webp`}
                                    alt={dest.name}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                <div className="absolute bottom-0 left-0 p-3">
                                    <h3 className="text-white font-bold text-sm md:text-base leading-tight">{dest.name}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_: unknown, i: number) => (
                                                <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < 4 ? "bg-teal-400" : "bg-white/30")} />
                                            ))}
                                        </div>
                                        <span className="text-white/80 text-[10px] ml-1">{dest.rating}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Collections / Vibes */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="font-bold text-slate-900 text-lg">Curated For You</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="relative h-40 rounded-3xl overflow-hidden cursor-pointer group">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-slate-800 transition-opacity duration-700 group-hover:opacity-90" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                <h3 className="text-white font-black text-2xl drop-shadow-lg">Hidden Gems in Europe</h3>
                                <Button size="sm" className="mt-4 bg-white/20 backdrop-blur-md border-white/40 hover:bg-white hover:text-slate-900 text-white rounded-full">
                                    Browse Collection
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
