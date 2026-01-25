// Pastikan variable ini sesuai dengan key dari dashboard Unsplash Anda
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_KEY || 'geYRTotvLpltLXzVSpjoHXM3I_KQj8r_j_9ahrVrTZw';

export async function getDestinationImage(query: string): Promise<string> {
    const staticFallback = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

    // Cek apakah key masih default/kosong
    if (!UNSPLASH_ACCESS_KEY) {
        console.warn("⚠️ Unsplash API Key missing. Using fallback image.");
        return staticFallback;
    }

    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${query}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`);

        if (!res.ok) {
            console.error("Unsplash API Error:", res.status, res.statusText);
            return staticFallback;
        }

        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.regular;
        }
        return staticFallback;
    } catch (e) {
        console.error("Failed to fetch image", e);
        return staticFallback;
    }
}