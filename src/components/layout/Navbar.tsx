'use client';

import Link from 'next/link';
import { useAuth, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { isSignedIn } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060F1E]/80 backdrop-blur-md flex items-center justify-between px-5 py-4 max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto w-full">
            {/* LOGO — always visible */}
            <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-[17px] font-medium text-white">
                    Miru<span className="text-orange-400">.</span>
                </span>
            </Link>

            {/* RIGHT: only shown when signed in */}
            {mounted && isSignedIn && (
                <UserButton afterSignOutUrl="/" />
            )}
        </nav>
    );
}