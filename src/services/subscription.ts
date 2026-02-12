import { UserSubscription, TripQuota, CheckoutResponse } from '@/types/subscription';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const SubscriptionService = {
    getSubscription: async (token: string): Promise<UserSubscription> => {
        const res = await fetch(`${API_BASE}/user/subscription`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch subscription');
        return res.json();
    },

    getQuota: async (token: string): Promise<TripQuota> => {
        const res = await fetch(`${API_BASE}/user/quota`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch quota');
        return res.json();
    },

    createCheckoutSession: async (token: string, priceId?: string): Promise<CheckoutResponse> => {
        const res = await fetch(`${API_BASE}/user/subscription/checkout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ price_id: priceId })
        });
        if (!res.ok) throw new Error('Failed to create checkout session');
        return res.json();
    }
};
