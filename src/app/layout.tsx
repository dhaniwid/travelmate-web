import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TravelMate AI",
    description: "Your intelligent travel planner",
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
                            <Toaster position="top-center" />
                        </ThemeProvider>
                    </Providers>
                </body>
            </html>
        </ClerkProvider>
    );
}