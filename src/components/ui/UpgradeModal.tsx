'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';
import ManualPaymentModal from '@/components/pricing/ManualPaymentModal';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function UpgradeModal({
    isOpen,
    onClose,
    title = "Unlock Miru PRO 💎",
    message = "Rencanakan perjalanan tanpa batas dengan fitur premium Miru. Satu kali bayar, seumur hidup jalan-jalan."
}: UpgradeModalProps) {
    const [showPayment, setShowPayment] = useState(false);

    const handleUpgrade = () => {
        onClose();
        setShowPayment(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="relative">
                        {/* Header */}
                        <div className="h-32 bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center relative">
                            <Sparkles className="w-16 h-16 text-white/20 absolute rotate-12 -right-4 -top-4" />
                            <Sparkles className="w-12 h-12 text-white/10 absolute -rotate-12 -left-2 -bottom-2" />
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 shadow-xl">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="p-8 pt-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900 text-center mb-2">
                                    {title}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 text-center text-base font-medium">
                                    {message}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-8 space-y-4">
                                {[
                                    'Trip tanpa batas — buat sebanyak yang kamu mau',
                                    'Export PDF premium & siap cetak',
                                    'Miru AI Chat — asisten perjalanan personal',
                                    'Kolaborasi trip bareng teman & keluarga',
                                ].map((benefit) => (
                                    <div key={benefit} className="flex items-start gap-3">
                                        <div className="mt-1 bg-teal-100 rounded-full p-1 flex-shrink-0">
                                            <Check className="w-3 h-3 text-teal-600" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700">{benefit}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Price callout */}
                            <div className="mt-6 bg-teal-50 rounded-2xl px-4 py-3 text-center border border-teal-100">
                                <p className="text-xs text-teal-600 font-bold uppercase tracking-wide">Founder Early Bird</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">Rp 29.000 <span className="text-lg font-bold text-slate-400">/bulan</span></p>
                                <p className="text-[11px] text-slate-400 mt-1">Via QRIS atau Transfer Bank</p>
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <Button
                                    onClick={handleUpgrade}
                                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold py-6 rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 border-none"
                                >
                                    Upgrade Sekarang →
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="w-full text-slate-400 hover:text-slate-600 font-bold"
                                >
                                    Nanti saja
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* QRIS / Bank Transfer payment modal */}
            <ManualPaymentModal
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
            />
        </>
    );
}
