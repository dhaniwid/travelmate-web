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
        <div
            className="bg-[#0A1628] rounded-[12px] overflow-hidden"
            style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}
        >
            <div className="px-4 pt-4 pb-4 space-y-3">
                {/* Title + subtitle */}
                <div>
                    <p className="text-[13px] font-medium text-white">Ajak teman, dapatkan bonus</p>
                    <p className="text-[12px] text-white/50 mt-0.5">Setiap teman yang daftar = +1 trip bonus untukmu</p>
                </div>

                {/* Referral code row */}
                <div
                    className="flex items-center gap-2 px-3 py-[9px] bg-[#060F1E] rounded-[10px]"
                    style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}
                >
                    <Link2 className="w-[14px] h-[14px] text-teal-400 flex-shrink-0" />
                    <span className="flex-1 text-[13px] font-medium text-white font-mono">
                        {isStatsLoading ? (
                            <span className="inline-block w-28 h-4 bg-white/10 rounded animate-pulse" />
                        ) : isStatsError || !referralStats?.referral_code ? (
                            <span className="text-white/30 text-[12px]">Belum tersedia</span>
                        ) : (
                            referralStats.referral_code
                        )}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[12px] font-medium text-teal-400 hover:text-teal-300 transition-colors whitespace-nowrap"
                    >
                        Salin ↗
                    </button>
                    <button
                        onClick={handleShare}
                        aria-label="Bagikan kode referral"
                        className="text-teal-400 hover:text-teal-300 transition-colors ml-1"
                    >
                        <Share2 className="w-[14px] h-[14px]" />
                    </button>
                </div>

                {/* Stats row */}
                <div
                    className="flex items-center justify-between pt-[10px]"
                    style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)' }}
                >
                    <div className="text-center">
                        <p className="text-[16px] font-medium text-white leading-tight">
                            {referralStats?.total_referrals ?? 0}
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">Teman bergabung</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[16px] font-medium text-teal-400 leading-tight">
                            {isRankLoading ? (
                                <span className="inline-block w-8 h-4 bg-white/10 rounded animate-pulse" />
                            ) : userRank?.rank ? `#${userRank.rank}` : (
                                <span className="text-white/30 text-[13px]">—</span>
                            )}
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">Rank leaderboard</p>
                    </div>
                    <button
                        className="text-[12px] text-white bg-[#060F1E] rounded-lg px-3 py-[6px] transition-colors hover:bg-white/5"
                        style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}
                    >
                        Lihat ranking
                    </button>
                </div>
            </div>
        </div>
    );
}
