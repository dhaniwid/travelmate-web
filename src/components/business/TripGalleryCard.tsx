'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trip } from '@/types';
import {
    Calendar, Clock, Trash2, Loader2, Plane, MapPin
} from 'lucide-react';
import { fetchUnsplashImage } from '@/services/imageService';
import { cn, formatDate } from '@/lib/utils';

interface TripGalleryCardProps {
    trip: Trip;
    onDelete: (id: string) => void;
}

export default function TripGalleryCard({ trip, onDelete }: TripGalleryCardProps) {
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- LOGIC: TIME STATUS & COUNTDOWN ---
    const startDate = new Date(trip.start_date ?? 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    const isPast = startDate < today;
    const isToday = startDate.getTime() === today.getTime();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // --- EFFECT: LOAD IMAGE ---
    useEffect(() => {
        let isMounted = true;
        const loadImage = async () => {
            setIsLoadingImage(true);
            try {
                // Try fetching specific destination image from Unsplash
                const url = await fetchUnsplashImage(trip.destination);
                if (isMounted) {
                    if (url) {
                        setBgImage(url);
                    } else {
                        // If null (API error or empty), validation requirement says NO broken icons.
                        // We will leave bgImage null to trigger Gradient Fallback.
                        setBgImage(null);
                    }
                }
            } catch (error) {
                console.error("Image load failed", error);
                if (isMounted) setBgImage(null);
            } finally {
                if (isMounted) setIsLoadingImage(false);
            }
        };
        loadImage();
        return () => { isMounted = false; };
    }, [trip.destination]);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Delete trip to ${trip.destination}?`)) {
            setIsDeleting(true);
            onDelete(trip.id);
        }
    };

    return (
        <div className="group relative aspect-[4/3] md:aspect-[16/10] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-slate-200">

            {/* Background Layer */}
            <div className="absolute inset-0 w-full h-full bg-slate-200 transition-transform duration-700 group-hover:scale-110">
                {bgImage ? (
                    <img
                        src={bgImage}
                        alt={trip.destination}
                        className={cn(
                            "w-full h-full object-cover transition-opacity duration-700",
                            isLoadingImage ? "opacity-0" : "opacity-100"
                        )}
                    />
                ) : (
                    // GRADIENT FALLBACK (No Broken Icons)
                    <div className={cn(
                        "w-full h-full bg-gradient-to-br from-blue-600 to-teal-400 flex items-center justify-center",
                        isLoadingImage ? "opacity-0" : "opacity-100"
                    )}>
                        <Plane className="w-16 h-16 text-white/20 rotate-[-12deg]" />
                    </div>
                )}
            </div>

            {/* Overlay Gradient: Stronger bottom shade for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Badges (Top right) */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                {!isPast && !isToday && (
                    <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                        <Clock className="w-3 h-3" />
                        In {diffDays} Days
                    </div>
                )}
                {isToday && (
                    <div className="px-3 py-1.5 rounded-full bg-teal-500/80 backdrop-blur-md border border-teal-400/50 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl animate-pulse">
                        <Plane className="w-3 h-3" />
                        Today
                    </div>
                )}
                {isPast && (
                    <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        Completed
                    </div>
                )}
            </div>

            {/* Interaction Layer (Link) */}
            <Link href={`/trips/${trip.id}`} className="absolute inset-0 z-0" />

            {/* Content (Bottom Left) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-teal-400/80" />
                    <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Adventure</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-2 drop-shadow-md">
                    {trip.destination}
                </h3>
                <p className="text-slate-200 text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 opacity-80" />
                    {formatDate(trip.start_date)}
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                    {trip.trip_days} Days
                </p>
            </div>

            {/* Action Buttons (Hover Only) */}
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="p-2.5 bg-red-500/20 hover:bg-red-500 text-white rounded-full backdrop-blur-md border border-white/10 transition-all"
                    title="Delete Trip"
                >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
