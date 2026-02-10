import { fetchUnsplashImage } from './src/services/imageService';

// Mock browser storage
global.sessionStorage = {
    getItem: () => null,
    setItem: () => { }
} as any;

async function test() {
    console.log("Testing Unsplash Service...");
    if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
        console.error("Please set NEXT_PUBLIC_UNSPLASH_ACCESS_KEY");
        return;
    }

    try {
        const url = await fetchUnsplashImage("Bali");
        if (url && url.startsWith("https://images.unsplash.com")) {
            console.log("✅ Success! Fetched:", url);
        } else {
            console.error("❌ Failed. URL:", url);
        }
    } catch (e) {
        console.error("❌ Exception:", e);
    }
}
test();
