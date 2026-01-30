import { useState } from 'react';
import Link from 'next/link';
import { Trip } from '@/types';
import { Calendar, MapPin, ArrowRight, Trash2, Loader2, Sparkles, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatMoney } from '@/lib/utils';

interface HistoryCardProps {
    trip: Trip;
    onDelete: (id: string) => void;
}

export default function HistoryCard({ trip, onDelete }: HistoryCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    // Handler untuk tombol delete
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm(`Are you sure you want to delete the trip to ${trip.destination}?`)) {
            setIsDeleting(true);
            onDelete(trip.id);
        }
    };

    // Fallback display untuk budget jika budget_range kosong
    const displayBudget = trip.budget_range || (trip.budget > 0 ? `~${formatMoney(trip.budget)}` : "TBD");

    return (
        <div className="group relative bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 overflow-hidden h-full flex flex-col">

            {/* --- DECORATION BACKGROUND --- */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-teal-50 rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100 -z-10" />

            {/* --- TOMBOL DELETE --- */}
            <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={cn(
                    "absolute top-3 right-3 z-20 p-2 rounded-xl transition-all duration-300 shadow-sm border border-transparent",
                    "bg-white/80 backdrop-blur-sm text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100",
                    "opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                )}
                title="Delete Trip"
            >
                {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>

            {/* --- MAIN LINK --- */}
            <Link href={`/trips/${trip.id}`} className="flex flex-col h-full p-5">

                {/* 1. HEADER: Destination & Origin */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="bg-teal-50 text-teal-700 text-[10px] px-2 h-5 hover:bg-teal-100 border border-teal-100">
                            {trip.trip_days} Days
                        </Badge>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {new Date(trip.start_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    <h3 className="font-black text-xl text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1 mb-1">
                        {trip.destination}
                    </h3>

                    <div className="flex items-center text-xs text-slate-500 gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>From <span className="font-medium text-slate-600">{trip.origin}</span></span>
                    </div>
                </div>

                {/* 2. BODY: Vibe Description (Truncated) */}
                <div className="flex-1 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trip Vibe</span>
                        </div>
                        {/* Menggunakan line-clamp-2 agar text panjang dari slider tidak merusak layout */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 italic">
                            "{trip.style}"
                        </p>
                    </div>
                </div>

                {/* 3. FOOTER: Budget & Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium uppercase mb-0.5">
                            <Wallet className="w-3 h-3" /> Est. Budget
                        </div>
                        <div className="text-sm font-bold text-emerald-600">
                            {displayBudget}
                        </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </Link>
        </div>
    );
}