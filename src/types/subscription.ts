export type SubscriptionTier = 'FREE' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED';

export interface UserSubscription {
    user_id: string;
    email: string;
    subscription_tier: SubscriptionTier;
    subscription_status: SubscriptionStatus;
}

export interface TripQuota {
    user_id: string;
    month: string;
    trips_created: number;
    quota_limit: number;
    remaining: number;
    is_unlimited: boolean;
}

export interface CheckoutResponse {
    url: string;
}
