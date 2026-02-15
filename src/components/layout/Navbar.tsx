'use client';

import Link from 'next/link';
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { isSignedIn } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
            {/* Logo - Temporarily removed to prevent stacking on trip header */}
            {/* Will reposition in Sprint 3 */}
            {/* <Link href="/" className="flex items-center gap-2 group">
                <img src="/logo/miru-main-logo.png" alt="Miru" className="h-8" />
            </Link> */}

            {/* RIGHT: ACTIONS */}
            <div className="flex items-center gap-4">
                {mounted && (
                    isSignedIn ? (
                        <>
                            {/* Tombol History - HANYA MUNCUL JIKA LOGIN */}
                            <Link href="/history">
                                <Button variant="ghost" className="gap-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50">
                                    <Map className="w-4 h-4" />
                                    <span className="hidden sm:inline">My Trips</span>
                                </Button>
                            </Link>

                            {/* Profile Menu */}
                            <UserButton afterSignOutUrl="/" />
                        </>
                    ) : (
                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200">
                                Sign In
                            </Button>
                        </SignInButton>
                    )
                )}
            </div>
        </nav>
    );
}