'use client';

import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import { ChevronLeft, ChevronRight, Compass, Crown, Lock, BookOpen, Bell, HelpCircle, UserCircle, Trophy, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import TravelDNAEditor from '@/components/profile/TravelDNAEditor';
import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { getUserImpactStats, UserImpactStats } from '@/actions/user-stats';
import ReferralCard from '@/components/business/profile/ReferralCard';
import { useReferral } from '@/hooks/useReferral';
import { usePassportStamps } from '@/hooks/usePassportStamps';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Tier gradient colors for badge circles
const TIER_GRADIENTS: Record<string, string> = {
    BRONZE: 'radial-gradient(circle at 40% 35%, #CD7F32, #8B4513)',
    SILVER: 'radial-gradient(circle at 40% 35%, #C0C0C0, #808080)',
    GOLD: 'radial-gradient(circle at 40% 35%, #FFD700, #B8860B)',
    PLATINUM: 'radial-gradient(circle at 40% 35%, #E5E4E2, #9E9E9E)',
    DIAMOND: 'radial-gradient(circle at 40% 35%, #B9F2FF, #7B68EE)',
};

const TIER_LABEL_COLORS: Record<string, string> = {
    BRONZE: '#CD7F32',
    SILVER: '#C0C0C0',
    GOLD: '#FFD700',
    PLATINUM: '#E5E4E2',
    DIAMOND: '#B9F2FF',
};

interface BadgeModalData {
    icon: string;
    badge_name: string;
    tier: string;
    unlocked: boolean;
    remaining: number;
    unlocked_at?: string | null;
}

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const { getToken } = useAuth();
    const { subscription, isLoading: isSubLoading } = useSubscription();
    const router = useRouter();

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [stats, setStats] = useState<UserImpactStats | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<BadgeModalData | null>(null);

    const { referralStats, achievementProgress, isLoading: isReferralLoading, isProgressLoading, isProgressError } = useReferral();
    const { stamps, loading: isStampsLoading } = usePassportStamps();

    const isPro = subscription?.subscription_tier === 'PRO';

    const handleBack = () => {
        const referrer = typeof document !== 'undefined' ? document.referrer : '';
        const fromSameOrigin = !!referrer && new URL(referrer).origin === window.location.origin;
        if (fromSameOrigin) router.back();
        else router.push('/dashboard');
    };

    const fetchPreferences = async () => {
        try {
            const token = await getToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/preferences`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            fetchPreferences();
            getUserImpactStats().then(data => { if (data) setStats(data); }).catch(console.error);
        }
    }, [isLoaded]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060F1E]">
                <div className="animate-pulse w-14 h-14 rounded-full bg-white/10" />
            </div>
        );
    }

    const initial = user?.firstName?.[0]?.toUpperCase()
        || user?.lastName?.[0]?.toUpperCase()
        || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase()
        || '?';

    const nearestLocked = achievementProgress?.items
        ?.filter(i => !i.unlocked)
        ?.sort((a, b) => a.remaining - b.remaining)?.[0] ?? null;

    return (
        <>
        <div className="min-h-screen bg-[#060F1E] pb-32 safe-area-bottom">
            <TravelDNAEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onUpdate={fetchPreferences}
            />

            {/* Badge detail modal */}
            {selectedBadge && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedBadge(null)}
                >
                    <div
                        className="w-full max-w-md bg-[#0A1628] rounded-t-2xl p-6 pb-10 animate-in slide-in-from-bottom duration-200"
                        style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-[15px] font-medium text-white">
                                {selectedBadge.unlocked ? 'Badge Terbuka' : 'Badge Terkunci'}
                            </p>
                            <button onClick={() => setSelectedBadge(null)} className="text-white/40 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4">
                            {selectedBadge.unlocked ? (
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg"
                                    style={{ background: TIER_GRADIENTS[selectedBadge.tier] || TIER_GRADIENTS.BRONZE }}
                                >
                                    {selectedBadge.icon}
                                </div>
                            ) : (
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl opacity-40"
                                    style={{ border: '0.5px dashed rgba(255,255,255,0.2)' }}
                                >
                                    <Lock className="w-8 h-8 text-white/40" />
                                </div>
                            )}
                            <div>
                                <p className="text-[17px] font-medium text-white">{selectedBadge.badge_name}</p>
                                <p className="text-[12px] mt-1" style={{ color: TIER_LABEL_COLORS[selectedBadge.tier] || '#C0C0C0' }}>
                                    {selectedBadge.tier.charAt(0) + selectedBadge.tier.slice(1).toLowerCase()}
                                </p>
                                {selectedBadge.unlocked && selectedBadge.unlocked_at && (
                                    <p className="text-[12px] text-white/40 mt-2">
                                        Diraih pada {new Date(selectedBadge.unlocked_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                )}
                                {!selectedBadge.unlocked && (
                                    <p className="text-[13px] text-white/60 mt-2">
                                        Butuh <span className="text-white font-medium">{selectedBadge.remaining} lagi</span> untuk membuka badge ini.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div className="bg-[#0A1628]" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="max-w-2xl mx-auto px-5 pt-5 pb-5">
                <div className="flex items-center gap-3 mb-5">
                    <button
                        onClick={handleBack}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors active:scale-95"
                        aria-label="Kembali"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-[15px] font-medium text-white">Profil</span>
                </div>

                <div className="flex items-center gap-4 mb-5">
                    <div
                        className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0"
                        style={{ border: '2px solid rgba(255,255,255,0.2)' }}
                    >
                        <span className="text-[22px] font-medium text-white leading-none">{initial}</span>
                    </div>
                    <div>
                        <p className="text-[17px] font-medium text-white leading-snug">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[12px] text-white/50 mt-0.5">
                            {user?.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>

                {/* Tier badge */}
                {isSubLoading ? (
                    <div className="h-14 bg-white/5 rounded-xl animate-pulse" style={{ border: '0.5px solid rgba(255,255,255,0.08)' }} />
                ) : isPro ? (
                    <div
                        className="flex items-center gap-3 bg-amber-500/15 rounded-xl p-3"
                        style={{ border: '0.5px solid rgba(245,158,11,0.3)' }}
                    >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                            <Crown className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-white/50 uppercase tracking-[0.8px] leading-none mb-0.5">TIER SAAT INI</p>
                            <p className="text-[14px] font-medium text-amber-400">PRO</p>
                        </div>
                    </div>
                ) : (
                    <div
                        className="flex items-center gap-3 bg-white/[0.07] rounded-xl p-3"
                        style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}
                    >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/30 flex items-center justify-center flex-shrink-0">
                            <Compass className="w-4 h-4 text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-white/50 uppercase tracking-[0.8px] leading-none mb-0.5">TIER SAAT INI</p>
                            <p className="text-[14px] font-medium text-white">EXPLORER</p>
                        </div>
                        <button
                            onClick={() => setShowUpgrade(true)}
                            className="text-[12px] font-medium text-white bg-[#0D9488] hover:bg-teal-600 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                        >
                            Upgrade ke PRO →
                        </button>
                    </div>
                )}
            </div>{/* max-w-2xl inner */}
            </div>{/* header bg */}

            {/* ── Content ── */}
            <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

                {/* Stats 3-col grid */}
                <div
                    className="grid grid-cols-3 rounded-[12px] overflow-hidden"
                    style={{ gap: '1px', background: 'rgba(255,255,255,0.08)' }}
                >
                    {[
                        { value: stats?.totalTrips ?? '—', label: 'Trip dibuat' },
                        { value: stats?.uniqueDestinations ?? '—', label: 'Kota dikunjungi' },
                        { value: referralStats?.total_referrals ?? '—', label: 'Referral' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-[#0A1628] p-3 text-center">
                            <p className="text-[18px] font-medium text-white leading-tight">{stat.value}</p>
                            <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Digital Passport */}
                <Link href="/sumi">
                    <div
                        className="flex items-center justify-between px-[14px] py-3 bg-[#0A1628] rounded-[12px] hover:bg-[#0D2040] transition-colors active:scale-[0.99] cursor-pointer"
                        style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}
                    >
                        <div className="flex items-center gap-[10px]">
                            <div className="w-9 h-9 rounded-[10px] bg-[#060F1E] flex items-center justify-center">
                                <BookOpen className="w-[18px] h-[18px] text-teal-400" />
                            </div>
                            <div>
                                <p className="text-[13px] font-medium text-white leading-tight">Digital Passport</p>
                                <p className="text-[12px] text-white/50 mt-0.5">
                                    {isStampsLoading
                                        ? '...'
                                        : stamps.length > 0
                                            ? `${stamps.length} stamp dikumpulkan`
                                            : 'Belum ada stamp'}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                    </div>
                </Link>

                {/* Referral section */}
                <div className="space-y-2">
                    <p className="text-[11px] text-white/40 uppercase tracking-[0.8px] px-1">REFERRAL</p>
                    <ReferralCard />
                </div>

                {/* Achievement badges */}
                <div className="space-y-2">
                    <p className="text-[11px] text-white/40 uppercase tracking-[0.8px] px-1">PENCAPAIAN</p>

                    {isProgressLoading ? (
                        <div className="grid grid-cols-4 gap-2 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex flex-col items-center gap-1.5">
                                    <div className="w-[52px] h-[52px] rounded-full bg-white/8" />
                                    <div className="h-2.5 w-12 bg-white/8 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : isProgressError || (!achievementProgress && !isProgressLoading) ? (
                        <div
                            className="flex flex-col items-center gap-2 py-6 rounded-[12px] bg-[#0A1628]"
                            style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}
                        >
                            <Trophy className="w-6 h-6 text-white/20" />
                            <p className="text-[13px] text-white/40 text-center">Pencapaian belum tersedia</p>
                            <p className="text-[11px] text-white/25 text-center max-w-[200px]">
                                Mulai ajak teman untuk unlock badge pertamamu
                            </p>
                        </div>
                    ) : achievementProgress && achievementProgress.items.length === 0 ? (
                        <div
                            className="flex flex-col items-center gap-2 py-6 rounded-[12px] bg-[#0A1628]"
                            style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}
                        >
                            <Trophy className="w-6 h-6 text-white/20" />
                            <p className="text-[13px] text-white/40 text-center leading-snug">
                                Belum ada pencapaian
                            </p>
                            <p className="text-[11px] text-white/25 text-center max-w-[200px]">
                                Ajak teman bergabung untuk mulai unlock badge
                            </p>
                        </div>
                    ) : achievementProgress ? (
                        <>
                            <div className="grid grid-cols-4 gap-2">
                                {achievementProgress.items.map(item => {
                                    const tierColor = TIER_LABEL_COLORS[item.tier] || '#C0C0C0';
                                    return (
                                        <button
                                            key={item.tier}
                                            className="flex flex-col items-center gap-1 text-center active:scale-95 transition-transform"
                                            onClick={() => setSelectedBadge({
                                                icon: item.icon,
                                                badge_name: item.badge_name,
                                                tier: item.tier,
                                                unlocked: item.unlocked,
                                                remaining: item.remaining,
                                                unlocked_at: item.unlocked_at,
                                            })}
                                        >
                                            <div className="relative">
                                                {item.unlocked ? (
                                                    <div
                                                        className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[20px]"
                                                        style={{ background: TIER_GRADIENTS[item.tier] || TIER_GRADIENTS.BRONZE }}
                                                    >
                                                        {item.icon}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div
                                                            className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[20px] opacity-50"
                                                            style={{
                                                                background: '#0A1628',
                                                                border: '0.5px dashed rgba(255,255,255,0.2)',
                                                            }}
                                                        >
                                                            <span className="grayscale">{item.icon}</span>
                                                        </div>
                                                        <div
                                                            className="absolute bottom-0 right-0 w-[18px] h-[18px] rounded-full bg-[#060F1E] flex items-center justify-center"
                                                            style={{ border: '0.5px solid rgba(255,255,255,0.15)' }}
                                                        >
                                                            <Lock className="w-2.5 h-2.5 text-white/40" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <p className={cn(
                                                'text-[10px] leading-snug font-medium',
                                                item.unlocked ? 'text-white' : 'text-white/40'
                                            )}>
                                                {item.badge_name}
                                            </p>
                                            {item.unlocked ? (
                                                <p className="text-[9px]" style={{ color: tierColor }}>
                                                    {item.tier.charAt(0) + item.tier.slice(1).toLowerCase()} ✓
                                                </p>
                                            ) : (
                                                <p className="text-[9px] text-white/30">+{item.remaining} lagi</p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Progress hint card */}
                            {nearestLocked && !achievementProgress.all_unlocked && (
                                <div
                                    className="flex items-center gap-[10px] px-3 py-[10px] bg-[#0A1628] rounded-[10px]"
                                    style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}
                                >
                                    <Trophy className="w-4 h-4 text-teal-400 flex-shrink-0" />
                                    <p className="text-[12px] text-white/60 leading-snug">
                                        Kamu hampir dapat{' '}
                                        <span className="text-white font-medium">{nearestLocked.badge_name}</span>!{' '}
                                        {nearestLocked.remaining} lagi untuk unlock badge ini.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-6 text-white/40 text-[13px]">Belum ada pencapaian</div>
                    )}
                </div>

                {/* Settings */}
                <div className="space-y-2">
                    <p className="text-[11px] text-white/40 uppercase tracking-[0.8px] px-1">PENGATURAN</p>
                    <div
                        className="flex flex-col rounded-[12px] overflow-hidden"
                        style={{ gap: '1px', background: 'rgba(255,255,255,0.08)' }}
                    >
                        {[
                            {
                                icon: <UserCircle className="w-4 h-4 text-white/40 flex-shrink-0" />,
                                label: 'Edit profil',
                                onClick: () => setIsEditorOpen(true),
                            },
                            {
                                icon: <Bell className="w-4 h-4 text-white/40 flex-shrink-0" />,
                                label: 'Notifikasi',
                                onClick: () => openUserProfile(),
                            },
                            {
                                icon: <HelpCircle className="w-4 h-4 text-white/40 flex-shrink-0" />,
                                label: 'Bantuan',
                                onClick: () => { window.location.href = 'mailto:support@miru.travel?subject=Miru Feedback'; },
                            },
                        ].map(item => (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                className="flex items-center gap-3 px-[14px] py-[13px] bg-[#0A1628] text-left hover:bg-[#0D2040] transition-colors"
                            >
                                {item.icon}
                                <span className="flex-1 text-[13px] text-white">{item.label}</span>
                                <ChevronRight className="w-[14px] h-[14px] text-white/30" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Keluar */}
                <button
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="w-full py-3 text-[13px] text-white/40 hover:text-white/60 transition-colors rounded-[12px]"
                    style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}
                >
                    Keluar
                </button>

                <p className="text-center text-[11px] text-white/20 py-2">Miru v1.0.0</p>
            </div>
        </div>
        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
        </>
    );
}
