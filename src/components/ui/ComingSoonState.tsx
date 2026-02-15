'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function ComingSoonState() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-md relative aspect-square mb-8 animate-in fade-in zoom-in-95 duration-700">
                <Image
                    src="/images/MIRU-coming-soon-page.png"
                    alt="Feature Under Construction"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                />
            </div>

            <div className="space-y-4 max-w-md animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
                <h2 className="text-3xl font-black text-teal-900 tracking-tight">
                    Building Something Amazing!
                </h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    We are crafting this feature with love. It will be ready for your next adventure soon!
                </p>

                <div className="pt-4">
                    <Button asChild size="lg" className="rounded-full px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-900/20 transition-all hover:scale-105 active:scale-95">
                        <Link href="/dashboard">
                            Return to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
