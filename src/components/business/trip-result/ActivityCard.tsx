'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, Trash2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity } from '@/types';

interface ActivityCardProps {
    activity: Activity;
    onReplace?: () => void;
    onDelete?: () => void;
    onAddBelow?: () => void;
    className?: string;
}

export default function ActivityCard({
    activity,
    onReplace,
    onDelete,
    onAddBelow,
    className
}: ActivityCardProps) {
    return (
        <div className={cn(
            "group relative bg-white rounded-[2rem] p-6 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]",
            className
        )}>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Thumbnail Image */}
                <div className="w-full md:w-40 h-32 shrink-0 rounded-2xl overflow-hidden shadow-sm">
                    <img
                        src={`https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80`}
                        alt={activity.activity}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>

                {/* Content */}
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

                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mb-3">
                        <MapPin className="w-4 h-4 text-[#42707D]" />
                        <span>{activity.place_name || "Location TBD"}</span>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                        {activity.description}
                    </p>
                </div>

                {/* Actions (Always subtle, pops on hover) */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
