'use client';

import React from 'react';
import { TripHighlight } from '@/types';
import { Compass, Mountain, Building2, ShoppingBag, UtensilsCrossed, Landmark, TreePine, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchUnsplashImage } from '@/services/imageService';

interface HighlightsRowProps {
    highlights?: TripHighlight[];
    destination: string;
}

interface CategoryStyle {
    icon: LucideIcon;
    gradient: string;
    iconColor: string;
    badge: string;
}

const getCategoryStyle = (type: string): CategoryStyle => {
    const t = type.toLowerCase();

    if (t.includes('culinary') || t.includes('food') || t.includes('kuliner') || t.includes('makan') || t.includes('restaurant')) {
        return {
            icon: UtensilsCrossed,
            gradient: 'from-orange-500 to-amber-600',
            iconColor: 'text-orange-200',
            badge: 'bg-orange-500/80',
        };
    }
    if (t.includes('shop') || t.includes('market') || t.includes('belanja') || t.includes('pasar')) {
        return {
            icon: ShoppingBag,
            gradient: 'from-slate-600 to-slate-800',
            iconColor: 'text-slate-300',
            badge: 'bg-slate-500/80',
        };
    }
    if (t.includes('nature') || t.includes('mountain') || t.includes('beach') || t.includes('forest') || t.includes('alam') || t.includes('pantai') || t.includes('gunung')) {
        return {
            icon: TreePine,
            gradient: 'from-green-600 to-emerald-700',
            iconColor: 'text-green-200',
            badge: 'bg-green-600/80',
        };
    }
    // Default: Sightseeing / culture / history
    return {
        icon: Landmark,
        gradient: 'from-teal-500 to-teal-700',
        iconColor: 'text-teal-200',
        badge: 'bg-teal-600/80',
    };
};

const HighlightCard = ({ place }: { place: TripHighlight }) => {
    const style = getCategoryStyle(place.type || '');
    const Icon = style.icon;
    const [imageUrl, setImageUrl] = React.useState<string | null>(place.image_url || null);
    const [imgLoaded, setImgLoaded] = React.useState(false);

    React.useEffect(() => {
        if (imageUrl) return;
        const query = place.image_prompt || place.title;
        if (!query) return;
        fetchUnsplashImage(query).then(url => {
            if (url) setImageUrl(url);
        });
    }, []);

    return (
        <div className="flex-none w-64 h-80 relative rounded-[2rem] overflow-hidden group transition-all duration-500 hover:scale-[1.02] snap-start shadow-lg border border-white/10">
            {/* Background: photo or category-coloured fallback */}
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                <Icon className={`w-24 h-24 ${style.iconColor} opacity-30 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6`} />
            </div>
            {imageUrl && (
                <div
                    className={cn(
                        "absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-110",
                        imgLoaded ? "opacity-100" : "opacity-0"
                    )}
                    style={{ backgroundImage: `url(${imageUrl})` }}
                    onLoad={() => setImgLoaded(true)}
                >
                    <img src={imageUrl} alt="" className="hidden" onLoad={() => setImgLoaded(true)} />
                </div>
            )}

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${style.badge} backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white`}>
                        <Icon className="w-3 h-3" />
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
