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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-200">
            <div className="flex items-center justify-between px-5 h-16 max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto w-full">
                {/* LOGO — always visible */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center">
                        <span className="text-white text-sm font-black tracking-tight">M</span>
                    </div>
                    <span className="text-[19px] font-bold tracking-tight text-zinc-950">
                        Miru<span className="text-teal-600">.</span>
                    </span>
                </Link>

                {/* RIGHT: shown when signed in, or clean sign-in button */}
                {mounted && (
                    isSignedIn ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-full transition-colors"
                            >
                                Dashboard
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    ) : (
                        <Link
                            href="/sign-in"
                            className="text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 px-4 py-2 rounded-full transition-colors"
                        >
                            Masuk
                        </Link>
                    )
                )}
            </div>
        </nav>
    );
}