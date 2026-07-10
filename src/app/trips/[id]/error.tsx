'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TripError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[TripPage] Unhandled error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-sm w-full text-center space-y-5">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Couldn&apos;t load trip</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Something went wrong while loading this adventure. Try again or go back to your dashboard.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={reset}
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline" className="w-full h-12 rounded-2xl font-bold border-slate-200">
                        <Link href="/dashboard" className="flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
