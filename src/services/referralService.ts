import { api } from '@/lib/api';

export interface ReferralStats {
    referral_code: string;
    total_referrals: number;
    bonus_quota: number;
}

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
};
