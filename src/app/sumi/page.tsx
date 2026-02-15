'use client';

// Sumi View Wrapper
import { SumiView } from "@/components/passport/SumiView";
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2, Stamp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SumiPage() {
    const { subscription, isLoading } = useSubscription();
    const isPro = subscription?.subscription_tier === 'PRO';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-stone-600 animate-spin" />
            </div>
        );
    }

    if (!isPro) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                    <Stamp className="w-10 h-10 text-stone-500" />
                </div>
                <h1 className="text-3xl font-black text-stone-900 mb-2">Sumi Collection Locked</h1>
                <p className="text-stone-500 mb-8 max-w-md">
                    The Sumi Collection is exclusive to Pro members. Upgrade to track your travels and collect digital living ink.
                </p>
                <Link href="/pricing">
                    <Button size="lg" className="bg-gradient-to-r from-stone-800 to-stone-900 text-white font-bold rounded-full px-8">
                        Upgrade to Access
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <main>
            <SumiView />
        </main>
    );
}
