'use client';

import { useState, useEffect } from 'react';
import { Activity } from '@/types';
import { fetchUnsplashImage } from '@/services/imageService';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MapActivityThumbnail = ({ activity }: { activity: Activity }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const getImage = async () => {
            setLoading(true);
            try {
                // Prioritize place_name, fallback to activity title
                // We add "view" or "landmark" to help Unsplash understand context
                const query = activity.place_name || activity.activity;
                const url = await fetchUnsplashImage(`${query} landmark`);

                if (isMounted) {
                    if (url) {
                        setImageUrl(url);
                    } else {
                        setImageUrl(null);
                    }
                }
            } catch (error) {
                console.error("Failed to load map thumbnail", error);
                if (isMounted) setImageUrl(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        getImage();
        return () => { isMounted = false; };
    }, [activity]);

    // 1. Loading State
    if (loading) {
        return (
            <div className="h-32 w-full bg-slate-100 animate-pulse flex items-center justify-center rounded-t-lg">
                <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
            </div>
        );
    }

    // 2. Image Loaded
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={activity.activity}
                className="h-32 w-full object-cover rounded-t-lg"
            />
        );
    }

    // 3. Fallback (No Image) - Clean Gradient
    return (
        <div className="h-32 w-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center rounded-t-lg">
            <MapPin className="w-8 h-8 text-white/30" />
        </div>
    );
};
