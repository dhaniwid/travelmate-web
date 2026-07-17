import { useQuery } from '@tanstack/react-query';
import { SubscriptionService } from '@/services/subscription';
import { useAuth } from '@clerk/nextjs';

export function useSubscription() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const fetchSubscription = async () => {
        if (!isLoaded || !isSignedIn) return null;
        const token = await getToken();
        if (!token) return null;
        return SubscriptionService.getSubscription(token);
    };

    const fetchQuota = async () => {
        if (!isLoaded || !isSignedIn) return null;
        const token = await getToken();
        if (!token) return null;
        return SubscriptionService.getQuota(token);
    };

    const { data: subscription, isLoading: isSubLoading, error: subError } = useQuery({
        queryKey: ['subscription'],
        queryFn: fetchSubscription,
        enabled: isLoaded && isSignedIn,
    });

    const { data: quota, isLoading: isQuotaLoading } = useQuery({
        queryKey: ['quota'],
        queryFn: fetchQuota,
        enabled: isLoaded && isSignedIn,
    });

    return {
        subscription,
        quota,
        isLoading: isSubLoading || isQuotaLoading,
        isError: !!subError,
    };
}
