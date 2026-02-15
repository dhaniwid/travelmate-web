import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

import SlotCounter from "./SlotCounter";

interface PricingCardProps {
    title: string;
    price: string;
    originalPrice?: string;
    description: string;
    features: string[];
    buttonText: string;
    onButtonClick?: () => void;
    isLoading?: boolean;
    isCurrent?: boolean;
    isPopular?: boolean;
    billingSubtext?: string;
    badgeLabel?: string;
    socialProof?: string;
    isIDR?: boolean;
    proCount?: number;
}

export function PricingCard({
    title,
    price,
    originalPrice,
    description,
    features,
    buttonText,
    onButtonClick,
    isLoading = false,
    isCurrent = false,
    isPopular = false,
    billingSubtext,
    badgeLabel,
    socialProof,
    isIDR = false,
    proCount = 5
}: PricingCardProps) {
    return (
        <Card className={cn(
            "w-full max-w-sm flex flex-col relative transition-all duration-500 hover:shadow-2xl border-2",
            isPopular
                ? "border-teal-500/30 shadow-xl shadow-teal-900/10 scale-105 z-10 bg-white"
                : "border-slate-100 shadow-sm",
            isCurrent ? "bg-slate-50/50" : ""
        )}>
            {isPopular && (
                <div className="absolute -top-5 left-0 right-0 max-w-fit mx-auto bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg border-2 border-white uppercase z-20">
                    {badgeLabel || "Best for Explorers"}
                </div>
            )}
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className={cn(
                    "text-3xl font-black tracking-tight",
                    isPopular ? "text-slate-900" : "text-slate-800"
                )}>
                    {title}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
                <div className="flex flex-col mb-8">
                    <div className="flex items-baseline gap-2">
                        {originalPrice && (
                            <span className="text-lg font-bold text-slate-400 line-through decoration-2 decoration-rose-400 opacity-60">
                                {originalPrice}
                            </span>
                        )}
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{price}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {isIDR ? "per bulan" : "/ month"}
                        </span>
                    </div>
                    {billingSubtext && (
                        <span className="text-sm text-slate-500 font-normal mt-1">
                            {billingSubtext}
                        </span>
                    )}

                    {!isIDR && isPopular && (
                        <p className="text-[10px] font-medium text-amber-600 mt-2 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1 w-fit">
                            <span>💡 processed in IDR (approx. Rp 79k)</span>
                        </p>
                    )}

                    {isPopular && (
                        <div className="mt-4">
                            <SlotCounter count={proCount} />
                        </div>
                    )}
                </div>
                <ul className="space-y-6">
                    {features.map((feature, index) => {
                        // Check for badge pattern "Feature Name [Badge Text]"
                        const match = feature.match(/^(.*?)\[(.*?)\]$/);
                        const featureText = match ? match[1].trim() : feature;
                        const badgeText = match ? match[2].trim() : null;

                        return (
                            <li key={index} className="flex items-start gap-3 group">
                                <div className={cn(
                                    "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors",
                                    isPopular ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-400"
                                )}>
                                    {isPopular ? <Sparkles className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={cn(
                                        "text-sm font-medium transition-colors",
                                        isPopular ? "text-slate-700" : "text-slate-500"
                                    )}>
                                        {featureText}
                                    </span>
                                    {badgeText && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-600 uppercase tracking-wider">
                                            {badgeText}
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6">
                <Button
                    className={cn(
                        "w-full h-12 rounded-2xl font-bold transition-all duration-300 active:scale-95",
                        isPopular
                            ? "bg-gradient-to-tr from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white shadow-lg shadow-teal-600/20 border-0"
                            : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    )}
                    onClick={() => {
                        if (isPopular && !onButtonClick) {
                            const checkoutUrl = process.env.NEXT_PUBLIC_MAYAR_CHECKOUT_URL;
                            if (checkoutUrl) {
                                window.location.href = checkoutUrl;
                                return;
                            }
                        }
                        onButtonClick?.();
                    }}
                    disabled={isLoading || isCurrent}
                >
                    {isCurrent ? (isIDR ? "Paket Aktif" : "Active Plan") :
                        isLoading ? (isIDR ? "Menyiapkan Perjalanan..." : "Preparing Journey...") :
                            (isIDR && isPopular ? "Langganan Sekarang" : buttonText)}
                </Button>

                {isPopular && (
                    <div className="flex flex-col items-center gap-1.5 px-2">
                        <p className="text-[10px] font-bold text-slate-600 leading-tight text-center">
                            {isIDR ? "🛡️ Jaminan Uang Kembali 7 Hari" : "🛡️ 7-Day Money-Back Guarantee"}
                        </p>
                        <p className="text-[9px] text-slate-400 leading-tight text-center">
                            {isIDR ? "Tidak puas? Kami kembalikan dana Anda, tanpa pertanyaan." : "Not happy? We'll refund you, no questions asked."}
                        </p>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
