/**
 * Generates a dynamic, context-aware image URL using Pollinations AI.
 * No API key required, high speed, and contextually relevant.
 */
export function getSmartImage(keyword: string, type: 'scenic' | 'food' | 'activity' | 'hero' = 'scenic'): string {
    let promptPrefix = "cinematic travel photography of ";

    if (type === 'food') {
        promptPrefix = "top view high resolution food photography of ";
    } else if (type === 'activity') {
        promptPrefix = "vibrant travel action shot of ";
    } else if (type === 'hero') {
        promptPrefix = "epic cinematic landscape shot of ";
    }

    const fullPrompt = `${promptPrefix}${keyword}, highly detailed, 8k resolution, professional lighting`;
    const encodedPrompt = encodeURIComponent(fullPrompt);

    // Using 800x600 as a standard high-quality aspect ratio for cards and headers
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
}
