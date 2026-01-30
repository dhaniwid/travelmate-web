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
                    attribute="data-theme"
                    defaultTheme="light"
                    enableSystem
                    themes={["light", "teal", "violet"]}
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster position="top-center" />
                </ThemeProvider>
            </Providers>
            </body>
            </html>
        </ClerkProvider>
    );
}