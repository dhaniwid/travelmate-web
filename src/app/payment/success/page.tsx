'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, ArrowRight, Loader2, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function PaymentSuccessPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-inter">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-teal-100/30 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-blue-50/40 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-md w-full bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white relative z-10 text-center animate-in fade-in zoom-in duration-700">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-teal-50 flex items-center justify-center border-4 border-white shadow-inner">
                            <PartyPopper className="w-12 h-12 text-teal-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-amber-400 p-2 rounded-full shadow-lg animate-bounce">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -left-1 bg-blue-500 p-2 rounded-full shadow-lg animate-pulse delay-700">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                <Badge variant="outline" className="mb-4 rounded-full px-4 py-1 text-teal-600 border-teal-200 bg-teal-50 font-bold tracking-wider uppercase text-[10px]">
                    Payment Successful
                </Badge>

                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                    Welcome to <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Voyager Pro! 🚀</span>
                </h1>

                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    Your payment was successful. We're currently upgrading your account to unlock hidden gems and unlimited planning.
                </p>

                <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4 mb-8 text-left">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-900 mb-1">Activating Your Perks</p>
                            <p className="text-[10px] text-amber-700 leading-normal">
                                It may take up to 5 minutes for your Pro status to activate automatically. If it doesn't appear immediately, please try refreshing your dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                <Button asChild className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 group">
                    <Link href="/dashboard">
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>

                <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    MIRU TRAVEL APP FOUNDING MEMBER
                </p>
            </div>
        </div>
    );
}
