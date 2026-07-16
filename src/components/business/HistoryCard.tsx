import { useState } from 'react';
import Link from 'next/link';
import { Trip } from '@/types';
import {
    Calendar, MapPin, ArrowRight, Trash2, Loader2,
    Sparkles, Wallet, Clock, CheckCircle2, Plane
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatMoney } from '@/lib/utils';

interface HistoryCardProps {
    trip: Trip;
    onDelete: (id: string) => void;
}

export default function HistoryCard({ trip, onDelete }: HistoryCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    // --- 1. LOGIC: TIME STATUS ---
    const startDate = new Date(trip.start_date);
    const today = new Date();
    // Set jam ke 00:00 agar perbandingan hari akurat
    today.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);

    const isPast = startDate < today;
    const isToday = startDate.getTime() === today.getTime();

    // Hitung selisih hari
    const diffTime = Math.abs(startDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // --- 2. LOGIC: VIBE TAGS ---
    // Mengubah kalimat panjang jadi tags pendek.
    // Contoh: "Relaxed, Nature" -> ["Relaxed", "Nature"]
    const vibeTags = trip.style
        ? trip.style.split(',').map((s: string) => s.trim()).slice(0, 2) // Ambil max 2
        : ['General Trip'];

    // --- 3. LOGIC: BUDGET ---
    const displayBudget = trip.budget_range
        || (trip.budget > 0 ? formatMoney(trip.budget) : "Flexible");

    // Handler Delete
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Delete trip to ${trip.destination}?`)) {
            setIsDeleting(true);
            onDelete(trip.id);
        }
    };

    return (
        <div className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">

            {/* --- DECORATIVE HEADER (Visual Hook) --- */}
            {/* Kita bedakan warna header berdasarkan status Past/Upcoming */}
            <div className={cn(
                "h-24 relative overflow-hidden",
                isPast ? "bg-slate-100" : "bg-gradient-to-r from-teal-500 to-blue-600"
            )}>
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

                {/* Status Badge Absolute */}
                <div className="absolute top-4 left-4 z-10">
                    {isPast ? (
                        <Badge variant="secondary" className="bg-slate-200/80 backdrop-blur-sm text-slate-600 text-[10px] border-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                        </Badge>
                    ) : isToday ? (
                        <Badge className="bg-white/90 text-teal-700 text-[10px] animate-pulse border-0">
                            <Plane className="w-3 h-3 mr-1" /> Happening Now
                        </Badge>
                    ) : (
                        <Badge className="bg-white/20 backdrop-blur-md text-white border-0 text-[10px]">
                            <Clock className="w-3 h-3 mr-1" /> In {diffDays} days
                        </Badge>
                    )}
                </div>

                {/* City Name Big (Overlay) */}
                <div className="absolute bottom-2 left-4 z-10">
                    <h3 className={cn(
                        "font-black text-2xl tracking-tight leading-none",
                        isPast ? "text-slate-400" : "text-white"
                    )}>
                        {trip.destination}
                    </h3>
                </div>

                {/* Decoration Icon */}
                <Plane className={cn(
                    "absolute -right-6 -bottom-8 w-32 h-32 opacity-10 rotate-12 transition-transform group-hover:scale-110",
                    isPast ? "text-slate-400" : "text-white"
                )} />
            </div>

            {/* --- DELETE BUTTON --- */}
            <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="absolute top-3 right-3 z-20 p-2 bg-white/20 hover:bg-red-500 hover:text-white text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                title="Delete"
            >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>

            {/* --- CARD BODY --- */}
            <Link href={`/trips/${trip.id}`} className="flex flex-col flex-1 p-5 pt-4">

                {/* 1. Meta Data Row */}
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                            {trip.trip_days} Days
                        </span>
                    </div>
                </div>

                {/* 2. Vibe Tags (Replacing long text) */}
                <div className="flex-1 space-y-2 mb-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" /> Trip Vibe
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {vibeTags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 3. Footer: Budget & Origin */}
                <div className="flex items-end justify-between mt-auto pt-2">
                    <div className="flex flex-col gap-0.5">
                        <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                            <Wallet className="w-3 h-3" /> Est. Cost
                        </div>
                        <div className="text-sm font-bold text-slate-700">
                            {displayBudget}
                        </div>
                    </div>

                    <div className="text-xs text-slate-400 text-right">
                        <span className="block text-[9px] uppercase tracking-wider">Departing From</span>
                        <span className="font-medium text-slate-600">{trip.origin}</span>
                    </div>
                </div>

            </Link>
        </div>
    );
}