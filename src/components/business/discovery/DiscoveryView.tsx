'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Utensils, ArrowRight, MapPin,
    Mountain, Building2, Palmtree, Compass, History, Info
} from 'lucide-react';
import { DiscoveryResponse, PlaceHighlight, CulinarySignature, HiddenGem } from '@/types';

// ============================================================================
// 1. SUB-COMPONENTS (EDITORIAL STYLE)
// ============================================================================

const HeroSection = ({ data, heroImage }: { data: DiscoveryResponse; heroImage: string | null }) => (
    <div className="relative rounded-[2.5rem] overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center p-8 shadow-2xl shadow-teal-900/10 group isolate bg-slate-900">
        {/* Background Image (Satu-satunya gambar utama yang kita butuhkan) */}
        {heroImage ? (
            <div
                className="absolute inset-0 bg-cover bg-center opacity-80 transition-transform duration-[3s] ease-out group-hover:scale-105 will-change-transform"
                style={{ backgroundImage: `url(${heroImage})` }}
            />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-teal-900" />
        )}

        {/* Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-900/30 mix-blend-multiply" />

        {/* Content */}
        <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
            {/* Super Large Typography */}
            <h1 className="text-[5rem] md:text-[9rem] leading-[0.85] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-xl select-none">
                {data.city.toUpperCase()}
            </h1>

            <div className="flex flex-col items-center gap-6">
                <p className="text-2xl md:text-3xl font-serif italic text-white/90 leading-relaxed max-w-2xl drop-shadow-md">
                    "{data.tagline}"
                </p>

                {/* Minimalist Vibes Badges */}
                <div className="flex flex-wrap gap-3 justify-center">
                    {data.vibes.map((vibe, idx) => (
                        <span key={idx} className="px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.2em] shadow-sm">
                            {vibe}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const StorySection = ({ text }: { text: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-8">
        <div className="md:col-span-3 hidden md:flex justify-end border-r border-slate-200 pr-8">
            <History className="w-16 h-16 text-teal-900/20" />
        </div>
        <div className="md:col-span-9">
            <h3 className="text-teal-600 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-teal-600" /> The Story
            </h3>
            <p className="text-xl md:text-3xl font-serif text-slate-800 leading-relaxed">
                {text}
            </p>
        </div>
    </div>
);

// Kartu Highlight "Tanpa Foto" tapi tetap Menarik (Color Block + Big Icon)
const HighlightCard = ({ place, index }: { place: PlaceHighlight, index: number }) => {
    // Tentukan warna dan icon berdasarkan tipe
    let bgClass = "bg-slate-50";
    let textClass = "text-slate-600";
    let Icon = Compass;

    const t = place.type.toLowerCase();
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
        <div className={`${bgClass} rounded-[2rem] p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full min-h-[280px] flex flex-col justify-between`}>
            {/* Watermark Icon Besar (Pengganti Foto) */}
            <Icon className={`absolute -right-8 -bottom-8 w-48 h-48 opacity-5 ${textClass} group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 rotate-12`} />

            {/* Content */}
            <div className="relative z-10">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 ${textClass} text-[10px] font-bold uppercase tracking-widest mb-4`}>
                    <Icon className="w-3 h-3" /> {place.type}
                </div>
                <h4 className={`text-3xl font-black mb-3 ${textClass} leading-tight`}>
                    {place.title}
                </h4>
            </div>

            <div className="relative z-10 pt-8 border-t border-black/5 mt-auto">
                <p className={`text-sm md:text-base font-medium opacity-80 leading-relaxed ${textClass}`}>
                    {place.hook}
                </p>
            </div>
        </div>
    );
};

const CulinaryList = ({ items }: { items: CulinarySignature[] }) => (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-full">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
            <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                <Utensils className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-800 uppercase tracking-tight">Taste of the City</h3>
            </div>
        </div>

        <div className="space-y-8">
            {items.map((food, idx) => (
                <div key={idx} className="group relative pl-6 border-l-2 border-slate-100 hover:border-orange-400 transition-colors">
                    <h5 className="font-bold text-xl text-slate-900 group-hover:text-orange-600 transition-colors mb-1">
                        {food.name}
                    </h5>
                    <p className="text-slate-500 text-sm leading-relaxed mb-2 italic">
                        "{food.description}"
                    </p>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1">
                        <Info className="w-3 h-3" /> {food.tip}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

const HiddenGemCard = ({ item }: { item: HiddenGem }) => (
    <div className="bg-slate-900 rounded-[2rem] p-10 md:p-14 relative overflow-hidden group text-white">
        {/* Abstract Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-20 h-20 rounded-full border-2 border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Compass className="w-10 h-10 animate-pulse" />
            </div>
            <div>
                <div className="text-teal-400 font-bold uppercase tracking-[0.2em] text-xs mb-2">
                    Local's Secret
                </div>
                <h3 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                    {item.name}
                </h3>
                <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">
                    {item.description}
                </p>
            </div>
        </div>
    </div>
);

const FloatingCTA = ({ city, onClick }: { city: string; onClick: () => void }) => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-500 w-full px-4 flex justify-center pointer-events-none">
        <Button
            size="lg"
            onClick={onClick}
            className="pointer-events-auto rounded-full shadow-2xl shadow-teal-900/20 bg-slate-900 hover:bg-black text-white px-8 h-16 text-lg gap-3 transition-all hover:scale-105 active:scale-95 group border-4 border-white"
        >
            <span className="font-medium">Start Planning to <span className="font-bold text-teal-400">{city}</span></span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
    </div>
);

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

interface DiscoveryViewProps {
    data: DiscoveryResponse;
    onPlanTrip: () => void;
    heroImage: string | null;
}

export default function DiscoveryView({ data, onPlanTrip, heroImage }: DiscoveryViewProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">

            <HeroSection data={data} heroImage={heroImage} />

            <div className="max-w-7xl mx-auto px-4 space-y-12">

                {/* 1. Narrative Section */}
                <StorySection text={data.history_snippet} />

                {/* 2. Masonry Grid for Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Column 1: Highlights */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {data.highlights.map((place, idx) => (
                            <HighlightCard key={idx} place={place} index={idx} />
                        ))}
                    </div>

                    {/* Column 2: Culinary (Tall) */}
                    <div className="md:col-span-1">
                        <CulinaryList items={data.culinary_signature} />
                    </div>
                </div>

                {/* 3. Footer Feature: Hidden Gem */}
                <HiddenGemCard item={data.hidden_gem} />

            </div>

            <FloatingCTA city={data.city} onClick={onPlanTrip} />
        </div>
    );
}