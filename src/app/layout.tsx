import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner"; // <--- 1. Import Toaster

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
        <html lang="en">
        <body className={inter.className}>
        <Providers>
            {children}
            <Toaster position="top-center" /> {/* <--- 2. Pasang di sini */}
        </Providers>
        </body>
        </html>
    );
}