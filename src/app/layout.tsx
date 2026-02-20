import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import PostHogPageView from "@/components/providers/PostHogPageView";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: 'Miru | AI-Powered Travel Planner',
        template: '%s | Miru',
    },
    description: 'Plan your perfect trip in seconds with Miru. AI-generated itineraries, real-time flight tracking, and smart travel recommendations.',
    keywords: ['AI travel planner', 'trip itinerary generator', 'travel logistics', 'Miru app', 'AI trip planner'],
    manifest: '/manifest.json',
    metadataBase: new URL('https://miru.travel'),
    openGraph: {
        type: 'website',
        siteName: 'Miru',
        title: 'Miru | AI-Powered Travel Planner',
        description: 'Plan your perfect trip in seconds with Miru. AI-generated itineraries, real-time flight tracking, and smart travel recommendations.',
        images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Miru Travel Planner' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Miru | AI-Powered Travel Planner',
        description: 'Plan your perfect trip in seconds with Miru.',
        images: ['/og-default.jpg'],
    },
};


export const viewport = {
    themeColor: "#0d9488",
};

import BottomNav from "@/components/navigation/BottomNav";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={inter.className}>
                    <PostHogProvider>
                        <Providers>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="light"
                                enableSystem
                                disableTransitionOnChange
                            >
                                <PostHogPageView />
                                <div className="pb-20 md:pb-0 min-h-screen">
                                    {children}
                                </div>
                                <BottomNav />
                                <Toaster
                                    position="top-center"
                                    richColors
                                    expand={true}
                                    duration={4000}
                                />
                            </ThemeProvider>
                        </Providers>
                    </PostHogProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}