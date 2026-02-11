import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, Trash2, PlusCircle, Utensils, Bed, Coffee, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity } from '@/types';

interface ActivityCardProps {
    activity: Activity;
    onReplace: () => void;
    onDelete: () => void;
    onAddBelow: () => void;
    className?: string;
    destinationName: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function ActivityCard({
    activity,
    onReplace,
    onDelete,
    onAddBelow,
    className,
    destinationName,
    isSelected,
    onClick
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

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
                isSelected ? "ring-2 ring-blue-500 border-transparent bg-blue-50/10" : "border-slate-100",
                className
            )}
        >
            <div className="flex flex-col gap-3">

                {/* 1. Header: Time & Title */}
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                            {activity.time || "Flexible"}
                        </span>
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

                {/* 3. Description */}
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 pl-7">
                    {activity.description}
                </p>

                {/* 4. Action Buttons (Subtle Overlay) */}
                <div className="absolute top-4 right-12 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-slate-100">
                    <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); onAddBelow?.(); }}
                        className="h-7 w-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600"
                        title="Add Activity Below"
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); onReplace?.(); }}
                        className="h-7 w-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-teal-600"
                        title="Swap Activity"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="h-7 w-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-600"
                        title="Delete"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>

                {/* 5. Chevron Details Indicator */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>

            </div>
        </div>
    );
}
