const DrawerHeaderImage = ({ activity }: { activity: Activity }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            // Unsplash logic
            const query = activity.place_name || activity.activity;
            const url = await import('@/services/imageService').then(m => m.fetchUnsplashImage(query));
            if (isMounted && url) setImageUrl(url);
        }
        load();
        return () => { isMounted = false; };
    }, [activity]);

    if (!imageUrl) return <div className="w-full h-full bg-slate-200 animate-pulse" />;
    return <img src={imageUrl} className="w-full h-full object-cover" alt="header" />;
}

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ActivityAlternative } from "@/types";
import { MapPin, Star, Plus, Loader2, Sparkles, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { getActivityAlternatives } from "@/actions/ai-swap";
import { MapActivityThumbnail } from "@/components/business/MapActivityThumbnail";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface ActivityReplacementDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    day: number;
    activityIndex: number;
    originalActivity: Activity | null;
    onSelect: (alternative: ActivityAlternative) => void;
}

export default function ActivityReplacementDrawer({
    isOpen,
    onClose,
    tripId,
    day,
    activityIndex,
    originalActivity,
    onSelect
}: ActivityReplacementDrawerProps) {
    const [alternatives, setAlternatives] = useState<ActivityAlternative[]>([]);
    const [selectedOption, setSelectedOption] = useState<ActivityAlternative | null>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Load alternatives (from cache or AI)
    const fetchAlternatives = (force: boolean = false) => {
        if (!tripId || !originalActivity) return;

        startTransition(async () => {
            setError(null);
            try {
                const data = await getActivityAlternatives(tripId, day, activityIndex, force);
                setAlternatives(data);
            } catch (err) {
                setError("Failed to load alternatives.");
            }
        });
    };

    useEffect(() => {
        if (isOpen && originalActivity) {
            // Set initial selected option to original
            setSelectedOption(originalActivity as unknown as ActivityAlternative);

            // If we already have alternatives in the activity object, use them immediately
            if (originalActivity.alternatives && originalActivity.alternatives.length > 0) {
                setAlternatives(originalActivity.alternatives);
            } else {
                fetchAlternatives(false);
            }
        } else if (!isOpen) {
            setAlternatives([]);
            setSelectedOption(null);
        }
    }, [isOpen, originalActivity, tripId, day, activityIndex]);

    // DERIVED STATE: UNIFIED POOL
    const allOptions = useMemo(() => {
        if (!originalActivity) return alternatives;

        // Ensure original is treated as an alternative for the list
        const originalAsAlt = originalActivity as unknown as ActivityAlternative;

        // Combine original + alternatives, removing duplicates by place_name or activity name
        const combined = [originalAsAlt, ...alternatives];
        return combined.filter((v, i, a) =>
            a.findIndex(t => (t.place_name === v.place_name || t.activity === v.activity)) === i
        );
    }, [originalActivity, alternatives]);

    const availableOptions = useMemo(() => {
        if (!selectedOption) return [];
        // Filter out the currently selected option from the list
        return allOptions.filter(opt =>
            opt.place_name !== selectedOption.place_name &&
            opt.activity !== selectedOption.activity
        );
    }, [allOptions, selectedOption]);

    const handleConfirmSelection = () => {
        if (selectedOption && originalActivity) {
            // Only fire update if it's different from original, OR explicitly confirmed
            // Actually, if we selected original back, we might want to just close or revert?
            // The prompt says: "If selectedActivity is DIFFERENT from originalActivity, the main 'Save/Confirm' button should be active."
            // So if it's original, maybe we just close?
            // But let's assume onSelect handles update logic.
            // If it's the original activity, we might need to pass `originalActivity` to `onSelect` 
            // but `onSelect` expects `ActivityAlternative`.
            onSelect(selectedOption);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="sm:max-w-xl p-0 border-l border-slate-100 shadow-2xl">
                <VisuallyHidden.Root>
                    <SheetHeader>
                        <SheetTitle>Activity Replacement</SheetTitle>
                        <SheetDescription>Explore alternative activities for your trip</SheetDescription>
                    </SheetHeader>
                </VisuallyHidden.Root>
                <div className="h-full flex flex-col bg-white overflow-hidden rounded-l-[32px]">

                    {/* 1. HERO HEADER IMAGE (Full Width) */}
                    <div className="relative h-56 w-full bg-slate-100 flex-shrink-0">
                        {selectedOption && (
                            // Use derived component or just reuse logic since MapActivityThumbnail expects Activity
                            // We cast selectedOption to any to match Activity signature roughly, mainly for image query
                            <DrawerHeaderImage activity={selectedOption as any} />
                        )}
                        {/* Overlay Gradient for Text Contrast */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-6 left-6">
                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-teal-500 fill-teal-500" />
                                {selectedOption?.activity === originalActivity?.activity ? "Current Selection" : "New Selection"}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 bg-white -mt-6 relative z-10 w-full">

                        {/* 2. HEADER CONTENT (Title & Meta Pills) */}
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                                {selectedOption?.activity || "Select Activity"}
                            </h2>

                            {/* Meta-Data Pill Badges */}
                            <div className="flex flex-wrap gap-2">
                                {/* Only show time if available, or fallback */}
                                {(selectedOption as any)?.time && (
                                    <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5 text-xs font-bold text-slate-600">
                                        <Clock className="w-3.5 h-3.5" />
                                        {(selectedOption as any).time}
                                    </div>
                                )}
                                {selectedOption?.place_name && (
                                    <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5 text-xs font-bold text-slate-600">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {selectedOption.place_name}
                                    </div>
                                )}
                                <div className="inline-flex items-center gap-1.5 bg-green-50 rounded-full px-3 py-1.5 text-xs font-bold text-green-700">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    {(selectedOption as any)?.price || "$$"}
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                "{selectedOption?.description}"
                            </p>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        {/* 3. ALTERNATIVES LIST */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-teal-500 fill-teal-500" />
                                    Other Options
                                </h4>

                                {!isPending && alternatives.length > 0 && (
                                    <button
                                        onClick={() => fetchAlternatives(true)}
                                        className="text-[10px] font-bold uppercase text-slate-300 hover:text-teal-600 transition-colors flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full"
                                    >
                                        <Loader2 className={cn("w-3 h-3", isPending && "animate-spin")} />
                                        Refresh Options
                                    </button>
                                )}
                            </div>

                            {isPending ? (
                                // SKELETON LOADER
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 relative overflow-hidden">
                                        <div className="animate-pulse flex flex-col gap-4">
                                            <div className="h-4 w-24 bg-slate-200 rounded-full" />
                                            <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
                                            <div className="h-12 w-full bg-slate-200 rounded-xl" />
                                        </div>
                                    </div>
                                ))
                            ) : error ? (
                                <div className="text-center p-8 bg-red-50 rounded-3xl border border-red-100">
                                    <p className="text-red-600 font-bold mb-2">Oops!</p>
                                    <p className="text-red-400 text-sm">{error}</p>
                                    <Button variant="outline" onClick={() => fetchAlternatives(true)} className="mt-4 rounded-full border-red-200 text-red-600 font-bold">Try Refreshing</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {availableOptions.map((alt, idx) => {
                                        const isOriginal = alt.activity === originalActivity?.activity;
                                        return (
                                            <div
                                                key={idx}
                                                className="group relative bg-white border border-slate-100 rounded-[24px] p-1 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300"
                                            >
                                                <div className="p-5 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        {isOriginal ? (
                                                            <Badge className="bg-teal-600 text-white text-[10px] font-black uppercase rounded-lg border-teal-600 shadow-md">
                                                                Original Plan
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg border-slate-200">
                                                                Option {idx + 1}
                                                            </Badge>
                                                        )}
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">
                                                            <MapPin className="w-3 h-3" />
                                                            {alt.place_name}
                                                        </div>
                                                    </div>

                                                    <h5 className="font-black text-slate-900 text-lg leading-tight group-hover:text-teal-700 transition-colors">
                                                        {alt.activity}
                                                    </h5>

                                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                        {alt.description}
                                                    </p>
                                                </div>

                                                {/* Action Button Area within Card */}
                                                <div className="px-5 pb-5">
                                                    <Button
                                                        onClick={() => setSelectedOption(alt)}
                                                        className={cn(
                                                            "w-full rounded-2xl font-bold h-12 shadow-md transition-all active:scale-95 flex items-center gap-2",
                                                            isOriginal ? "bg-teal-50 hover:bg-teal-100 text-teal-700" : "bg-slate-900 hover:bg-black text-white"
                                                        )}
                                                    >
                                                        {isOriginal ? (
                                                            <span>Restore Original Plan</span>
                                                        ) : (
                                                            <>
                                                                <span>Preview This Plan</span>
                                                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                                                    <Plus className="w-3 h-3 text-white" />
                                                                </div>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ACTION AREA (Footer) */}
                    <div className="p-6 bg-white border-t border-slate-100 space-y-3">
                        {selectedOption?.activity !== originalActivity?.activity ? (
                            <Button
                                onClick={handleConfirmSelection}
                                className="w-full rounded-2xl bg-[#42707D] hover:bg-[#355963] text-white font-bold h-14 shadow-xl transition-all active:scale-95 text-lg"
                            >
                                Confirm & Swap Activity
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="w-full rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 h-14 border border-transparent hover:border-slate-200 transition-all"
                            >
                                Keep Original Activity
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
