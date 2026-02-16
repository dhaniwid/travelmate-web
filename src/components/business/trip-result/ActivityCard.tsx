import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, Trash2, PlusCircle, Utensils, Bed, Coffee, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { tripService } from '@/services/trip';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';

interface ActivityCardProps {
    activity: Activity;
    tripId?: string;       // NEW: For lazy loading
    dayIndex?: number;     // NEW: For lazy loading
    activityIndex?: number; // NEW: For lazy loading
    onReplace?: () => void;
    onDelete?: () => void;
    onAddBelow?: (time: string) => void;
    onEnrich?: (enriched: Activity) => void; // Optional: Bubble up enrichment
    className?: string;
    destinationName: string;
    isSelected?: boolean;
    isExpanded?: boolean; // NEW: Control expansion from parent
    onClick?: () => void;
    isLoading?: boolean;
    isHiddenGem?: boolean; // NEW
    isPro?: boolean;      // NEW: For quota display
    aiEditsUsed?: number; // NEW: For quota display
}

export default function ActivityCard({
    activity: initialActivity,
    tripId,
    dayIndex,
    activityIndex,
    onReplace,
    onDelete,
    onAddBelow,
    onEnrich,
    className,
    destinationName,
    isSelected,
    isExpanded = false,
    onClick,
    isLoading: parentLoading = false,
    isHiddenGem: forcedIsHiddenGem,
    isPro = false,
    aiEditsUsed = 0
}: ActivityCardProps) {
    const { getToken } = useAuth();
    const [activity, setActivity] = React.useState<Activity>(initialActivity);
    const [isInternalLoading, setIsInternalLoading] = React.useState(false);
    const [hasAttemptedEnrichment, setHasAttemptedEnrichment] = React.useState(false);

    const isHiddenGem = forcedIsHiddenGem ?? activity.is_hidden_gem;

    // Sync if initialActivity changes (e.g. from parent)
    React.useEffect(() => {
        setActivity(initialActivity);
    }, [initialActivity]);

    // LAZY LOADING ENRICHMENT LOGIC
    React.useEffect(() => {
        const shouldEnrich =
            isExpanded &&
            activity.is_skeleton &&
            !hasAttemptedEnrichment &&
            tripId &&
            dayIndex !== undefined &&
            activityIndex !== undefined;

        if (shouldEnrich) {
            handleEnrichment();
        }
    }, [isExpanded, activity.is_skeleton, hasAttemptedEnrichment, tripId, dayIndex, activityIndex]);

    const handleEnrichment = async () => {
        if (!tripId) return;

        try {
            setIsInternalLoading(true);
            setHasAttemptedEnrichment(true);

            // Use the centralized tripService to avoid duplicate /api/v1 issues
            const token = await getToken();
            const enrichedData = await tripService.enrichActivity(tripId, dayIndex!, activityIndex!, token);

            if (enrichedData) {
                setActivity(enrichedData);
                if (onEnrich) {
                    onEnrich(enrichedData);
                }
            }
        } catch (error) {
            console.error('[ActivityCard] Enrichment error:', error);
        } finally {
            setIsInternalLoading(false);
        }
    };

    const isLoading = parentLoading || isInternalLoading;

    // Miru's Generic POI Check
    const isGeneric = useMemo(() => {
        if (activity.location_type === 'generic') return true;
        const lowerName = activity.activity.toLowerCase();
        const lowerDesc = activity.description?.toLowerCase() || '';
        const lowerPlace = activity.place_name?.toLowerCase() || '';

        // Inference keywords
        const genericKeywords = ['around', 'near', 'check-in', 'check in', 'free time', 'explore', 'arrival', 'departure'];
        if (genericKeywords.some(k => lowerName.includes(k) || lowerDesc.includes(k) || lowerPlace.includes(k))) return true;
        return false;
    }, [activity]);

    // Helper to get generic icon
    const getGenericIcon = () => {
        const type = (activity.type || '').toLowerCase();
        const actName = activity.activity.toLowerCase();

        if (type.includes('culinary') || type.includes('eat') || actName.includes('lunch') || actName.includes('dinner'))
            return <Utensils className="w-4 h-4 text-orange-400" />;
        if (type.includes('stay') || type.includes('hotel') || actName.includes('check-in'))
            return <Bed className="w-4 h-4 text-blue-400" />;
        if (type.includes('coffee') || actName.includes('coffee'))
            return <Coffee className="w-4 h-4 text-amber-500" />;
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if (onClick) onClick();
    };

    return (
        <div
            onClick={isLoading ? undefined : handleCardClick}
            className={cn(
                "group relative bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all duration-300",
                !isLoading && "cursor-pointer",
                isSelected ? "ring-2 ring-blue-500 border-transparent bg-blue-50/10 shadow-blue-100/50" : "border-slate-200/60",
                isHiddenGem && "border-teal-500/30 bg-gradient-to-br from-white to-teal-50/20 shadow-teal-100/20 border-[1.5px]",
                className
            )}
        >
            {/* GEM BADGE */}
            {isHiddenGem && !isLoading && (
                <div className="absolute -top-2.5 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-none shadow-sm text-[10px] py-0.5 px-2.5 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Hidden Gem
                    </Badge>
                </div>
            )}
            {isLoading ? (
                <div className="flex gap-4 sm:gap-6">
                    <div className="flex-1 flex flex-col gap-3">
                        {/* Skeleton Header */}
                        <div className="flex items-center gap-2 mb-1.5">
                            <Skeleton className="w-16 h-4 rounded-md" />
                            <Skeleton className="w-20 h-5 rounded-full" />
                        </div>
                        <Skeleton className="w-3/4 h-7 rounded-md" />

                        {/* Skeleton Location */}
                        <div className="flex items-center gap-2 mt-1">
                            <Skeleton className="w-5 h-5 rounded-full" />
                            <Skeleton className="w-1/2 h-4 rounded-md" />
                        </div>

                        {/* Skeleton Description */}
                        <div className="space-y-2 mt-1 pl-7">
                            <Skeleton className="w-full h-3 rounded-md" />
                            <Skeleton className="w-5/6 h-3 rounded-md" />
                        </div>
                    </div>
                    {/* Skeleton Image */}
                    <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl hidden sm:block" />
                </div>
            ) : (
                <div className="flex gap-4 sm:gap-6">
                    <div className="flex-1 flex flex-col gap-3">

                        {/* 1. Header: Time & Title */}
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    {activity.time || "Flexible"}
                                </span>
                                {activity.type && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border-none">
                                        {activity.type}
                                    </Badge>
                                )}
                            </div>

                            <h4 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                                {activity.activity}
                            </h4>
                        </div>

                        {/* 2. Location (Specific vs Generic) */}
                        <div className="flex items-start gap-2">
                            {isGeneric ? (
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-50 flex-shrink-0 mt-0.5">
                                    {getGenericIcon()}
                                </div>
                            ) : (
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 flex-shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
                                    <MapPin className="w-3 h-3 text-blue-600" />
                                </div>
                            )}

                            <span className="text-sm font-semibold text-slate-500 mt-0.5 break-words line-clamp-1 group-hover:text-slate-900 transition-colors">
                                {activity.place_name || destinationName}
                            </span>
                        </div>

                        {/* 3. Description (Collapsible) */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    {isLoading && !activity.description ? (
                                        <div className="space-y-2 mt-2 pl-7">
                                            <Skeleton className="w-full h-3 rounded-md" />
                                            <Skeleton className="w-5/6 h-3 rounded-md" />
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 leading-relaxed pl-7 mt-2">
                                            {activity.description || activity.description_short}
                                        </p>
                                    )}

                                    {/* Action Buttons (Visible only when expanded) */}
                                    <div className="flex items-center gap-2 mt-4 pl-7 flex-wrap">
                                        <Button
                                            size="sm" variant="outline"
                                            className="h-8 text-xs gap-1.5 rounded-full border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                            onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.place_name || activity.activity)}`, '_blank'); }}
                                        >
                                            <MapPin className="w-3.5 h-3.5" />
                                            Open in Maps
                                        </Button>

                                        <div className="w-px h-4 bg-slate-200 mx-1"></div>

                                        <Button
                                            variant="ghost" size="sm"
                                            onClick={(e) => { e.stopPropagation(); onAddBelow?.(activity.time); }}
                                            className="h-8 px-2 text-xs text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-full"
                                            title="Add Activity Below"
                                        >
                                            <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add
                                        </Button>
                                        <Button
                                            variant="ghost" size="sm"
                                            onClick={(e) => { e.stopPropagation(); onReplace?.(); }}
                                            className="h-8 px-2 text-xs text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-full relative group/replace"
                                            title="Swap Activity"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                            {(!isPro && aiEditsUsed !== undefined) ? (
                                                <div className="flex items-center">
                                                    <span>Replace</span>
                                                    <Badge className="ml-1.5 h-4 px-1 text-[8px] bg-teal-50 text-teal-600 border-teal-100 font-black">
                                                        {aiEditsUsed}/3
                                                    </Badge>
                                                </div>
                                            ) : (
                                                "Replace"
                                            )}
                                            {!isPro && <Sparkles className="w-2 h-2 absolute -top-0.5 -right-0.5 text-teal-500 animate-pulse" />}
                                        </Button>
                                        <Button
                                            variant="ghost" size="sm"
                                            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                                            className="h-8 px-2 text-xs text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-full"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Image Thumbnail (Collapsible) */}
                    {isExpanded && (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 hidden sm:block animate-in fade-in zoom-in duration-300">
                            {isLoading && !activity.image_url ? (
                                <Skeleton className="w-full h-full" />
                            ) : activity.image_url ? (
                                <img
                                    src={activity.image_url}
                                    alt={activity.place_name || activity.activity}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                    loading="lazy"
                                />
                            ) : null}
                        </div>
                    )}

                    {/* 5. Chevron Details Indicator */}
                    <div className={`absolute top-5 right-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'text-slate-300'}`}>
                        <ChevronRight className={cn("w-5 h-5", isExpanded ? "text-blue-600" : "text-slate-300")} />
                    </div>
                </div>
            )}
        </div>
    );
}
