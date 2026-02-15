'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { PricingCard } from '@/components/pricing/PricingCard';
import { Loader2, Sparkles, Zap, ShieldCheck, Globe } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import ManualPaymentModal from '@/components/pricing/ManualPaymentModal';

export default function PricingPage() {
    const { subscription, isLoading, upgradeToPro, isCheckoutLoading } = useSubscription();
    const { currency, symbol, isIDR, isLoading: isCurrencyLoading } = useCurrency();
    const [isYearly, setIsYearly] = useState(false);
    const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);

    if (isLoading || isCurrencyLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                    <p className="text-slate-500 font-medium font-inter">Checking availability...</p>
                </div>
            </div>
        );
    }

    const isPro = subscription?.subscription_tier === 'PRO';

    // Pricing strings
    const proPrice = isIDR
        ? (isYearly ? "Rp 23.200" : "Rp 29.000")
        : (isYearly ? "$1.99" : "$2.49");

    const originalProPrice = isIDR ? "Rp 99.000" : "$6.99";

    const billingText = isIDR
        ? (isYearly ? "Ditagih Rp 758.400 per tahun" : "Ditagih bulanan")
        : (isYearly ? "Billed $47.88 yearly" : "Billed monthly");

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-white to-white py-24 px-4 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-teal-100/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-blue-50/40 rounded-full blur-[80px]" />
            </div>

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Badge variant="outline" className="rounded-full px-4 py-1 text-teal-600 border-teal-200 bg-teal-50 font-bold tracking-wider uppercase text-[10px]">
                        Pricing Plans
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                        {isIDR ? "Mulai Petualangan" : "Start your next"} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                            {isIDR ? "Luar Biasa Anda." : "Great Adventure."}
                        </span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        {isIDR
                            ? "Upgrade ke PRO dan jelajahi dunia seperti penduduk lokal. Permata tersembunyi, rahasia lokal, dan kebebasan tanpa batas menanti."
                            : "Upgrade to PRO and discover the world like a local. Hidden gems, local secrets, and unlimited freedom await."}
                    </p>

                    {/* TOGGLE */}
                    <div className="pt-8 flex items-center justify-center gap-4">
                        <span className={cn("text-sm font-bold transition-colors", !isYearly ? "text-slate-900" : "text-slate-400")}>
                            {isIDR ? "Bulanan" : "Monthly"}
                        </span>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={isYearly}
                                onCheckedChange={setIsYearly}
                                className="data-[state=checked]:bg-teal-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-bold transition-colors", isYearly ? "text-slate-900" : "text-slate-400")}>
                                {isIDR ? "Tahunan" : "Yearly"}
                            </span>
                            <Badge className="bg-amber-100 text-amber-600 hover:bg-amber-100 border-none font-bold text-[10px] rounded-full">
                                {isIDR ? "Hemat 20%" : "Save 20%"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <PricingCard
                        title={isIDR ? "Penjelajah Santai" : "The Casual Traveler"}
                        price={isIDR ? "Rp 0" : "$0"}
                        billingSubtext={isIDR ? "Ditagih bulanan" : "Billed monthly"}
                        description={isIDR ? "Jelajahi dasar-dasar perencanaan cerdas." : "Explore the essentials of smart planning."}
                        features={isIDR ? [
                            "3 Perencanaan Trip per bulan",
                            "Logistik Harian Cerdas",
                            "Integrasi Peta Standar",
                            "Dukungan Komunitas Dasar"
                        ] : [
                            "3 Trip Generations per month",
                            "Smart Day-by-Day Logistics",
                            "Standard Map Integration",
                            "Basic Community Support"
                        ]}
                        buttonText={!isPro ? (isIDR ? "Paket Saat Ini" : "Current Base") : (isIDR ? "Pindah ke Dasar" : "Switch to Base")}
                        isCurrent={!isPro}
                        isIDR={isIDR}
                        onButtonClick={() => { }}
                    />
                    <PricingCard
                        title={isIDR ? "Founder Member" : "Founder Member"}
                        price={proPrice}
                        originalPrice={originalProPrice}
                        billingSubtext={billingText}
                        badgeLabel={isIDR ? "Penawaran Founder Early Bird" : "Early Bird Founder Offer"}
                        socialProof={isIDR ? "Jadilah Founding Member" : "Become a Founding Member"}
                        description={isIDR ? "Akses seumur hidup untuk 100 visioner pertama." : "Lifetime access for the first 100 visionaries."}
                        features={isIDR ? [
                            "AI Planning & Edits Tanpa Batas",
                            "Permata Tersembunyi & Rahasia Lokal [PRO]",
                            "Personalisasi Lanjutan (Diet, Kecepatan, Vibe)",
                            "Batal Kapan Saja. Tanpa biaya tersembunyi."
                        ] : [
                            "Unlimited AI Planning & Edits",
                            "Hidden Gems & Local Secrets [PRO]",
                            "Advanced Personalization (Dietary, Pace, Vibe)",
                            "Cancel Anytime. No hidden fees."
                        ]}
                        buttonText={isPro ? (isIDR ? "Menjelajah Sekarang" : "Voyaging Now") : (isIDR ? "Mulai Perjalanan" : "Start My Journey")}
                        isPopular
                        isCurrent={isPro}
                        isIDR={isIDR}
                        isLoading={isCheckoutLoading}
                        proCount={13}
                        onButtonClick={() => {
                            if (isIDR) {
                                setIsManualPaymentOpen(true);
                            } else {
                                upgradeToPro();
                            }
                        }}
                    />
                </div>

                {/* Trust Badges */}
                <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2 font-bold text-slate-400">
                        <ShieldCheck className="w-5 h-5" />
                        <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-slate-400">
                        <Zap className="w-5 h-5" />
                        <span>Instant Access</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-slate-400">
                        <Globe className="w-5 h-5" />
                        <span>Global Coverage</span>
                    </div>
                </div>
            </div>

            <ManualPaymentModal
                isOpen={isManualPaymentOpen}
                onClose={() => setIsManualPaymentOpen(false)}
            />
        </div>
    );
}
