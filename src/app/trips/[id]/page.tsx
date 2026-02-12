import { getTripAction } from '@/actions/trip';
import TripResult from '@/components/business/TripResult';
import Navbar from '@/components/layout/Navbar';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface TripPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const dynamic = 'force-dynamic';

export default async function TripPage({ params }: TripPageProps) {
    const { id } = await params;
    const data = await getTripAction(id);

    if (!data) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-slate-50 relative">
            {/* <Navbar /> REMOVED for immersive view */}

            {/* Floating Nav for Back - Styled to match your previous premium look */}
            <nav className="fixed top-6 left-6 z-40 hidden md:block animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                <Link
                    href="/dashboard"
                    className="group flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg text-slate-600 text-sm font-bold border border-white/50 hover:bg-white hover:scale-105 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
            </nav>

            <TripResult data={data} isSavedView={true} />
        </main>
    );
}