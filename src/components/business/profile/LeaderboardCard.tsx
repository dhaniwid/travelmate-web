import React from 'react';
import { LeaderboardEntry } from '@/types/referral';
import { cn } from '@/lib/utils';
import { Trophy, Medal, User } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeaderboardCardProps {
    entries: LeaderboardEntry[];
    userRank?: LeaderboardEntry | null;
    isLoading?: boolean;
}

export default function LeaderboardCard({
    entries,
    userRank,
    isLoading = false
}: LeaderboardCardProps) {

    if (isLoading) {
        return (
            <div className="w-full h-80 bg-white/30 animate-pulse rounded-3xl border border-white/20" />
        );
    }

    const topThree = entries.slice(0, 3);
    const rest = entries.slice(3);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
            case 2: return <Medal className="w-5 h-5 text-slate-400 fill-slate-400" />;
            case 3: return <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />;
            default: return <span className="font-bold text-gray-400 w-5 text-center">{rank}</span>;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-yellow-100/50 border-yellow-200 text-yellow-900';
            case 2: return 'bg-slate-100/50 border-slate-200 text-slate-800';
            case 3: return 'bg-amber-100/50 border-amber-200 text-amber-900';
            default: return 'bg-white/40 border-white/20 text-gray-700';
        }
    };

    return (
        <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-xl">
            <div className="p-6 bg-gradient-to-b from-white/10 to-transparent">
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                    Top Referrers
                </h3>
                <p className="text-blue-100 text-sm">Compete for exclusive rewards!</p>
            </div>

            <div className="px-4 pb-4">
                {/* Top 3 Podium */}
                <div className="flex justify-center items-end gap-2 mb-6 h-32">
                    {topThree[1] && <PodiumItem entry={topThree[1]} rank={2} color="slate" height="h-24" />}
                    {topThree[0] && <PodiumItem entry={topThree[0]} rank={1} color="yellow" height="h-32" />}
                    {topThree[2] && <PodiumItem entry={topThree[2]} rank={3} color="amber" height="h-20" />}
                </div>

                {/* List for the rest */}
                <ScrollArea className="h-48 rounded-md pr-2">
                    <div className="space-y-2">
                        {rest.map((entry) => (
                            <div
                                key={entry.rank}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border transition-all hover:bg-white/50",
                                    getRankColor(entry.rank)
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-bold w-6 text-center text-gray-500">#{entry.rank}</span>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8 border border-white/50">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                {entry.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{entry.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{entry.badge}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm font-bold bg-white/50 px-2 py-0.5 rounded-full">
                                    {entry.total_referrals} <span className="text-[10px] font-normal text-gray-500">invites</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* User's own rank if not in top list view (optional sticky footer) */}
                {userRank && userRank.rank > 3 && (
                    <div className="mt-4 pt-3 border-t border-white/20">
                        <div className={cn(
                            "flex items-center justify-between p-3 rounded-xl border bg-primary/10 border-primary/20",
                        )}>
                            <div className="flex items-center gap-3">
                                <span className="font-bold w-6 text-center text-primary">#{userRank.rank}</span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-primary">You</span>
                                    <span className="text-[10px] text-primary/70">{userRank.badge}</span>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-primary">
                                {userRank.total_referrals}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const PodiumItem = ({ entry, rank, color, height }: {
    entry: LeaderboardEntry,
    rank: number,
    color: 'yellow' | 'slate' | 'amber',
    height: string
}) => {
    const bgColors = {
        yellow: 'bg-gradient-to-t from-yellow-200 via-yellow-100 to-white border-yellow-300',
        slate: 'bg-gradient-to-t from-slate-200 via-slate-100 to-white border-slate-300',
        amber: 'bg-gradient-to-t from-amber-200 via-amber-100 to-white border-amber-300',
    };

    return (
        <div className="flex flex-col items-center group">
            <div className="mb-2 relative">
                <Avatar className={cn(
                    "w-10 h-10 border-2 shadow-lg",
                    rank === 1 ? "w-14 h-14 border-yellow-400 ring-2 ring-yellow-200 ring-offset-2" : `border-${color}-400`
                )}>
                    <AvatarFallback className="bg-white text-xs font-bold">
                        {entry.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white",
                    rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-slate-500" : "bg-amber-600"
                )}>
                    {rank}
                </div>
            </div>

            <div className={cn(
                "w-20 rounded-t-lg border-x border-t flex flex-col items-center justify-end pb-2 shadow-inner transition-all group-hover:-translate-y-1",
                height,
                bgColors[color]
            )}>
                <span className="text-xs font-bold truncate w-full text-center px-1">
                    {entry.name.split(' ')[0]}
                </span>
                <span className="text-[10px] opacity-70 font-semibold">
                    {entry.total_referrals}
                </span>
            </div>
        </div>
    );
}
