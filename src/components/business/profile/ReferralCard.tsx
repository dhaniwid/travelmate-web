import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Copy, Gift, Share2, Users, Check, Sparkles, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@clerk/nextjs';
import { referralService, ReferralStats } from '@/services/referralService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReferralCard() {
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemCodeInput, setRedeemCodeInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { getToken, isLoaded: isAuthLoaded } = useAuth();

    useEffect(() => {
        setHasMounted(true);
        if (isAuthLoaded) {
            loadStats();
        }
    }, [isAuthLoaded]);

    const loadStats = async () => {
        try {
            const token = await getToken();
            console.log('[ReferralCard] Token retrieved:', token ? 'YES (length: ' + token.length + ')' : 'NO');
            if (!token) {
                console.warn('[ReferralCard] No token available, skipping API call');
                return;
            }
            console.log('[ReferralCard] Calling getReferralStats with token...');
            const data = await referralService.getReferralStats(token);
            console.log('[ReferralCard] Stats received:', data);
            setStats(data);
            setInviteCode(data.referral_code);
        } catch (error) {
            console.error("[ReferralCard] Failed to load referral stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        toast.success("Referral code copied!", {
            description: "Share it with your friends to earn free trips.",
            icon: <Copy className="w-4 h-4 text-teal-500" />
        });
    };

    const handleShare = () => {
        const text = `Join me on Miru and get an AI-planned trip! Use my code ${inviteCode} to sign up.`;
        const url = window.location.origin;

        if (navigator.share) {
            navigator.share({
                title: 'Join Miru',
                text: text,
                url: url,
            }).catch(console.error);
        } else {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        }
    };

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!redeemCodeInput.trim()) return;

        setIsSubmitting(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");
            await referralService.claimReferralCode(token, redeemCodeInput.trim());
            toast.success("Referral code redeemed!", {
                description: "You've earned +1 Invite Bonus Quota!",
                icon: <Gift className="w-4 h-4 text-pink-500" />
            });
            setRedeemCodeInput('');
            setIsRedeeming(false);
            loadStats();
        } catch (error: any) {
            console.error("Redeem error:", error);
            const msg = error.response?.data?.message || error.response?.data?.error || "Failed to redeem code";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-indigo-100/50 h-64 animate-pulse">
                <div className="h-6 w-1/3 bg-slate-200 rounded mb-4"></div>
                <div className="h-20 bg-slate-100 rounded-2xl mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl shadow-indigo-200/50 text-white p-6 md:p-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 mb-6">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <Gift className="w-6 h-6 text-yellow-300 animate-bounce" />
                    Give Trips, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">Get Trips</span>
                </h2>
                <p className="text-indigo-100 font-medium text-sm mt-1 max-w-sm">
                    Invite friends to Miru. They get a starter bonus, and you get <span className="font-bold text-white">+1 trip quota</span> for every signup!
                </p>
            </div>

            {/* Code Display */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 flex items-center justify-between pl-5 pr-1 mb-6">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Your Referral Code</span>
                    <span className="text-2xl font-mono font-black tracking-wider text-white">{inviteCode || '...'}</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCopy}
                        className="text-white hover:bg-white/20 rounded-xl"
                    >
                        <Copy className="w-5 h-5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleShare}
                        className="text-white hover:bg-white/20 rounded-xl"
                    >
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex flex-col items-center justify-center text-center">
                    <Users className="w-5 h-5 text-indigo-300 mb-1" />
                    <span className="text-2xl font-black">{stats?.total_referrals || 0}</span>
                    <span className="text-[10px] font-bold uppercase text-indigo-200">Friends Invited</span>
                </div>
                <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-2xl p-3 border border-yellow-400/30 flex flex-col items-center justify-center text-center">
                    <Ticket className="w-5 h-5 text-yellow-300 mb-1" />
                    <span className="text-2xl font-black text-yellow-200">+{stats?.bonus_quota || 0}</span>
                    <span className="text-[10px] font-bold uppercase text-yellow-100/80">Bonus Trips</span>
                </div>
            </div>

            {/* Redeem Section Toggle */}
            <div className="relative z-10 border-t border-white/10 pt-4">
                <AnimatePresence mode='wait'>
                    {!isRedeeming ? (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key="redeem-cta"
                            onClick={() => setIsRedeeming(true)}
                            className="text-xs font-bold text-indigo-200 hover:text-white flex items-center gap-1 mx-auto transition-colors"
                        >
                            Have a code from a friend? <span className="underline decoration-indigo-400 decoration-2 underline-offset-2">Redeem it</span>
                        </motion.button>
                    ) : (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            key="redeem-form"
                            onSubmit={handleRedeem}
                            className="flex gap-2"
                        >
                            <Input
                                value={redeemCodeInput}
                                onChange={(e) => setRedeemCodeInput(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE"
                                className="bg-black/20 border-white/20 text-white placeholder:text-white/40 font-mono text-center uppercase tracking-widest focus:ring-white/50 focus:border-white/50 h-10 rounded-xl"
                                maxLength={9}
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting || !redeemCodeInput}
                                className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl h-10 px-4"
                            >
                                {isSubmitting ? <Sparkles className="w-4 h-4 animate-spin" /> : "Claim"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsRedeeming(false)}
                                className="text-white/50 hover:text-white h-10 w-10 p-0 rounded-xl"
                            >
                                <span className="sr-only">Cancel</span>
                                ×
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
