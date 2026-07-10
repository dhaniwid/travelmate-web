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
    if (isNaN(hour)) return { icon: '☕', label: 'Pagi', color: 'text-orange-400' };
    if (hour < 11) return { icon: '☕', label: 'Pagi', color: 'text-orange-400' };
    if (hour < 16) return { icon: '☀️', label: 'Siang', color: 'text-yellow-400' };
    if (hour < 19) return { icon: '🌅', label: 'Sore', color: 'text-rose-400' };
    return { icon: '🌙', label: 'Malam', color: 'text-indigo-400' };
};

// Skeleton block for dark bg
function DarkSkeleton({ className }: { className?: string }) {
    return <div className={cn('bg-white/8 animate-pulse rounded-lg', className)} />;
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
            style={{ borderWidth: '0.5px' }}
            className={cn(
                'group relative rounded-xl border transition-all duration-200',
                !isLoading && 'cursor-pointer active:scale-[0.99]',
                isSelected
                    ? 'bg-[#0D2040] border-teal-500/40 ring-1 ring-teal-500/30'
                    : 'bg-[#0A1628] border-white/8 hover:border-white/16',
                isHiddenGem && 'border-teal-500/30 bg-teal-500/5',
                className
            )}
        >
            {/* Hidden Gem badge */}
            {isHiddenGem && !isLoading && (
                <div className="absolute -top-2.5 right-4 z-10">
                    <span className="inline-flex items-center gap-1 bg-teal-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
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
                                <span className={cn('text-[11px] font-semibold uppercase tracking-wide', tod.color)}>
                                    {tod.label}
                                </span>
                                {userSetTime && (
                                    <>
                                        <span className="text-white/20 text-xs">·</span>
                                        <span className="flex items-center gap-0.5 text-[11px] text-white/40">
                                            <Clock className="w-2.5 h-2.5" /> {userSetTime}
                                        </span>
                                    </>
                                )}
                                {activity.type && (
                                    <span className="ml-auto text-[10px] text-white/30 bg-white/6 px-2 py-0.5 rounded-full">
                                        {activity.type}
                                    </span>
                                )}
                            </div>

                            {/* Activity name */}
                            <h4 className="text-[15px] font-semibold text-white leading-snug line-clamp-2 pr-6">
                                {activity.activity}
                            </h4>

                            {/* Location */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                                {isGeneric ? (
                                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">{getGenericIcon()}</div>
                                ) : (
                                    <MapPin className="w-3 h-3 text-teal-400 flex-shrink-0 mt-px" />
                                )}
                                <span className="text-[12px] text-white/45 truncate">{locationLabel}</span>
                            </div>
                        </div>

                        {/* Thumbnail — always visible if image exists */}
                        {imageUrl && (
                            <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border border-white/8">
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
                            isExpanded ? 'rotate-90 text-teal-400' : 'text-white/20'
                        )} />
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-white/8 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            {/* Full description */}
                            {activity.description || activity.description_short ? (
                                <p className="text-[13px] text-white/60 leading-relaxed">
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
                                <div className="w-full h-36 rounded-xl overflow-hidden border border-white/8">
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
                                    className="flex items-center gap-1 h-7 px-3 rounded-full border border-white/12 text-[11px] text-white/50 hover:text-teal-400 hover:border-teal-500/40 transition-colors"
                                >
                                    <MapPin className="w-3 h-3" /> Buka Maps
                                </button>

                                {/* Set time */}
                                {isSettingTime ? (
                                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="time"
                                            defaultValue={userSetTime || ''}
                                            autoFocus
                                            className="h-7 px-2 text-[11px] rounded-full border border-white/20 bg-white/8 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                                            onChange={e => setUserSetTime(e.target.value || null)}
                                            onBlur={() => setIsSettingTime(false)}
                                            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setIsSettingTime(false); }}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsSettingTime(true); }}
                                        className="flex items-center gap-1 h-7 px-3 rounded-full border border-white/12 text-[11px] text-white/40 hover:text-white/70 transition-colors"
                                    >
                                        <Clock className="w-3 h-3" />
                                        {userSetTime || '+ Waktu'}
                                    </button>
                                )}

                                <button
                                    onClick={(e) => { e.stopPropagation(); onAddBelow?.(activity.time); }}
                                    className="flex items-center gap-1 h-7 px-3 rounded-full border border-white/12 text-[11px] text-white/40 hover:text-teal-400 hover:border-teal-500/30 transition-colors"
                                >
                                    <PlusCircle className="w-3 h-3" /> Tambah
                                </button>

                                {/* Ganti Aktivitas — primary action */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onReplace?.(); }}
                                    className="flex items-center gap-1 h-7 px-3 rounded-full bg-teal-500/15 border border-teal-500/30 text-[11px] text-teal-400 hover:bg-teal-500/25 transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Ganti Aktivitas
                                    {!isPro && (
                                        <span className="ml-1 text-[9px] bg-teal-500/20 px-1.5 py-px rounded-full font-bold">
                                            {aiEditsUsed}/3
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                                    className="flex items-center gap-1 h-7 px-2 rounded-full text-[11px] text-white/30 hover:text-rose-400 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
