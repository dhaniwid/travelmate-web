import React from 'react';
import { Achievement } from '@/types/referral';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
    achievement?: Achievement; // Optional if we want to render a placeholder/locked slot
    locked?: boolean;
    tier?: string; // For placeholder styling
    size?: 'sm' | 'md' | 'lg';
}

const TIER_COLORS = {
    BRONZE: 'bg-amber-100 text-amber-700 border-amber-200',
    SILVER: 'bg-slate-100 text-slate-700 border-slate-200',
    GOLD: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PLATINUM: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    DIAMOND: 'bg-purple-100 text-purple-700 border-purple-200',
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    achievement,
    locked = false,
    tier = 'BRONZE',
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-lg',
        md: 'w-12 h-12 text-2xl',
        lg: 'w-16 h-16 text-3xl',
    };

    const baseClasses = cn(
        "rounded-full flex items-center justify-center border-2 transition-all duration-300 relative",
        sizeClasses[size],
        locked
            ? "bg-gray-100 border-gray-200 grayscale opacity-70"
            : TIER_COLORS[achievement?.tier as keyof typeof TIER_COLORS] || "bg-gray-50",
        !locked && "shadow-sm hover:scale-105 hover:shadow-md cursor-help"
    );

    const content = (
        <div className={baseClasses}>
            {locked ? (
                <Lock className="w-1/2 h-1/2 text-gray-400" />
            ) : (
                <span>{achievement?.icon || '🏆'}</span>
            )}
        </div>
    );

    if (locked || !achievement) {
        return (
            <div className={baseClasses} title={locked ? "Locked Achievement" : ""}>
                <Lock className="w-1/2 h-1/2 text-gray-400" />
            </div>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="text-center">
                        <p className="font-bold text-sm mb-1">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                            Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
