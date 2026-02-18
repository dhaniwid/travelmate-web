'use client';

import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Award, MapPin, Edit3, Sparkles, ChevronRight, Globe, CalendarCheck, Zap, MessageCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TravelDNAEditor from '@/components/profile/TravelDNAEditor';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumBadge from '@/components/ui/PremiumBadge';
import Link from 'next/link';
import { getUserImpactStats, UserImpactStats } from '@/actions/user-stats';
import { cn } from '@/lib/utils';
import ReferralCard from '@/components/business/profile/ReferralCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaderboardCard from '@/components/business/profile/LeaderboardCard';
import { AchievementBadge } from '@/components/common/AchievementBadge';
import { useReferral } from '@/hooks/useReferral';

interface UserPreferences {
    pace: string;
    budget_tier: string;
    dietary: string[];
    interests: string[];
    travel_style: string[];
}

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const { getToken } = useAuth();
    const { subscription, isLoading: isSubLoading } = useSubscription();

    // State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [prefs, setPrefs] = useState<UserPreferences | null>(null);
    const [isLoadingDNA, setIsLoadingDNA] = useState(true);
    const [stats, setStats] = useState<UserImpactStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const {
        leaderboard,
        achievements,
        userRank,
        isLoading: isReferralLoading,
        leaderboardCount
        // referralStats is used in ReferralCard internally now
    } = useReferral();


    const isPro = subscription?.subscription_tier === 'PRO';

    const fetchPreferences = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/preferences`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setPrefs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingDNA(false);
        }
    };

    useEffect(() => {
        setHasMounted(true);
        if (isLoaded) {
            fetchPreferences();
            fetchStats();
        }
    }, [isLoaded]);

    const fetchStats = async () => {
        setIsLoadingStats(true);
        try {
            const data = await getUserImpactStats();
            if (data) setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse w-32 h-32 rounded-full bg-slate-200"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32 safe-area-bottom">
            <TravelDNAEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onUpdate={fetchPreferences}
            />

            {/* Hero Header */}
            <div className="bg-gradient-to-br from-teal-600 to-blue-600 pt-16 pb-24 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />

                <div className="text-center relative z-10 px-6">
                    <div className="relative inline-block">
                        <img
                            src={user?.imageUrl}
                            alt={user?.firstName || 'User'}
                            className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-xl object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-teal-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col items-center gap-2">
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            {user?.firstName} {user?.lastName}
                        </h1>
                        {!isSubLoading && (
                            <Link
                                href={isPro ? "/billing" : "/pricing"}
                                className="transition-transform active:scale-95"
                            >
                                {isPro ? (
                                    <PremiumBadge
                                        text="PRO Member"
                                        className="bg-amber-400 text-amber-950 border-amber-300 shadow-lg shadow-amber-900/20"
                                    />
                                ) : (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">
                                        Free Plan <ChevronRight className="w-3 h-3 text-white" /> <span className="text-white underline">Upgrade?</span>
                                    </div>
                                )}
                            </Link>
                        )}
                    </div>
                    <p className="text-teal-100 font-medium text-sm flex items-center justify-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> Traveler Since {hasMounted ? new Date(user?.createdAt || Date.now()).getFullYear() : '...'}
                    </p>
                </div>
            </div>

            {/* Content Container - Overlapping header */}
            <div className="max-w-md mx-auto px-4 -mt-12 relative z-20 space-y-6">

                {/* --- REFERRAL CARD (Viral Growth) --- */}
                <ReferralCard />

                {/* --- COMMUNITY & REWARDS (New Phase 3) --- */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 px-2">
                        🏆 Community & Rewards
                    </h2>

                    <Tabs defaultValue="achievements" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/50 backdrop-blur-md p-1 rounded-2xl h-12">
                            <TabsTrigger value="achievements" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                My Badges
                            </TabsTrigger>
                            <TabsTrigger value="leaderboard" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Leaderboard
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="achievements" className="mt-0">
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-slate-200/50 min-h-[300px]">
                                {isReferralLoading ? (
                                    <div className="grid grid-cols-4 gap-4 animate-pulse">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-square bg-slate-100 rounded-full" />)}
                                    </div>
                                ) : achievements && achievements.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-4 justify-items-center">
                                        {achievements.map(achievement => (
                                            <AchievementBadge key={achievement.id} achievement={achievement} size="md" />
                                        ))}
                                        {/* Placeholders for unearned badges if we want to show what's possible */}
                                        {/* For now, just showing earned ones as per requirement */}
                                        <div className="col-span-4 mt-6 text-center">
                                            <p className="text-xs text-muted-foreground">
                                                Keep inviting friends to unlock more badges!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 grayscale opacity-50">
                                            <Award className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-600">No Badges Yet</h3>
                                        <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                                            Refere friends to earn your first badge and climb the ranks!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="leaderboard" className="mt-0">
                            <LeaderboardCard
                                entries={leaderboard}
                                userRank={userRank}
                                isLoading={isReferralLoading}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* --- TRAVEL IMPACT CARD (New) --- */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-white/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            ✨ Your Impact
                        </h2>
                        {stats?.userLevel && (
                            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                                {stats.userLevel}
                            </div>
                        )}
                    </div>

                    {isLoadingStats ? (
                        <div className="grid grid-cols-2 gap-3 animate-pulse">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
                        </div>
                    ) : stats && stats.totalTrips > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            <StatBox
                                label="Trips"
                                value={stats.totalTrips || 0}
                                icon={<CalendarCheck className="w-4 h-4 text-blue-500" />}
                                color="blue"
                            />
                            <StatBox
                                label="Saved"
                                value={`${stats.hoursSaved || 0}h`}
                                icon={<Zap className="w-4 h-4 text-amber-500" />}
                                color="amber"
                                tooltip="Planning hours saved by AI"
                            />
                            <StatBox
                                label="Cities"
                                value={stats.uniqueDestinations || 0}
                                icon={<Globe className="w-4 h-4 text-teal-500" />}
                                color="teal"
                            />
                            <StatBox
                                label="CO2 Saved"
                                value={`${Math.round(stats.co2Saved || 0)}kg`}
                                icon={<Globe className="w-4 h-4 text-emerald-500" />}
                                color="emerald"
                                tooltip="Carbon footprint saved via efficient route planning"
                            />
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700 mb-1">Start Your Journey</h3>
                            <p className="text-xs text-slate-500 mb-4">Create your first trip to see your impact!</p>
                            <Link href="/create">
                                <Button size="sm" className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Plan a Trip
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Travel DNA Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            🧬 Travel DNA
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditorOpen(true)}
                            className="text-teal-600 h-8 px-2 text-xs hover:bg-teal-50 hover:text-teal-700 gap-1"
                        >
                            <Edit3 className="w-3 h-3" /> Edit
                        </Button>
                    </div>

                    {isLoadingDNA ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-14 bg-slate-100 rounded-xl" />
                            <div className="h-14 bg-slate-100 rounded-xl" />
                            <div className="h-14 bg-slate-100 rounded-xl" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* DNA Completeness */}
                            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100/50">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-black text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" /> DNA Completeness
                                    </span>
                                    <span className="text-sm font-black text-teal-600">{calculateCompleteness(prefs)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-teal-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${calculateCompleteness(prefs)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-teal-400 to-blue-500"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                                    {calculateCompleteness(prefs) === 100
                                        ? "Your profile is fully optimized for AI generation!"
                                        : "Complete your DNA for more accurate AI trip planning."}
                                </p>
                            </div>

                            <PreferenceRow
                                label="Pace"
                                value={prefs?.pace || 'Not Set'}
                                description={getPaceDescription(prefs?.pace)}
                                icon="☯️"
                                onClick={() => setIsEditorOpen(true)}
                            />
                            <PreferenceRow
                                label="Diet"
                                value={prefs?.dietary && prefs.dietary.length > 0 ? `${prefs.dietary.length} Selected` : 'No Restrictions'}
                                description={prefs?.dietary?.join(", ") || "Open to anything"}
                                icon="🍽️"
                                onClick={() => setIsEditorOpen(true)}
                            />
                            <PreferenceRow
                                label="Budget"
                                value={prefs?.budget_tier || 'Not Set'}
                                description={getBudgetDescription(prefs?.budget_tier)}
                                icon="💰"
                                onClick={() => setIsEditorOpen(true)}
                            />
                        </div>
                    )}
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-2xl shadow-lg p-2 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-14 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl px-4"
                        onClick={() => openUserProfile()}
                    >
                        <Settings className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-500 transition-colors" />
                        Manage Account
                    </Button>
                    <div className="h-px bg-slate-100 mx-4" />
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-14 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl px-4"
                        onClick={() => window.location.href = 'mailto:support@miru.travel?subject=Miru Feedback&body=Hi Miru Team,'}
                    >
                        <MessageCircle className="w-5 h-5 mr-3 text-slate-400" />
                        Help & Feedback
                    </Button>
                    <div className="h-px bg-slate-100 mx-4" />
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-14 text-rose-600 font-medium hover:bg-rose-50 hover:text-rose-700 rounded-xl px-4"
                        onClick={() => signOut({ redirectUrl: '/' })}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </Button>
                </div>

                <p className="text-center text-xs text-slate-400 py-4 font-medium">
                    Miru v1.0.0
                </p>
            </div>
        </div>
    );
}

function PreferenceRow({ label, value, description, icon, onClick }: { label: string, value: string, description: string, icon: string, onClick?: () => void }) {
    return (
        <div onClick={onClick} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
                <span className="text-xl bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm">{icon}</span>
                <div className="flex flex-col items-start text-left">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-slate-800">{value}</p>
                    {description && <p className="text-[10px] text-slate-400 max-w-[150px] truncate">{description}</p>}
                </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-teal-400 group-hover:scale-125 transition-transform" />
        </div>
    );
}

// Helpers
function calculateCompleteness(prefs: UserPreferences | null): number {
    if (!prefs) return 0;
    let score = 0;
    if (prefs.pace && prefs.pace !== 'Not Set') score += 20;
    if (prefs.budget_tier && prefs.budget_tier !== 'Not Set') score += 20;
    if (prefs.dietary && prefs.dietary.length > 0) score += 20;
    if (prefs.interests && prefs.interests.length > 0) score += 20;
    if (prefs.travel_style && prefs.travel_style.length > 0) score += 20;
    return score;
}

function getPaceDescription(pace?: string) {
    switch (pace) {
        case 'RELAXED': return 'Take it slow';
        case 'FAST': return 'See everything';
        case 'BALANCED': return 'Mix of both';
        default: return 'Set your preference';
    }
}

function getBudgetDescription(tier?: string) {
    switch (tier) {
        case 'BUDGET': return 'Cost conscious';
        case 'LUXURY': return 'Spare no expense';
        case 'MID': return 'Comfort focus';
        default: return 'Set your preference';
    }
}

function StatBox({ label, value, icon, color, tooltip }: { label: string, value: string | number, icon: React.ReactNode, color: string, tooltip?: string }) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        teal: "bg-teal-50 text-teal-600 border-teal-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95",
            colorClasses[color] || "bg-slate-50 border-slate-100"
        )} title={tooltip}>
            <div className="bg-white p-2 rounded-xl shadow-sm mb-2 border border-black/5">
                {icon}
            </div>
            <span className="text-xl font-black tracking-tight">{value}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</span>
        </div>
    );
}
