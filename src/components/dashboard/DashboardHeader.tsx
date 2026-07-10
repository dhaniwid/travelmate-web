'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserSubscription } from "@/types/subscription";

interface DashboardHeaderProps {
    subscription: UserSubscription | undefined;
    isSubLoading: boolean;
}

export default function DashboardHeader({ subscription, isSubLoading }: DashboardHeaderProps) {
    const { user } = useUser();
    const initial = user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || '?';

    return (
        <header className="bg-[#060F1E] border-b border-white/5 sticky top-0 z-30">
            <div className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* LEFT: BRANDING */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">M</span>
                    </div>
                    <Link href="/dashboard">
                        <span className="text-[17px] font-medium text-white">
                            Miru<span className="text-orange-400">.</span>
                        </span>
                    </Link>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="flex items-center gap-3">
                    {!isSubLoading && subscription?.subscription_tier === 'FREE' && (
                        <Button asChild size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 h-9 px-3 text-xs">
                            <Link href="/pricing"><Zap className="w-3 h-3 mr-1" /> PRO</Link>
                        </Button>
                    )}
                    {/* Desktop: avatar → /profile */}
                    <Link href="/profile" className="hidden md:flex w-8 h-8 rounded-full bg-teal-500 items-center justify-center hover:bg-teal-600 transition-colors" style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                        <span className="text-[13px] font-medium text-white leading-none">{initial}</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
