// src/hooks/useDiscovery.ts
import { useState } from 'react';
import { tripService } from '@/services/trip';
import { getDestinationImage } from '@/lib/images';
import { DiscoveryResponse } from '@/types';

export function useDiscovery() {
    const [searchCity, setSearchCity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [discoveryData, setDiscoveryData] = useState<DiscoveryResponse | null>(null);
    const [heroImage, setHeroImage] = useState<string | null>(null);

    const performSearch = async (city: string) => {
        const query = city.trim();
        if (!query) return;

        // 1. Reset State & Start Loading
        setDiscoveryData(null);
        setHeroImage(null);
        setIsLoading(true);

        try {
            // 2. Fetch Data (Parallel is better for UX if API is fast, but sequential is safer for loading state consistency)
            const data = await tripService.getCityDiscovery(query);
            setDiscoveryData(data);

            // 3. Fetch Image (Non-blocking / Fire and Forget)
            getDestinationImage(`${query} city travel landmark`)
                .then(url => setHeroImage(url))
                .catch(err => console.warn("Image fetch failed", err));

        } catch (error) {
            console.error(error);
            alert("Failed to find city info. Try 'Bali' or 'Tokyo'.");
        } finally {
            // 4. Stop Loading
            setIsLoading(false);
        }
    };

    const clearSearch = () => {
        setDiscoveryData(null);
        setSearchCity('');
        setHeroImage(null);
    };

    return {
        searchCity,
        setSearchCity,
        isLoading,
        discoveryData,
        heroImage,
        performSearch,
        clearSearch
    };
}