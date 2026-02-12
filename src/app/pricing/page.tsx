'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { PricingCard } from '@/components/pricing/PricingCard';
import { Loader2 } from 'lucide-react';

export default function PricingPage() {
    const { subscription, isLoading, upgradeToPro, isCheckoutLoading } = useSubscription();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const isPro = subscription?.subscription_tier === 'PRO';

    return (
        <div className="container mx-auto py-24 px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Unlock the full potential of your travels with our Pro plan. Unlimited trips, advanced AI features, and more.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
                <PricingCard
                    title="Free"
                    price="$0"
                    description="Perfect for casual travelers."
                    features={[
                        "3 Trip Generations per month",
                        "Standard Itinerary Planning",
                        "Access to Public Guides",
                        "Community Support"
                    ]}
                    buttonText={!isPro ? "Current Plan" : "Downgrade"}
                    isCurrent={!isPro}
                    onButtonClick={() => { }}
                />
                <PricingCard
                    title="Pro"
                    price="$9.99"
                    description="For the serious explorer."
                    features={[
                        "Unlimited Trip Generations",
                        "Advanced AI Personalization",
                        "Exclusive Local Insights",
                        "Priority Support",
                        "Early Access to New Features"
                    ]}
                    buttonText={isPro ? "Current Plan" : "Upgrade to Pro"}
                    isPopular
                    isCurrent={isPro}
                    isLoading={isCheckoutLoading}
                    onButtonClick={() => upgradeToPro()}
                />
            </div>
        </div>
    );
}
