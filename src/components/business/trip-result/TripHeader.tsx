import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {Calendar, Save, Share2, Printer, Loader2, CheckCircle2, ArrowLeft, Trash2} from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { TripResponse } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface TripHeaderProps {
    data: TripResponse;
    totalBudget: number;
    isHistoryView?: boolean;
}

export default function TripHeader({ data, isHistoryView = false }: TripHeaderProps) {
    const { trip, plan } = data;
    const router = useRouter();
    const { getToken } = useAuth();

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSaveTrip = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            if (!token) {
                toast.error("You must be logged in to save a trip.");
                return;
            }

            const payload = {
                id: trip.id,
                user_id: trip.user_id,
                destination: trip.destination,
                origin: trip.origin,
                start_date: trip.start_date,
                trip_days: trip.trip_days,
                style: trip.style,
                budget: trip.budget,
                plan_data: plan
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to save trip");
            }

            setIsSaved(true);
            toast.success("Trip confirmed! Countdown started. ⏳");

        } catch (error) {
            console.error("Save Error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save trip.");
        } finally {
            setIsSaving(false);
        }
    };

    // Function Delete Trip (Khusus History View)
    const handleDeleteTrip = async () => {
        if (!confirm("Are you sure you want to delete this trip?")) return;
        setIsDeleting(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${trip.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Trip deleted");
                router.push('/history');
            } else {
                throw new Error();
            }
        } catch (e) {
            toast.error("Failed to delete");
            setIsDeleting(false);
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/trips/${trip.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Trip link copied to clipboard!");
    };

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-teal-50 rounded-bl-full opacity-50 -z-10"/>

            {/* Left Content */}
            <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Logika Badge Status */}
                    {isHistoryView ? (
                        <Badge variant="outline"
                               className="border-emerald-200 bg-emerald-50 text-emerald-700 flex gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3"/> Saved Plan
                        </Badge>
                    ) : isSaved ? (
                        <Badge
                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex gap-1 animate-in fade-in shrink-0">
                            <CheckCircle2 className="w-3 h-3"/> Saved
                        </Badge>
                    ) : (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shrink-0">
                            Result Ready
                        </Badge>
                    )}

                    <Badge
                        variant="outline"
                        className="border-slate-200 text-slate-500 capitalize max-w-[200px] md:max-w-[400px] truncate block"
                        title={trip.style}
                    >
                        {trip.style}
                    </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2 truncate">
                    Trip to {trip.destination}
                </h1>
                <p className="text-slate-500 flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400"/> {trip.trip_days} Days Journey
                </p>
            </div>

            {/* Right Content */}
            <div className="flex flex-col items-end gap-3 shrink-0">

                {/* 1. STATUS BADGE (Pengganti Teks Besar) */}
                <div className="hidden md:flex items-center gap-2">
                    {!isHistoryView ? (
                        // TAMPILAN DRAFT (Badge Style)
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                            </span>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Draft Mode
                            </span>
                            <div className="h-4 w-[1px] bg-slate-300 mx-1" />
                            <span className="text-[10px] font-medium text-slate-500">
                                Unsaved
                            </span>
                        </div>
                    ) : (
                        // TAMPILAN SAVED (Premium Feel)
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                Verified Plan
                            </span>
                        </div>
                    )}
                </div>

                {/* 2. ACTION BUTTONS */}
                <div className="flex gap-2">
                    {/* LOGIC TOMBOL SAVE / DELETE */}
                    {!isHistoryView ? (
                        <Button
                            onClick={handleSaveTrip}
                            disabled={isSaving || isSaved}
                            size="sm"
                            className={`h-9 px-5 gap-2 text-white shadow-md transition-all ${
                                isSaved
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300"
                            }`}
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5"/>}
                            <span className="text-sm font-semibold">{isSaving ? "Saving..." : isSaved ? "Saved" : "Save & Unlock"}</span>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleDeleteTrip}
                            disabled={isDeleting}
                            size="sm"
                            className="h-9 gap-2 text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5"/>}
                            <span className="text-sm font-semibold">Delete</span>
                        </Button>
                    )}

                    {/* 3. PREMIUM FEATURES (Share & Print) */}
                    {/* Hanya muncul jika isHistoryView == true (Sudah di-save) */}
                    {isHistoryView && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 text-slate-500 border-slate-200 hover:text-blue-600 hover:border-blue-200 animate-in fade-in zoom-in duration-300"
                                onClick={handleShare}
                                title="Share Trip"
                            >
                                <Share2 className="w-4 h-4"/>
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 text-slate-500 border-slate-200 hover:text-blue-600 hover:border-blue-200 animate-in fade-in zoom-in duration-300 delay-75"
                                onClick={() => window.print()}
                                title="Print / PDF"
                            >
                                <Printer className="w-4 h-4"/>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}