'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, Trash2, PlusCircle, Utensils, Bed, Coffee, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity } from '@/types';

interface ActivityCardProps {
    activity: Activity;
    onReplace?: () => void;
    onDelete?: () => void;
    onAddBelow?: () => void;
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
    const isGeneric = activity.location_type === 'generic';

    // Helper to get generic icon
    const getGenericIcon = () => {
        const type = activity.type?.toLowerCase() || '';
        if (type.includes('culinary') || type.includes('eat') || type.includes('breakfast') || type.includes('lunch') || type.includes('dinner')) return <Utensils className="w-4 h-4 text-orange-500" />;
        if (type.includes('stay') || type.includes('hotel') || type.includes('accommodation') || type.includes('check-in')) return <Bed className="w-4 h-4 text-blue-500" />;
        if (type.includes('coffee') || type.includes('cafe') || type.includes('break')) return <Coffee className="w-4 h-4 text-amber-600" />;
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-white rounded-[2rem] p-6 transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] cursor-pointer border-2",
                isSelected ? "ring-4 ring-teal-500/20 border-teal-500 bg-teal-50/30 shadow-[0_20px_40px_rgb(20,184,166,0.1)]" : "border-transparent",
                className
            )}
        >
            <div className="flex flex-col gap-2">
                {/* Content - Full Width */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-[#42707D] uppercase tracking-wider">
                            {activity.time || "TBA"}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {activity.type || "Activity"}
                        </span>
                    </div>

                    <h4 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                        {activity.activity}
                    </h4>

                    {!isGeneric && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mb-3">
                            <MapPin className="w-4 h-4 text-[#42707D]" />
                            <span>{activity.place_name || "Location TBD"}</span>
                        </div>
                    )}

                    {isGeneric && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 font-bold mb-3 italic">
                            {getGenericIcon()}
                            <span>{activity.place_name || "Neighborhood"}</span>
                        </div>
                    )}

                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        {activity.description}
                    </p>
                </div>

                {/* Actions (Always subtle, pops on hover) */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); onAddBelow?.(); }}
                        className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                        <PlusCircle className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); onReplace?.(); }}
                        className="h-9 w-9 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
