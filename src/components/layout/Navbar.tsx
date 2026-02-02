'use client';

import Link from 'next/link';
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from '@/components/ui/button';
import { Map, Plane } from 'lucide-react';

export default function Navbar() {
    const { isSignedIn } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-teal-600 p-1.5 rounded-lg text-white group-hover:bg-teal-700 transition-colors">
                    <Plane className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-slate-800 tracking-tight">
                    TravelMate
                </span>
            </Link>

            {/* RIGHT: ACTIONS */}
            <div className="flex items-center gap-4">
                {isSignedIn ? (
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
                    <SignInButton mode="modal">
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200">
                            Sign In
                        </Button>
                    </SignInButton>
                )}
            </div>
        </nav>
    );
}