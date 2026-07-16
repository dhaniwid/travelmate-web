import { Button } from "@/components/ui/button";
import { UserSubscription } from "@/types/subscription";
import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";

interface QuotaIndicatorProps {
    subscription: UserSubscription | undefined;
    isLoading: boolean;
}

export default function QuotaIndicator({ subscription, isLoading }: QuotaIndicatorProps) {
    if (isLoading) return <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-full" />;

    const isPro = subscription?.subscription_tier === 'PRO';

    if (isPro) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-full text-amber-800 text-sm font-bold shadow-sm">
                <Sparkles className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>PRO Member — Trip unlimited, semua fitur aktif</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium hidden sm:block">
                Rencanakan trip hingga 3 hari · <span className="text-amber-600 font-semibold">Upgrade untuk trip lebih panjang</span>
            </span>
            <Button asChild size="sm" variant="outline" className="border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 gap-1">
                <Link href="/pricing">
                    <Zap className="w-3 h-3 fill-amber-500" /> Upgrade
                </Link>
            </Button>
        </div>
    );
}
