import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Miru | AI Travel Planner",
    description: "Discover your perfect journey with AI-powered travel planning. Personalized itineraries, smart recommendations, and magical experiences.",
    manifest: "/manifest.json",
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
                    <Providers>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                            enableSystem
                            disableTransitionOnChange
                        >
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
                </body>
            </html>
        </ClerkProvider>
    );
}