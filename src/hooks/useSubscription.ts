import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionService } from '@/services/subscription';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export function useSubscription() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const queryClient = useQueryClient();

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

    const upgradeToPro = async () => {
        const checkoutUrl = process.env.NEXT_PUBLIC_MAYAR_CHECKOUT_URL;
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        } else {
            toast.error("Checkout link not configured yet.");
        }
    };

    /**
     * @deprecated Stripe integration is being replaced by Mayar.id
     */
    const createCheckoutSession = useMutation({
        mutationFn: async (priceId?: string) => {
            // const token = await getToken();
            // if (!token) throw new Error("No token");
            // return SubscriptionService.createCheckoutSession(token, priceId);
            return { url: process.env.NEXT_PUBLIC_MAYAR_CHECKOUT_URL };
        },
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error) => {
            console.error("Checkout error:", error);
            toast.error("Failed to start checkout session");
        }
    });

    return {
        subscription,
        quota,
        isLoading: isSubLoading || isQuotaLoading,
        isError: !!subError,
        upgradeToPro,
        isCheckoutLoading: createCheckoutSession.isPending
    };
}
