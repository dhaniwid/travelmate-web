'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserSubscription } from "@/types/subscription";
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
    subscription: UserSubscription | undefined;
    isSubLoading: boolean;
    onUpgradeClick?: () => void;
}

export default function DashboardHeader({ subscription, isSubLoading, onUpgradeClick }: DashboardHeaderProps) {
    const { user } = useUser();
    const pathname = usePathname();
    const initial = user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || '?';

    const desktopTabs = [
        { href: '/dashboard', label: 'Beranda', active: pathname === '/dashboard' },
        { href: '/explore', label: 'Eksplor', active: pathname === '/explore' || pathname?.startsWith('/explore/') },
        { href: '/profile', label: 'Profil', active: pathname === '/profile' },
    ];

    return (
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
            <div className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* LEFT: BRANDING + DESKTOP NAV */}
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center">
                            <span className="text-white text-sm font-black tracking-tight">M</span>
                        </div>
                        <span className="text-[19px] font-bold tracking-tight text-zinc-950">
                            Miru<span className="text-teal-600">.</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {desktopTabs.map((tab) => (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors",
                                    tab.active
                                        ? "bg-zinc-950 text-white"
                                        : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                                )}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="flex items-center gap-3">
                    {!isSubLoading && subscription?.subscription_tier === 'FREE' && (
                        <Button size="sm" variant="outline" className="border-zinc-950 text-zinc-950 hover:bg-zinc-950 hover:text-white h-8 px-3 text-xs font-bold rounded-full" onClick={onUpgradeClick}>
                            <Zap className="w-3.5 h-3.5 mr-1 text-teal-600" /> PRO
                        </Button>
                    )}
                    {/* Desktop: avatar → /profile */}
                    <Link href="/profile" className="hidden md:flex w-9 h-9 rounded-full bg-zinc-950 items-center justify-center hover:bg-zinc-800 transition-colors">
                        <span className="text-xs font-bold text-white leading-none">{initial}</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
