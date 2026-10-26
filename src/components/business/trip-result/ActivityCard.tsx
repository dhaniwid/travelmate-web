'use client';

import React, { useMemo } from 'react';
import { MapPin, RefreshCw, Trash2, PlusCircle, Utensils, Bed, Coffee, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity } from '@/types';
import { tripService } from '@/services/trip';
import { useAuth } from '@clerk/nextjs';
import { fetchUnsplashImage } from '@/services/imageService';

interface ActivityCardProps {
    activity: Activity;
    tripId?: string;
    dayIndex?: number;
    activityIndex?: number;
    onReplace?: () => void;
    onDelete?: () => void;
    onAddBelow?: (time: string) => void;
    onEnrich?: (enriched: Activity) => void;
    className?: string;
    destinationName: string;
    isSelected?: boolean;
    isExpanded?: boolean;
    onClick?: () => void;
    isLoading?: boolean;
    isHiddenGem?: boolean;
    isPro?: boolean;
    aiEditsUsed?: number;
}

const TIME_OF_DAY = (timeStr: string) => {
    const hour = parseInt((timeStr || '').split(':')[0]);
    if (isNaN(hour)) return { icon: '☕', label: 'Pagi', color: 'text-zinc-600' };
    if (hour < 11) return { icon: '☕', label: 'Pagi', color: 'text-zinc-600' };
    if (hour < 16) return { icon: '☀️', label: 'Siang', color: 'text-zinc-600' };
    if (hour < 19) return { icon: '🌅', label: 'Sore', color: 'text-zinc-600' };
    return { icon: '🌙', label: 'Malam', color: 'text-zinc-600' };
};

// Skeleton block for light bg
function DarkSkeleton({ className }: { className?: string }) {
    return <div className={cn('bg-zinc-100 animate-pulse rounded-lg', className)} />;
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
    aiEditsUsed = 0,
}: ActivityCardProps) {
    const { getToken } = useAuth();
    const [activity, setActivity] = React.useState<Activity>(initialActivity);
    const [isInternalLoading, setIsInternalLoading] = React.useState(false);
    const [hasAttemptedEnrichment, setHasAttemptedEnrichment] = React.useState(false);
    const [userSetTime, setUserSetTime] = React.useState<string | null>(null);
    const [isSettingTime, setIsSettingTime] = React.useState(false);
    const [fallbackImageUrl, setFallbackImageUrl] = React.useState<string | null>(null);

    const isHiddenGem = forcedIsHiddenGem ?? activity.is_hidden_gem;

    React.useEffect(() => { setActivity(initialActivity); }, [initialActivity]);

    // Lazy enrichment on expand
    React.useEffect(() => {
        if (
            isExpanded &&
            activity.is_skeleton &&
            !hasAttemptedEnrichment &&
            tripId &&
            dayIndex !== undefined &&
            activityIndex !== undefined
        ) {
            handleEnrichment();
        }
    }, [isExpanded, activity.is_skeleton, hasAttemptedEnrichment, tripId, dayIndex, activityIndex]);

    const handleEnrichment = async () => {
        if (!tripId) return;
        try {
            setIsInternalLoading(true);
            setHasAttemptedEnrichment(true);
            const token = await getToken();
            const enrichedData = await tripService.enrichActivity(tripId, dayIndex!, activityIndex!, token);
            if (enrichedData) {
                setActivity(enrichedData);
                onEnrich?.(enrichedData);
            }
        } catch (error) {
            console.error('[ActivityCard] Enrichment error:', error);
        } finally {
            setIsInternalLoading(false);
        }
    };

    // Unsplash fallback on expand
    React.useEffect(() => {
        if (!isExpanded || activity.image_url || fallbackImageUrl) return;
        const query = activity.place_name || activity.activity;
        if (!query) return;
        fetchUnsplashImage(query).then(url => { if (url) setFallbackImageUrl(url); });
    }, [isExpanded, activity.image_url, activity.place_name, activity.activity]);

    const isLoading = parentLoading || isInternalLoading;

    const isGeneric = useMemo(() => {
        if ((activity as any).location_type === 'generic') return true;
        const lowerName = activity.activity.toLowerCase();
        const lowerDesc = activity.description?.toLowerCase() || '';
        const lowerPlace = activity.place_name?.toLowerCase() || '';
        const genericKeywords = ['around', 'near', 'check-in', 'check in', 'free time', 'explore', 'arrival', 'departure'];
        return genericKeywords.some(k => lowerName.includes(k) || lowerDesc.includes(k) || lowerPlace.includes(k));
    }, [activity]);

    const getGenericIcon = () => {
        const type = (activity.type || '').toLowerCase();
        const actName = activity.activity.toLowerCase();
        if (type.includes('culinary') || type.includes('eat') || actName.includes('lunch') || actName.includes('dinner'))
            return <Utensils className="w-3.5 h-3.5 text-orange-400" />;
        if (type.includes('stay') || type.includes('hotel') || actName.includes('check-in'))
            return <Bed className="w-3.5 h-3.5 text-sky-400" />;
        if (type.includes('coffee') || actName.includes('coffee'))
            return <Coffee className="w-3.5 h-3.5 text-amber-400" />;
        return <Sparkles className="w-3.5 h-3.5 text-violet-400" />;
    };

    const locationLabel = (() => {
        const isDuplicate = activity.place_name?.trim().toLowerCase() === activity.activity?.trim().toLowerCase();
        if (!isDuplicate && activity.place_name) return activity.place_name;
        if (activity.address && activity.address.trim().toLowerCase() !== activity.activity?.trim().toLowerCase())
            return activity.address;
        return destinationName;
    })();

    const tod = TIME_OF_DAY(activity.time);
    const imageUrl = activity.image_url || fallbackImageUrl;

    return (
        <div
            onClick={isLoading ? undefined : onClick}
            className={cn(
                'group relative rounded-xl border transition-all duration-200',
                !isLoading && 'cursor-pointer active:scale-[0.99]',
                isSelected
                    ? 'bg-zinc-50 border-zinc-950 ring-1 ring-zinc-950 shadow-sm'
                    : 'bg-white border-zinc-200 hover:border-zinc-400 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
                isHiddenGem && !isSelected && 'border-teal-300 bg-teal-50/30',
                className
            )}
        >
            {/* Hidden Gem badge */}
            {isHiddenGem && !isLoading && (
                <div className="absolute -top-2.5 right-4 z-10">
                    <span className="inline-flex items-center gap-1 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" /> Hidden Gem
                    </span>
                </div>
            )}

            {isLoading ? (
                /* ── Skeleton ── */
                <div className="p-4 flex gap-3">
                    <div className="flex-1 space-y-2.5">
                        <div className="flex items-center gap-2">
                            <DarkSkeleton className="w-14 h-3.5" />
                            <DarkSkeleton className="w-20 h-4 rounded-full" />
                        </div>
                        <DarkSkeleton className="w-3/4 h-5" />
                        <div className="flex items-center gap-1.5 mt-1">
                            <DarkSkeleton className="w-4 h-4 rounded-full" />
                            <DarkSkeleton className="w-2/5 h-3.5" />
                        </div>
                    </div>
                    <DarkSkeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                </div>
            ) : (
                <div className="p-4">
                    {/* Top row: time label + image thumbnail (collapsed) */}
                    <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            {/* Time of day */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[13px] leading-none">{tod.icon}</span>
                                <span className={cn('text-[11px] font-bold uppercase tracking-wide', tod.color)}>
                                    {tod.label}
                                </span>
                                {userSetTime && (
                                    <>
                                        <span className="text-zinc-300 text-xs">·</span>
                                        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-zinc-700">
                                            <Clock className="w-2.5 h-2.5" /> {userSetTime}
                                        </span>
                                    </>
                                )}
                                {activity.type && (
                                    <span className="ml-auto text-[10px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 rounded-md">
                                        {activity.type}
                                    </span>
                                )}
                            </div>

                            {/* Activity name */}
                            <h4 className="text-[15px] font-bold text-zinc-950 leading-snug line-clamp-2 pr-6">
                                {activity.activity}
                            </h4>

                            {/* Location */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                                {isGeneric ? (
                                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">{getGenericIcon()}</div>
                                ) : (
                                    <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-px" />
                                )}
                                <span className="text-[12px] font-medium text-zinc-500 truncate">{locationLabel}</span>
                            </div>
                        </div>

                        {/* Thumbnail — always visible if image exists */}
                        {imageUrl && (
                            <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border border-zinc-200">
                                <img
                                    src={imageUrl}
                                    alt={activity.place_name || activity.activity}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        {/* Chevron */}
                        <ChevronRight className={cn(
                            'absolute top-4 right-4 w-4 h-4 transition-transform duration-200 flex-shrink-0',
                            isExpanded ? 'rotate-90 text-zinc-950' : 'text-zinc-400'
                        )} />
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-zinc-200 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            {/* Full description */}
                            {activity.description || activity.description_short ? (
                                <p className="text-[13px] text-zinc-600 leading-relaxed">
                                    {activity.description || activity.description_short}
                                </p>
                            ) : isInternalLoading ? (
                                <div className="space-y-1.5">
                                    <DarkSkeleton className="w-full h-3" />
                                    <DarkSkeleton className="w-5/6 h-3" />
                                </div>
                            ) : null}

                            {/* Larger image when expanded */}
                            {imageUrl && (
                                <div className="w-full h-36 rounded-xl overflow-hidden border border-zinc-200">
                                    <img
                                        src={imageUrl}
                                        alt={activity.place_name || activity.activity}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.place_name || activity.activity)}`, '_blank');
                                    }}
                                    className="flex items-center gap-1 h-7 px-3 rounded-full border border-zinc-200 bg-white text-[11px] font-semibold text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 transition-colors"
                                >
                                    <MapPin className="w-3 h-3 text-teal-600" /> Buka Maps
                                </button>

                                {/* Set time */}
                                {isSettingTime ? (
                                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="time"
                                            defaultValue={userSetTime || ''}
                                            autoFocus
                                            className="h-7 px-2 text-[11px] font-semibold rounded-full border border-zinc-300 bg-white text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                                            onChange={e => setUserSetTime(e.target.value || null)}
                                            onBlur={() => setIsSettingTime(false)}
                                            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setIsSettingTime(false); }}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsSettingTime(true); }}
                                        className="flex items-center gap-1 h-7 px-3 rounded-full border border-zinc-200 bg-white text-[11px] font-semibold text-zinc-600 hover:border-zinc-950 hover:text-zinc-950 transition-colors"
                                    >
                                        <Clock className="w-3 h-3" />
                                        {userSetTime || '+ Waktu'}
                                    </button>
                                )}

                                <button
                                    onClick={(e) => { e.stopPropagation(); onAddBelow?.(activity.time); }}
                                    className="flex items-center gap-1 h-7 px-3 rounded-full border border-zinc-200 bg-white text-[11px] font-semibold text-zinc-600 hover:border-zinc-950 hover:text-zinc-950 transition-colors"
                                >
                                    <PlusCircle className="w-3 h-3" /> Tambah
                                </button>

                                {/* Ganti Aktivitas — primary action */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onReplace?.(); }}
                                    className="flex items-center gap-1 h-7 px-3 rounded-full bg-zinc-950 text-[11px] font-semibold text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3 text-teal-400" />
                                    Ganti Aktivitas
                                    {!isPro && (
                                        <span className="ml-1 text-[9px] bg-white/20 px-1.5 py-px rounded-full font-bold">
                                            {aiEditsUsed}/3
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                                    className="flex items-center gap-1 h-7 px-2 rounded-full text-[11px] text-zinc-400 hover:text-rose-600 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
