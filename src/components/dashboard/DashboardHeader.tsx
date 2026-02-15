'use client';

import React from 'react';
import { UserButton } from "@clerk/nextjs";
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import QuotaIndicator from "@/components/dashboard/QuotaIndicator";
import { TripQuota, UserSubscription } from "@/types/subscription";

interface DashboardHeaderProps {
    quota: TripQuota | undefined;
    subscription: UserSubscription | undefined;
    isSubLoading: boolean;
}

export default function DashboardHeader({ quota, subscription, isSubLoading }: DashboardHeaderProps) {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* LEFT: BRANDING */}
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="group">
                        <span className="font-black text-2xl tracking-tighter text-teal-800 group-hover:text-emerald-900 transition-colors">
                            Miru<span className="text-orange-500">.</span>
                        </span>
                    </Link>

                    {/* PC View: Quota Indicator next to brand */}
                    <div className="hidden sm:block pl-6 border-l border-slate-200 h-6 flex items-center">
                        <QuotaIndicator quota={quota} subscription={subscription} isLoading={isSubLoading} />
                    </div>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="flex items-center gap-4">
                    {/* Mobile: Quota is here or hidden? Let's show upgrade button on mobile if free */}
                    {!isSubLoading && subscription?.subscription_tier === 'FREE' && (
                        <Button asChild size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 sm:hidden">
                            <Link href="/pricing"><Zap className="w-4 h-4 mr-1" /> Upgrade</Link>
                        </Button>
                    )}

                    {/* Mobile View: Quota Indicator (Compact) */}
                    <div className="sm:hidden">
                        {/* We can hide quota on very small screens or keep it if it fits */}
                    </div>

                    <div className="pl-2">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </div>
        </header>
    );
}
