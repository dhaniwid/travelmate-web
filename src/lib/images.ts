// Pastikan variable ini sesuai dengan key dari dashboard Unsplash Anda
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_KEY;

export async function getDestinationImage(query: string): Promise<string> {
    const pollinationsFallback = `https://image.pollinations.ai/prompt/cinematic%20travel%20photo%20of%20${encodeURIComponent(query)}?width=1280&height=720&nologo=true`;

    // 1. Try Unsplash if Key exists
    if (UNSPLASH_ACCESS_KEY) {
        try {
            const res = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${query}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`);

            if (res.ok) {
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    return data.results[0].urls.regular;
                }
            }
        } catch (e) {
            console.error("Failed to fetch from Unsplash", e);
        }
    }

    // 2. Return Pollinations as reliable dynamic fallback
    return pollinationsFallback;
}