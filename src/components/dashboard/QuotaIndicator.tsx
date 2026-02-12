import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TripQuota, UserSubscription } from "@/types/subscription";
import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";

interface QuotaIndicatorProps {
    quota: TripQuota | undefined;
    subscription: UserSubscription | undefined;
    isLoading: boolean;
}

export default function QuotaIndicator({ quota, subscription, isLoading }: QuotaIndicatorProps) {
    if (isLoading) return <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-full" />;

    const isPro = subscription?.subscription_tier === 'PRO';

    if (isPro) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-full text-amber-800 text-sm font-bold shadow-sm">
                <Sparkles className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>PRO Member</span>
            </div>
        );
    }

    // Free User Logic
    const used = quota?.trips_created || 0;
    const limit = quota?.quota_limit || 3;
    const percentage = Math.min((used / limit) * 100, 100);
    const remaining = Math.max(limit - used, 0);

    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
                <div className="text-xs font-semibold text-slate-600">
                    {remaining} trips left
                </div>
                <div className="w-24">
                    <Progress value={percentage} className="h-2 bg-slate-200" indicatorClassName={percentage >= 100 ? "bg-red-500" : "bg-teal-600"} />
                </div>
            </div>

            <Button asChild size="sm" variant="outline" className="border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 gap-1 hidden sm:flex">
                <Link href="/pricing">
                    <Zap className="w-3 h-3 fill-amber-500" /> Upgrade
                </Link>
            </Button>
        </div>
    );
}
