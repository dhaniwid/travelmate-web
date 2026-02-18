import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';
import { User, Medal, Crown } from 'lucide-react';

interface MilestoneProgressProps {
    currentReferrals: number;
    nextTier: {
        name: string;
        required: number;
        reward: string;
    } | null;
}

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
    currentReferrals,
    nextTier
}) => {
    if (!nextTier) {
        return (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700 font-bold mb-1">
                    <Crown className="w-5 h-5" />
                    <span>Maximum Tier Reached!</span>
                </div>
                <p className="text-sm text-purple-600">
                    You are a legendary ambassador. Keep spreading the love!
                </p>
            </div>
        );
    }

    const progress = Math.min(100, (currentReferrals / nextTier.required) * 100);
    const remaining = nextTier.required - currentReferrals;

    return (
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Medal className="w-4 h-4 text-amber-500" />
                        Next Milestone: {nextTier.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Reward: {nextTier.reward}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-lg font-bold text-primary">{remaining}</span>
                    <span className="text-xs text-muted-foreground ml-1">more to go</span>
                </div>
            </div>

            <Progress value={progress} className="h-2.5 bg-gray-100" />

            <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium">
                <span>{currentReferrals} Referrals</span>
                <span>Goal: {nextTier.required}</span>
            </div>
        </div>
    );
};
