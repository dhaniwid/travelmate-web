import Link from 'next/link';
import {Trip} from '@/types';
import {Calendar, MapPin, ArrowRight} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {formatMoney} from '@/lib/utils'; // Pastikan ada atau ganti dengan formatter biasa

export default function HistoryCard({trip}: { trip: Trip }) {
    return (
        <Link href={`/trips/${trip.id}`}>
            <div
                className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden">

                {/* Decorative Gradient Background on Hover */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

                <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 line-clamp-1">
                                {trip.destination}
                            </h3>
                            <Badge variant="secondary"
                                   className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                                {trip.style}
                            </Badge>
                        </div>

                        <div className="flex items-center text-xs text-slate-500 gap-1 mb-1">
                            <MapPin className="w-3 h-3"/>
                            <span>From {trip.origin}</span>
                        </div>

                        <div className="flex items-center text-xs text-slate-500 gap-1">
                            <Calendar className="w-3 h-3"/>
                            <span>{trip.start_date} • {trip.trip_days} Days</span>
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between pt-4 border-t border-slate-100 group-hover:border-blue-100 transition-colors">
                        <div className="text-xs font-medium text-slate-500">
                            Est. Budget: <span className="font-bold text-slate-700">{trip.budget_range}</span>
                        </div>

                        <div
                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4"/>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}