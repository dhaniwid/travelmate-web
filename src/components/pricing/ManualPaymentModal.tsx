'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    QrCode,
    Copy,
    Sparkles,
    Mail,
    Send
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";

interface ManualPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ManualPaymentModal({ isOpen, onClose }: ManualPaymentModalProps) {
    const { user } = useUser();
    const [qrSrc, setQrSrc] = useState('/images/payment-qr.png');
    const [qrError, setQrError] = useState(false);
    const [activeTab, setActiveTab] = useState('qris');

    const bankDetails = {
        name: process.env.NEXT_PUBLIC_BANK_NAME || "Bank Mandiri",
        accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "1234-5678-9012",
        accountHolder: process.env.NEXT_PUBLIC_BANK_HOLDER_NAME || "NAMA PEMILIK REKENING",
        amount: "Rp 29.000"
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    const userEmail = user?.primaryEmailAddress?.emailAddress || "[User Email]";

    const handleEmailConfirm = () => {
        const subject = encodeURIComponent(`Bukti Bayar Founder - ${userEmail}`);
        const body = encodeURIComponent(`Halo Admin,\n\nSaya sudah mentransfer ${bankDetails.amount} untuk aktivasi paket Founder PRO.\n\nEmail Akun: ${userEmail}\nMetode: ${activeTab === 'qris' ? 'QRIS' : 'Bank Transfer'}\n\n(Mohon lampirkan screenshot bukti transfer pada email ini)`);
        window.location.href = `mailto:support@miru.travel?subject=${subject}&body=${body}`;
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl overflow-hidden p-0 bg-white flex flex-col max-h-[90vh]">
                {/* Compact Header */}
                <div className="bg-gradient-to-br from-teal-600 to-blue-700 p-6 text-white relative shrink-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-black flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-300" />
                                Support Miru
                            </DialogTitle>
                            <DialogDescription className="text-teal-50/80 text-xs font-medium">
                                Founder Early Bird Offer
                            </DialogDescription>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-100 block opacity-70">Pay once</span>
                            <span className="text-2xl font-black text-white">{bankDetails.amount}</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[300px]">
                    <Tabs defaultValue="qris" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1 h-12">
                            <TabsTrigger
                                value="qris"
                                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs gap-2"
                            >
                                <QrCode className="w-4 h-4" />
                                Scan QRIS
                            </TabsTrigger>
                            <TabsTrigger
                                value="bank"
                                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs gap-2"
                            >
                                <CreditCard className="w-4 h-4" />
                                Bank Transfer
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="qris" className="mt-6 animate-in fade-in zoom-in duration-300">
                            <div className="bg-slate-50 rounded-3xl p-6 border border-dashed border-slate-200 flex flex-col items-center gap-4">
                                <div className="w-52 h-52 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-lg relative overflow-hidden">
                                    {!qrError ? (
                                        <img
                                            src={qrSrc}
                                            alt="Scan QRIS Miru Travel App"
                                            className="w-full max-w-[250px] mx-auto rounded-lg shadow-sm border border-gray-200 object-contain p-2"
                                            onError={() => {
                                                if (qrSrc.endsWith('.png')) {
                                                    setQrSrc('/images/payment-qr.jpg');
                                                } else {
                                                    setQrError(true);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <QrCode className="w-16 h-16" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">QR Code Error</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-xs font-black text-slate-700">QRIS MERCHANT: MIRU VOYAGER</p>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-teal-600 font-bold uppercase tracking-tight">
                                            Scan using GoPay / OVO / Dana / BCA
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-medium italic">
                                            Tip: Tap and hold to save image
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="bank" className="mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-3">
                                <DetailRow
                                    label="Bank Name"
                                    value={bankDetails.name}
                                />
                                <DetailRow
                                    label="Account Number"
                                    value={bankDetails.accountNumber}
                                    onCopy={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                                />
                                <DetailRow
                                    label="Account Holder"
                                    value={bankDetails.accountHolder}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/50">
                        <div className="flex gap-3">
                            <div className="bg-amber-100 rounded-full h-6 w-6 flex items-center justify-center shrink-0">
                                <span className="text-amber-600 text-xs font-black">!</span>
                            </div>
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                Mohon screenshot bukti transfer Anda sebagai bukti pembayaran untuk aktivasi manual.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer Buttons */}
                <div className="p-6 pt-2 border-t border-slate-50 bg-white/80 backdrop-blur-md shrink-0 space-y-3">
                    <Button
                        onClick={handleEmailConfirm}
                        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-md shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        <Mail className="w-5 h-5 text-teal-400" />
                        Konfirmasi via Email
                    </Button>


                    <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                        Aktivasi Manual (10-30 Menit)
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailRow({ label, value, onCopy }: { label: string, value: string, onCopy?: () => void }) {
    return (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:border-teal-200">
            <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-sm font-black text-slate-700 leading-none">{value}</p>
            </div>
            {onCopy && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCopy}
                    className="h-8 w-8 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors shrink-0"
                >
                    <Copy className="w-3.5 h-3.5" />
                </Button>
            )}
        </div>
    );
}
