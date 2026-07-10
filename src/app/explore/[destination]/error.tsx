'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DestinationError({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 text-center">
            <div className="text-5xl mb-6">🌏</div>
            <h2 className="text-white text-xl font-bold mb-3">Gagal memuat halaman destinasi</h2>
            <p className="text-white/50 text-sm mb-8 max-w-xs">
                Terjadi kesalahan saat memuat informasi destinasi ini.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button onClick={reset} className="bg-teal-500 hover:bg-teal-400 text-white rounded-xl h-12 font-bold">
                    Coba Lagi
                </Button>
                <Link href="/explore">
                    <Button variant="outline" className="w-full border-white/20 text-white/70 hover:text-white rounded-xl h-12">
                        Kembali ke Explore
                    </Button>
                </Link>
            </div>
        </div>
    );
}
