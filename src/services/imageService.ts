export async function fetchUnsplashImage(query: string): Promise<string | null> {
    const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        console.warn("Missing NEXT_PUBLIC_UNSPLASH_ACCESS_KEY");
        return null;
    }

    // Check Session Storage Cache
    const cacheKey = `unsplash_${query}`;
    if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) return cached;
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?page=1&per_page=1&orientation=landscape&query=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `Client-ID ${accessKey}`
                }
            }
        );

        if (!response.ok) {
            console.error("Unsplash API Error:", response.statusText);
            return null;
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].urls.regular;

            // Cache result
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(cacheKey, imageUrl);
            }

            return imageUrl;
        }

        return null;
    } catch (error) {
        console.error("Failed to fetch Unsplash image:", error);
        return null;
    }
}
