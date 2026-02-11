import React, { useState, useEffect } from 'react';
import { Bed, MapPin, Building, ExternalLink, Sparkles } from 'lucide-react';
import { AccommodationOption } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { fetchUnsplashImage } from '@/services/imageService';
import { cn } from '@/lib/utils';

import { getHotelSearchLink } from '@/utils/booking';

interface AccommodationCardProps {
    option: AccommodationOption;
    tripContext: {
        destination: string;
        startDate: string;
        days: number;
    };
    className?: string;
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({ option, tripContext, className }) => {
    const [neighborhoodImage, setNeighborhoodImage] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(true);

    // Load neighborhood image
    useEffect(() => {
        const loadImage = async () => {
            try {
                const url = await fetchUnsplashImage(`${option.area_name} ${tripContext.destination}`);
                setNeighborhoodImage(url);
            } catch (error) {
                console.error('Failed to load neighborhood image', error);
            } finally {
                setIsLoadingImage(false);
            }
        };
        loadImage();
    }, [option.area_name, tripContext.destination]);

    // Generate Booking.com Search URL with Dates
    const searchLocation = `${option.area_name}, ${tripContext.destination}`;
    const bookingSearchUrl = getHotelSearchLink(searchLocation, tripContext.startDate, tripContext.days);

    // Determine "Best For" badge from reason or vibe
    const getBestForBadge = () => {
        const text = `${option.reason} ${option.vibe || ''}`.toLowerCase();
        if (text.includes('nature') || text.includes('green') || text.includes('park')) return { label: 'Nature', emoji: '🌿' };
        if (text.includes('nightlife') || text.includes('bar') || text.includes('club')) return { label: 'Nightlife', emoji: '🌃' };
        if (text.includes('culture') || text.includes('historic') || text.includes('museum')) return { label: 'Culture', emoji: '🏛️' };
        if (text.includes('food') || text.includes('culinary') || text.includes('restaurant')) return { label: 'Foodie', emoji: '🍜' };
        if (text.includes('shopping') || text.includes('mall')) return { label: 'Shopping', emoji: '🛍️' };
        if (text.includes('quiet') || text.includes('peaceful') || text.includes('relax')) return { label: 'Relaxation', emoji: '🧘' };
        if (text.includes('modern') || text.includes('trendy') || text.includes('hip')) return { label: 'Modern', emoji: '✨' };
        return null;
    };

    const bestFor = getBestForBadge();

    // Parse hotel suggestions into array for clickable links
    const hotelList: string[] = Array.isArray(option.hotel_suggestions)
        ? option.hotel_suggestions
        : ((option.hotel_suggestions as string) || '').split(',').map((h: string) => h.trim()).filter(Boolean);

    return (
        <div className={cn(
            "group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300",
            "bg-white/80 backdrop-blur-sm border border-white/20",
            className
        )}>
            {/* Neighborhood Image Banner */}
            <div className="relative w-full h-32 bg-gradient-to-br from-teal-100 to-blue-100 overflow-hidden">
                {neighborhoodImage ? (
                    <img
                        src={neighborhoodImage}
                        alt={option.area_name}
                        className={cn(
                            "w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
                            isLoadingImage ? "opacity-0" : "opacity-100"
                        )}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white/30" />
                    </div>
                )}
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Best For Badge */}
                {bestFor && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-teal-500/90 backdrop-blur-sm border border-white/30 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <span>{bestFor.emoji}</span>
                        <span>Best for {bestFor.label}</span>
                    </div>
                )}
            </div>

            <div className="p-5">
                {/* Header: Area Name & Type */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                            <Bed className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-800">{option.area_name}</h4>
                            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {option.type || 'Stay'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body: Reason & Vibe */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600 leading-relaxed">
                            <span className="font-medium text-slate-700">Why here:</span> {option.reason}
                        </p>
                    </div>
                    {option.vibe && (
                        <div className="flex items-start gap-2">
                            <Building className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                            <p className="text-sm text-slate-500 italic">
                                "{option.vibe}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer: Hotel Suggestions & Action */}
                <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Top Picks</p>
                        <div className="flex flex-wrap gap-2">
                            {hotelList.length > 0 ? (
                                hotelList.map((hotel: string, idx: number) => (
                                    <a
                                        key={idx}
                                        href={`https://www.google.com/maps/search/${encodeURIComponent(hotel + ' ' + tripContext.destination)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium transition-colors"
                                    >
                                        {hotel}{idx < hotelList.length - 1 ? ',' : ''}
                                    </a>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">Check local listings</p>
                            )}
                        </div>
                    </div>

                    <a href={bookingSearchUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 text-teal-600 border-teal-200 hover:bg-teal-50 hover:text-teal-700">
                            Check Rates <ExternalLink className="w-3 h-3" />
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AccommodationCard;
