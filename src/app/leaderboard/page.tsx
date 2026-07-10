'use client';

import { useReferral } from '@/hooks/useReferral';
import LeaderboardCard from '@/components/business/profile/LeaderboardCard';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
    const { leaderboard, userRank, isLeaderboardLoading, isRankLoading } = useReferral();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-300" />
                        Referral Leaderboard
                    </h1>
                    <p className="text-blue-200 mt-2">Top Miru ambassadors competing for exclusive rewards</p>
                </div>

                <LeaderboardCard
                    entries={leaderboard}
                    userRank={userRank ?? null}
                    isLoading={isLeaderboardLoading || isRankLoading}
                />
            </div>
        </div>
    );
}
