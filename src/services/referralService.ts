import { api } from '@/lib/api';
import { ReferralStats, LeaderboardEntry, Achievement, AchievementProgressResponse } from '@/types/referral';

export const referralService = {
    // Get user's referral stats (code, count, bonus)
    getReferralStats: async (token: string): Promise<ReferralStats> => {
        const response = await api.get('/user/referral', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Claim a referral code
    claimReferralCode: async (token: string, code: string): Promise<void> => {
        await api.post('/referrals/claim', { code }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Get leaderboard
    getLeaderboard: async (token: string, limit: number = 50): Promise<{ leaderboard: LeaderboardEntry[], count: number }> => {
        const response = await api.get(`/referrals/leaderboard?limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Get user achievements
    getUserAchievements: async (token: string): Promise<Achievement[]> => {
        const response = await api.get('/user/achievements', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Get per-badge achievement progress with remaining hints
    getAchievementProgress: async (token: string): Promise<AchievementProgressResponse> => {
        const response = await api.get('/users/me/achievement-progress', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Get user rank
    getUserRank: async (token: string): Promise<LeaderboardEntry> => {
        const response = await api.get('/referrals/rank', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
