export interface ReferralStats {
    referral_code: string;
    total_referrals: number;
    bonus_quota: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
    unlocked_at: string;
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    total_referrals: number;
    badge: string; // Tier icon/name
}

export interface AchievementProgressItem {
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
    badge_name: string;
    icon: string;
    referrals_needed: number;
    current_count: number;
    remaining: number;
    unlocked: boolean;
    unlocked_at?: string;
}

export interface AchievementProgressResponse {
    current_referrals: number;
    items: AchievementProgressItem[];
    all_unlocked: boolean;
}

export interface GamificationState {
    achievements: Achievement[];
    leaderboard: LeaderboardEntry[];
    userRank: LeaderboardEntry | null;
}
