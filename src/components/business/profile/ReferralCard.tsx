'use client';

import React from 'react';
import { Link2, Share2, Copy } from 'lucide-react';
import { useReferral } from '@/hooks/useReferral';
import { toast } from 'sonner';

export default function ReferralCard() {
    const { referralStats, isStatsLoading, isStatsError, userRank, isRankLoading } = useReferral();

    const handleCopy = () => {
        const code = referralStats?.referral_code;
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            toast.success('Kode referral disalin!');
        }).catch(() => {
            toast.error('Gagal menyalin kode');
        });
    };

    const handleShare = () => {
        const code = referralStats?.referral_code || '';
        const url = typeof window !== 'undefined' ? window.location.origin : '';
        const text = `Daftar di Miru pakai kodeku ${code} — dapat bonus trip gratis!`;
        if (navigator.share) {
            navigator.share({ title: 'Miru', text, url }).catch(() => {});
        } else {
            navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                toast.success('Link disalin!');
            });
        }
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="px-4 pt-4 pb-4 space-y-3">
                {/* Title + subtitle */}
                <div>
                    <p className="text-[13px] font-bold text-zinc-950">Ajak teman, dapatkan bonus</p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">Setiap teman yang daftar = +1 trip bonus untukmu</p>
                </div>

                {/* Referral code row */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <Link2 className="w-[14px] h-[14px] text-teal-600 flex-shrink-0" />
                    <span className="flex-1 text-[13px] font-bold text-zinc-950 font-mono">
                        {isStatsLoading ? (
                            <span className="inline-block w-28 h-4 bg-zinc-200 rounded animate-pulse" />
                        ) : isStatsError || !referralStats?.referral_code ? (
                            <span className="text-zinc-400 text-[12px] font-sans font-normal">Belum tersedia</span>
                        ) : (
                            referralStats.referral_code
                        )}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[12px] font-semibold text-zinc-950 hover:text-teal-600 transition-colors whitespace-nowrap"
                    >
                        Salin ↗
                    </button>
                    <button
                        onClick={handleShare}
                        aria-label="Bagikan kode referral"
                        className="text-zinc-600 hover:text-zinc-950 transition-colors ml-1"
                    >
                        <Share2 className="w-[14px] h-[14px]" />
                    </button>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100">
                    <div className="text-center">
                        <p className="text-[16px] font-bold text-zinc-950 leading-tight">
                            {referralStats?.total_referrals ?? 0}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Teman bergabung</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[16px] font-bold text-teal-600 leading-tight">
                            {isRankLoading ? (
                                <span className="inline-block w-8 h-4 bg-zinc-200 rounded animate-pulse" />
                            ) : userRank?.rank ? `#${userRank.rank}` : (
                                <span className="text-zinc-400 text-[13px]">—</span>
                            )}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Rank leaderboard</p>
                    </div>
                    <button className="text-[12px] font-semibold text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg px-3 py-1.5 transition-colors">
                        Lihat ranking
                    </button>
                </div>
            </div>
        </div>
    );
}
