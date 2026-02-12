import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, Trash2, PlusCircle, Utensils, Bed, Coffee, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityCardProps {
    activity: Activity;
    onReplace?: () => void;
    onDelete?: () => void;
    onAddBelow?: () => void;
    className?: string;
    destinationName: string;
    isSelected?: boolean;
    onClick?: () => void;
    isLoading?: boolean; // NEW: Progressive Loading State
}

export default function ActivityCard({
    activity,
    onReplace,
    onDelete,
    onAddBelow,
    className,
    destinationName,
    isSelected,
    onClick,
    isLoading = false
}: ActivityCardProps) {
    // Robust Generic Check
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

    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleCardClick = (e: React.MouseEvent) => {
        if (onClick) onClick(); // Preserve original behavior if needed (e.g. selection)
        setIsExpanded(!isExpanded);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
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
            </div>
        );
    }

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "group relative bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
                isSelected ? "ring-2 ring-blue-500 border-transparent bg-blue-50/10" : "border-slate-100",
                className
            )}
        >
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
                    {isExpanded && (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                            <p className="text-sm text-slate-500 leading-relaxed pl-7 mt-2">
                                {activity.description}
                            </p>

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
                                    onClick={(e) => { e.stopPropagation(); onAddBelow?.(); }}
                                    className="h-8 px-2 text-xs text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-full"
                                    title="Add Activity Below"
                                >
                                    <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add
                                </Button>
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={(e) => { e.stopPropagation(); onReplace?.(); }}
                                    className="h-8 px-2 text-xs text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-full"
                                    title="Swap Activity"
                                >
                                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Replace
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
                        </div>
                    )}
                </div>

                {/* Image Thumbnail (Collapsible) */}
                {isExpanded && activity.image_url && (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 hidden sm:block animate-in fade-in zoom-in duration-300">
                        <img
                            src={activity.image_url}
                            alt={activity.place_name || activity.activity}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            loading="lazy"
                        />
                    </div>
                )}

                {/* 5. Chevron Details Indicator */}
                <div className={`absolute top-5 right-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'text-slate-300'}`}>
                    <ChevronRight className={cn("w-5 h-5", isExpanded ? "text-blue-600" : "text-slate-300")} />
                </div>

            </div>
        </div>
    );
}
