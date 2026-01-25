'use client';

import React, { useEffect, useState } from 'react';
import { TripResponse, BudgetBreakdown } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import {Calendar, Wallet, Hotel, Plane, Info, CheckCircle2, LucideProps,
    Utensils, Ticket, MoreHorizontal, Calculator} from 'lucide-react';
import { getDestinationImage } from '@/lib/images';
import { formatMoney } from '@/lib/utils';

import TransportCard from './TransportCard';
import ItineraryTimeline from './ItineraryTimeline';
import DownloadPdfButton from './DownloadPdfButton';

export default function TripResult({ data }: { data: TripResponse }) {
    // 1. Destructuring dengan safety guard
    const trip = data?.trip;
    const plan = data?.plan;
    const [bgImage, setBgImage] = useState<string>("");

    useEffect(() => {
        if (trip?.destination) {
            getDestinationImage(trip.destination).then(setBgImage);
        }
    }, [trip?.destination]);

    // 2. Helper Perhitungan Budget yang Aman (Anti-Crash)
    const calculateTotal = (breakdown: BudgetBreakdown | undefined) => {
        if (!breakdown) return 0;
        return (breakdown.transport || 0) +
            (breakdown.accommodation || 0) +
            (breakdown.food || 0) +
            (breakdown.tickets || 0) +
            (breakdown.misc || 0);
    };

    const totalBudget = calculateTotal(plan?.budget_breakdown);

    const budgetConfig: Record<string, { icon: React.ReactNode, color: string, lightBg: string }> = {
        transport: { icon: <Plane className="w-4 h-4" />, color: "bg-blue-600", lightBg: "bg-blue-50 text-blue-700" },
        accommodation: { icon: <Hotel className="w-4 h-4" />, color: "bg-indigo-600", lightBg: "bg-indigo-50 text-indigo-700" },
        food: { icon: <Utensils className="w-4 h-4" />, color: "bg-orange-600", lightBg: "bg-orange-50 text-orange-700" },
        tickets: { icon: <Ticket className="w-4 h-4" />, color: "bg-rose-600", lightBg: "bg-rose-50 text-rose-700" },
        misc: { icon: <MoreHorizontal className="w-4 h-4" />, color: "bg-slate-600", lightBg: "bg-slate-50 text-slate-700" },
    };

    // Jika data trip belum ada sama sekali (awal stream)
    if (!trip) return null;

    return (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700" id="trip-result-container">

            {/* --- HEADER BANNER --- */}
            <div className="relative h-72 md:h-96 p-8 text-white flex flex-col justify-end">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 bg-slate-900"
                    style={{backgroundImage: bgImage ? `url(${bgImage})` : 'none'}}
                />

                <div className="absolute top-6 right-6 z-20">
                    <DownloadPdfButton
                        targetId="trip-result-container"
                        tripTitle={trip.destination || "Trip-Plan"}
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"/>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400"/>
                        <span className="text-xs font-bold uppercase tracking-widest text-green-400">Trip Ready</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight">{trip.destination}</h2>
                    <div className="flex flex-wrap gap-3">
                        <Badge className="bg-white/20 backdrop-blur-md border-0 text-white gap-1 px-3 py-1">
                            <Calendar className="w-3.5 h-3.5"/> {trip.trip_days} Days
                        </Badge>
                        <Badge className="bg-white/20 backdrop-blur-md border-0 text-white gap-1 px-3 py-1">
                            <Wallet className="w-3.5 h-3.5"/> {trip.budget_range}
                        </Badge>
                        <Badge className="bg-white/20 backdrop-blur-md border-0 text-white capitalize px-3 py-1">
                            {trip.style}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            <div className="p-6 md:p-10">
                <Tabs defaultValue="itinerary" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-10 p-1 bg-slate-100 rounded-xl">
                    <TabsTrigger value="itinerary" className="rounded-lg font-bold">Itinerary</TabsTrigger>
                        <TabsTrigger value="transport" className="rounded-lg font-bold">Logistics</TabsTrigger>
                        <TabsTrigger value="budget" className="rounded-lg font-bold">Budget</TabsTrigger>
                    </TabsList>

                    {/* TAB 1: ITINERARY */}
                    <TabsContent value="itinerary" className="focus-visible:outline-none">
                        <ItineraryTimeline days={plan?.itinerary ?? []} />
                    </TabsContent>

                    {/* TAB 2: LOGISTICS (TRANSPORT & STAY) */}
                    <TabsContent value="transport" className="space-y-10 focus-visible:outline-none">
                        {/* Transport Section */}
                        <section>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                                <div className="p-2 bg-orange-100 rounded-lg"><Plane className="w-5 h-5 text-orange-600" /></div>
                                Transport Options
                            </h3>
                            <div className="space-y-4">
                                {(plan?.transport_options ?? []).map((opt, i) => (
                                    <TransportCard key={i} option={opt} />
                                ))}
                                {(!plan?.transport_options || plan.transport_options.length === 0) && (
                                    <p className="text-slate-400 italic text-sm border-2 border-dashed rounded-xl p-8 text-center">Finding best routes...</p>
                                )}
                            </div>
                        </section>

                        {/* Accommodation Section */}
                        <section>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                                <div className="p-2 bg-indigo-100 rounded-lg"><Hotel className="w-5 h-5 text-indigo-600" /></div>
                                Recommended Stays
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {(plan?.accommodation_options ?? []).map((acc, i) => (
                                    <Card key={i} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="flex flex-col sm:flex-row h-full">
                                            <div className="w-full sm:w-40 h-40 sm:h-auto bg-slate-100 relative">
                                                <img
                                                    src={acc.image_url || "/api/placeholder/400/400"}
                                                    alt={acc.name}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            </div>
                                            <CardContent className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-slate-900 leading-tight">{acc.name}</h4>
                                                        <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5">★ {acc.rating}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{acc.type} • {acc.location_area}</p>
                                                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">"{acc.description}"</p>
                                                </div>
                                                <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-end">
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase">Rate/Night</div>
                                                    <div className="font-black text-slate-900">{formatMoney(acc.price_per_night)}</div>
                                                </div>
                                            </CardContent>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </TabsContent>

                    {/* TAB 3: BUDGET BREAKDOWN */}
                    <TabsContent value="budget" className="focus-visible:outline-none outline-none">
                        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

                            {/* Ringkasan Total dengan Card yang Menonjol */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-blue-200">
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div>
                                        <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">Estimated Total Investment</p>
                                        <h3 className="text-4xl md:text-5xl font-black italic">{formatMoney(totalBudget)}</h3>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                        <Calculator className="w-10 h-10 text-blue-200" />
                                    </div>
                                </div>
                                {/* Dekorasi Background */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                            </div>

                            {plan?.budget_breakdown ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(plan.budget_breakdown).map(([key, val]) => {
                                        const config = budgetConfig[key as keyof typeof budgetConfig] || budgetConfig.misc;
                                        const percentage = totalBudget > 0 ? (val / totalBudget) * 100 : 0;

                                        return (
                                            <div key={key} className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-3 rounded-xl ${config.lightBg} transition-colors`}>
                                                        {config.icon}
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 block mb-1">
                                                            {key}
                                                        </span>
                                                        <span className="text-lg font-bold text-slate-800">{formatMoney(val)}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-slate-400">{percentage.toFixed(1)}% of total</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`${config.color} h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                                    <p className="text-slate-500 font-medium animate-pulse">Calculating optimal allocation...</p>
                                </div>
                            )}

                            {/* Info Tip */}
                            <p className="text-center text-[10px] text-slate-400 italic">
                                *This estimation is based on real-time market data and AI analysis for {trip?.destination}.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* --- DECISION NOTES / AI INSIGHTS --- */}
                {plan?.decision_notes && plan.decision_notes.length > 0 && (
                    <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4 items-start">
                        <Info className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider mb-2">TravelMate AI Insights</h4>
                            <ul className="space-y-2">
                                {plan.decision_notes.map((note, i) => (
                                    <li key={i} className="text-sm text-blue-800 flex gap-2">
                                        <span className="text-blue-300">•</span> {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Komponen Loader internal.
 * Menggunakan LucideProps untuk memastikan kompatibilitas tipe data SVG
 * dan menghilangkan error "not assignable to ReactNode".
 */
function Loader2({ className, ...props }: LucideProps) {
    return (
        <Info
            className={`animate-spin ${className || ''}`}
            {...props}
        />
    );
}