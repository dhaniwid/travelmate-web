import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralService } from '@/services/referralService';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export function useReferral() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const queryClient = useQueryClient();

    // 1. Fetch Referral Stats
    const {
        data: referralStats,
        isLoading: isStatsLoading,
        error: statsError
    } = useQuery({
        queryKey: ['referralStats'],
        queryFn: async () => {
            if (!isLoaded || !isSignedIn) return null;
            const token = await getToken();
            if (!token) return null;
            return referralService.getReferralStats(token);
        },
        enabled: isLoaded && isSignedIn,
    });

    // 2. Fetch Leaderboard
    const {
        data: leaderboardData,
        isLoading: isLeaderboardLoading,
        error: leaderboardError
    } = useQuery({
        queryKey: ['referralLeaderboard'],
        queryFn: async () => {
            if (!isLoaded || !isSignedIn) return null;
            const token = await getToken();
            if (!token) return null;
            return referralService.getLeaderboard(token);
        },
        enabled: isLoaded && isSignedIn,
    });

    // 3. Fetch User Achievements
    const {
        data: achievements,
        isLoading: isAchievementsLoading,
        error: achievementsError
    } = useQuery({
        queryKey: ['userAchievements'],
        queryFn: async () => {
            if (!isLoaded || !isSignedIn) return null;
            const token = await getToken();
            if (!token) return null;
            return referralService.getUserAchievements(token);
        },
        enabled: isLoaded && isSignedIn,
    });

    // 4. Mutation: Claim Referral Code
    const claimReferral = useMutation({
        mutationFn: async (code: string) => {
            const token = await getToken();
            if (!token) throw new Error("No authentifcation token");
            return referralService.claimReferralCode(token, code);
        },
        onSuccess: () => {
            toast.success("Referral code claimed successfully!");
            queryClient.invalidateQueries({ queryKey: ['referralStats'] });
            // Optionally refresh user data if it affects quota immediately
        },
        onError: (error: any) => {
            console.error("Claim error:", error);
            const msg = error.response?.data?.error || "Failed to claim code";
            toast.error(msg);
        }
    });

    // 5. Fetch User Rank
    const {
        data: userRank,
        isLoading: isRankLoading,
    } = useQuery({
        queryKey: ['userRank'],
        queryFn: async () => {
            if (!isLoaded || !isSignedIn) return null;
            const token = await getToken();
            if (!token) return null;
            return referralService.getUserRank(token);
        },
        enabled: isLoaded && isSignedIn,
    });

    const {
        data: achievementProgress,
        isLoading: isProgressLoading,
    } = useQuery({
        queryKey: ['achievementProgress'],
        queryFn: async () => {
            if (!isLoaded || !isSignedIn) return null;
            const token = await getToken();
            if (!token) return null;
            return referralService.getAchievementProgress(token);
        },
        enabled: isLoaded && isSignedIn,
    });

    return {
        // Data
        referralStats,
        leaderboard: leaderboardData?.leaderboard || [],
        leaderboardCount: leaderboardData?.count || 0,
        achievements: achievements || [],
        userRank,
        achievementProgress: achievementProgress ?? null,

        // Loading States
        isLoading: isStatsLoading || isLeaderboardLoading || isAchievementsLoading || isRankLoading || isProgressLoading,
        isStatsLoading,
        isLeaderboardLoading,
        isAchievementsLoading,
        isRankLoading,
        isProgressLoading,
        isClaiming: claimReferral.isPending,

        // Errors — distinguish "still loading" vs "failed to load" vs "no data"
        isStatsError: !!statsError,
        isProgressError: !!achievementsError,
        error: statsError || leaderboardError || achievementsError,

        // Actions
        claimReferral: claimReferral.mutate,
        claimReferralAsync: claimReferral.mutateAsync,
    };
}
