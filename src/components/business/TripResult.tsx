'use client';

import React, { useTransition } from 'react';
import { TripResponse, Activity, ActivityAlternative } from '@/types';
import ScrollAwareNavbar from './trip-result/ScrollAwareNavbar';
import TripHeader from './trip-result/TripHeader';
import TripCustomizationModal from './trip-result/TripCustomizationModal';
import ActivityReplacementDrawer from './trip-result/ActivityReplacementDrawer';
import AddActivityModal from './trip-result/AddActivityModal';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// New Modular Views
import StickyTabNav, { TabType } from '@/components/trip/StickyTabNav';
import OverviewView from '@/components/trip/views/OverviewView';
import ItineraryView from '@/components/trip/views/ItineraryView';
import LogisticsView from '@/components/trip/views/LogisticsView';
import EssentialsView from '@/components/trip/views/EssentialsView';
import MapView from '@/components/trip/views/MapView';

import { PassportView } from '@/components/passport/PassportView';
import MiruChatDrawer from '@/components/trip/MiruChatDrawer'; // NEW
import ItinerarySkeleton from './ItinerarySkeleton';

import { confirmActivitySwap, deleteActivity } from '@/actions/ai-swap';
import { updateTripPreferences } from '@/actions/preferences';
import { addActivity } from '@/actions/trip';
import { Loader2, Stamp, Sparkles } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface TripResultProps {
    data: TripResponse;
    isSavedView?: boolean;
}

export default function TripResult({ data, isSavedView = false }: TripResultProps) {
    const { trip, plan, is_saved } = data;
    const [isPending, startTransition] = useTransition();
    const [currentPlan, setCurrentPlan] = React.useState(plan);
    const { userId } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isSaved, setIsSaved] = React.useState(is_saved || isSavedView || (trip.user_id === userId && !!userId));

    // Sync state with props when data changes (e.g. after stream completes or trip switches)
    useEffect(() => {
        setCurrentPlan(data.plan);
        setIsSaved(data.is_saved || isSavedView || (data.trip?.user_id === userId && !!userId));
    }, [data, isSavedView, userId]);

    const [isCustomizeOpen, setIsCustomizeOpen] = React.useState(false);
    const [isReplaceOpen, setIsReplaceOpen] = React.useState(false);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [activeActivity, setActiveActivity] = React.useState<{ day: number, index: number, data: Activity } | null>(null);
    const [addTarget, setAddTarget] = React.useState<{ day: number, index: number } | null>(null);
    const [activeDay, setActiveDay] = React.useState(1);
    const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(null);

    // --- PROGRESSIVE GENERATION (Polling) ---
    const [enrichmentStatus, setEnrichmentStatus] = React.useState(trip.enrichment_status || 'completed');

    useEffect(() => {
        if (enrichmentStatus !== 'enriching') return;

        console.log("🔄 Polling for enrichment updates...");
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8889/api/v1'}/trips/${trip.id}`);
                if (res.ok) {
                    const freshData: TripResponse = await res.json();

                    // Update Status
                    if (freshData.trip.enrichment_status === 'completed') {
                        console.log("✅ Enrichment Complete!");
                        setEnrichmentStatus('completed');
                        setCurrentPlan(freshData.plan); // Update Plan with new details
                        toast.success("Trip Details Enriched!", {
                            description: "Descriptions, logistics, and hidden gems added."
                        });
                        clearInterval(interval);
                    } else {
                        // Optional: Update partial plan if API returns partial updates?
                        // For now, we prefer to update all at once on completion to avoid jank
                    }
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        }, 3000); // Poll every 3s

        return () => clearInterval(interval);
    }, [enrichmentStatus, trip.id]);

    const [isUpdating, startUpdateTransition] = useTransition();
    const [isChatOpen, setIsChatOpen] = React.useState(false); // NEW

    // Initial State from Trip Data
    const [preferences, setPreferences] = React.useState({
        dietary: trip.user_preferences?.dietary || [] as string[],
        interests: trip.user_preferences?.interests || (trip.style ? trip.style.split(',').map(s => s.trim()) : []),
        budgetTier: trip.user_preferences?.budgetTier || 'moderate',
        pace: trip.user_preferences?.pace || 'Balanced'
    });

    // Tab Management
    const initialTab = (searchParams.get('view') as TabType) || 'overview';
    const [activeTab, setActiveTab] = React.useState<TabType>(initialTab);

    // Sync Tab with URL
    useEffect(() => {
        const currentView = searchParams.get('view');
        if (currentView !== activeTab) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('view', activeTab);
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [activeTab, router, searchParams]);

    const handleApplyPreferences = async (newPrefs: any) => {
        // 1. Optimistic Update
        const oldPrefs = preferences;
        setPreferences(newPrefs);

        // 2. Persistent Update
        startUpdateTransition(async () => {
            try {
                if (isSavedView) {
                    await updateTripPreferences(trip.id, newPrefs);
                    toast.success("Preferences saved to trip!");
                } else {
                    toast.success("Preferences updated locally.");
                }
                setIsCustomizeOpen(false);
            } catch (err) {
                console.error(err);
                setPreferences(oldPrefs);
                toast.error("Failed to save preferences to database.");
            }
        });
    };

    const handleReplace = (day: number, index: number) => {
        const dayPlan = currentPlan.itinerary?.find(d => d.day === day);
        const activity = dayPlan?.activities[index];
        if (activity) {
            setActiveActivity({ day, index, data: activity });
            setIsReplaceOpen(true);
        }
    };

    const handleDelete = async (day: number, index: number) => {
        if (!window.confirm("Are you sure you want to remove this activity?")) return;

        // 1. Optimistic Update
        const oldItinerary = currentPlan.itinerary;
        const newItinerary = (currentPlan.itinerary || []).map(d => {
            if (d.day === day) {
                return {
                    ...d,
                    activities: d.activities.filter((_, i) => i !== index)
                };
            }
            return d;
        });

        setCurrentPlan(prev => ({ ...prev, itinerary: newItinerary }));

        // 2. Persistent Update
        startUpdateTransition(async () => {
            try {
                if (isSavedView) {
                    await deleteActivity(trip.id, day, index);
                    toast.success("Activity removed");
                } else {
                    toast.success("Activity removed (Draft only)");
                }
            } catch (err) {
                console.error(err);
                setCurrentPlan(prev => ({ ...prev, itinerary: oldItinerary }));
                toast.error("Failed to delete from database. Reverting...");
            }
        });
    };

    const handleAddBelow = (day: number, index: number) => {
        setAddTarget({ day, index });
        setIsAddOpen(true);
    };

    const handleAddActivity = async (formData: { title: string, time: string, autoEnhance: boolean }) => {
        if (!addTarget) return;

        // 2. Persistent Update (DB)
        startUpdateTransition(async () => {
            try {
                if (isSavedView) {
                    const result = await addActivity(trip.id, addTarget.day, addTarget.index, formData);

                    if (result.success && result.plan) {
                        setCurrentPlan(result.plan);
                    }
                    toast.success(`"${formData.title}" added to journey!`);
                    setIsAddOpen(false); // Only close on success
                } else {
                    // For draft view, we can still do a manual local update for now
                    const newActivity: Activity = {
                        time: formData.time,
                        activity: formData.title,
                        description: "New activity added",
                        place_name: "",
                        type: "Activity",
                        alternatives: []
                    };

                    setCurrentPlan(prev => {
                        const newItinerary = (prev?.itinerary || []).map(d => {
                            if (d.day === addTarget.day) {
                                const newActivities = [...d.activities];
                                newActivities.splice(addTarget.index + 1, 0, newActivity);
                                newActivities.sort((a, b) => a.time.localeCompare(b.time));
                                return { ...d, activities: newActivities };
                            }
                            return d;
                        });
                        return { ...prev, itinerary: newItinerary };
                    });
                    toast.success(`"${formData.title}" added (Local only for draft)`);
                    setIsAddOpen(false);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to add activity. Please try again.");
            } finally {
                setAddTarget(null);
            }
        });
    };

    const handleSelectAlternative = async (alt: ActivityAlternative) => {
        if (!activeActivity) return;

        const newActivity: Activity = {
            ...alt,
            time: activeActivity.data.time, // Persist original time
            alternatives: [] // Reset alternatives for the new activity
        };

        // 1. Optimistic Update (UI)
        const oldItinerary = currentPlan.itinerary;
        const newItinerary = (currentPlan.itinerary || []).map(d => {
            if (d.day === activeActivity.day) {
                const newActivities = [...d.activities];
                newActivities[activeActivity.index] = newActivity;
                return { ...d, activities: newActivities };
            }
            return d;
        });

        setCurrentPlan(prev => ({ ...prev, itinerary: newItinerary }));

        // 2. Clear UI state
        setIsReplaceOpen(false);

        // 3. Persistent Update (DB)
        startUpdateTransition(async () => {
            try {
                if (isSavedView) {
                    await confirmActivitySwap(
                        trip.id,
                        activeActivity.day,
                        activeActivity.index,
                        alt
                    );
                    toast.success(`Switched to ${alt.activity}!`);
                } else {
                    toast.success(`Switched to ${alt.activity}! (Local only for draft)`);
                }
            } catch (err) {
                console.error(err);
                // Rollback if failed
                setCurrentPlan(prev => ({ ...prev, itinerary: oldItinerary }));
                toast.error("Failed to save change to database. Reverting...");
            }
        });
    };

    const handleSaveTrigger = () => {
        const saveBtn = document.getElementById('save-trip-btn');
        if (saveBtn) {
            (saveBtn as HTMLButtonElement).click();
        } else {
            toast.error("Save button not found");
        }
    };

    const handleDayClick = (day: number) => {
        setActiveDay(day);
        const element = document.getElementById(`day-${day}`);
        if (element) {
            const yOffset = -110; // Account for stacked sticky navs (56px section nav + 52px day nav)
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const dayArray = (currentPlan?.itinerary || []).map(d => d.day);

    if (!currentPlan || !currentPlan.itinerary) {
        return <ItinerarySkeleton />;
    }

    const activeDayActivities = React.useMemo(() => {
        return currentPlan.itinerary?.find(d => d.day === activeDay)?.activities || [];
    }, [currentPlan.itinerary, activeDay]);

    const allActivities = React.useMemo(() => {
        return currentPlan.itinerary?.flatMap(d => d.activities) || [];
    }, [currentPlan.itinerary]);

    return (
        <div className="animate-in fade-in duration-700 pb-20 bg-white min-h-screen">
            {/* 0. Scroll-Aware Navbar */}
            <ScrollAwareNavbar
                title={`Trip to ${trip.destination || 'Unknown'}`}
                isSaved={isSaved}
                isSaving={isUpdating}
                isHistoryView={isSavedView}
                onSave={handleSaveTrigger}
            />

            {/* 1. Dashboard Header (Compact version) */}
            <TripHeader
                data={data}
                planState={currentPlan}
                totalBudget={currentPlan.total || 0}
                isHistoryView={isSavedView}
                onOpenCustomize={() => setIsCustomizeOpen(true)}
                onSaveSuccess={() => setIsSaved(true)}
                preferences={preferences}
                compact={activeTab !== 'overview'}
            />

            {/* 2. Sticky Tab Navigation */}
            <StickyTabNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* 3. Dynamic Content Area */}
            <main className="max-w-7xl mx-auto py-8 px-4 md:px-8">

                {/* ENRICHMENT PROGRESS BANNER */}
                {enrichmentStatus === 'enriching' && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between gap-4 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Enriching your trip details...</h4>
                                <p className="text-xs text-blue-700">AI is adding specific descriptions, logistics, and hidden gems.</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-white text-blue-700 shadow-sm">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Processing
                        </Badge>
                    </div>
                )}

                {/* 4. Anonymous Conversion Bridge (Floating) */}
                {!isSaved && !userId && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-1 rounded-2xl shadow-[0_20px_50px_rgba(13,148,136,0.3)]">
                            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[14px] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-teal-500/20 p-2.5 rounded-xl border border-teal-500/30">
                                        <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h4 className="text-white font-bold text-sm">Love this itinerary? ✨</h4>
                                        <p className="text-teal-100/70 text-xs">Sign in now to save it to your history and unlock full edits!</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSaveTrigger}
                                    className="bg-teal-500 hover:bg-teal-400 text-white font-black px-6 rounded-full shadow-lg hover:scale-105 transition-all text-xs border-b-2 border-teal-700"
                                >
                                    Claim This Trip
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <OverviewView
                        trip={trip}
                        plan={currentPlan}
                    />
                )}

                {activeTab === 'itinerary' && (
                    <ItineraryView
                        trip={trip}
                        plan={currentPlan}
                        activeDay={activeDay}
                        onDayChange={handleDayClick}
                        onReplace={handleReplace}
                        onDelete={handleDelete}
                        onAddBelow={handleAddBelow}
                        selectedActivityId={selectedActivityId}
                        onActivitySelect={setSelectedActivityId}
                        isEnriching={enrichmentStatus === 'enriching'}
                    />
                )}

                {activeTab === 'logistics' && (
                    <LogisticsView
                        trip={trip}
                        plan={currentPlan}
                    />
                )}

                {activeTab === 'essentials' && (
                    <EssentialsView
                        trip={trip}
                        plan={currentPlan}
                    />
                )}

                {activeTab === 'passport' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <PassportView />
                    </div>
                )}

                {activeTab === 'map' && (
                    <MapView
                        trip={trip}
                        activities={allActivities}
                        selectedActivityId={selectedActivityId}
                        onActivitySelect={setSelectedActivityId}
                    />
                )}
            </main>

            <TripCustomizationModal
                isOpen={isCustomizeOpen}
                onClose={() => setIsCustomizeOpen(false)}
                currentPreferences={preferences}
                onApply={handleApplyPreferences}
                isSaving={isUpdating}
            />

            <AddActivityModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onAdd={handleAddActivity}
                isSaving={isUpdating}
                tripId={trip.id}
                dayNum={addTarget?.day || 1}
            />

            <ActivityReplacementDrawer
                isOpen={isReplaceOpen}
                onClose={() => setIsReplaceOpen(false)}
                tripId={trip.id}
                day={activeActivity?.day || 0}
                activityIndex={activeActivity?.index || 0}
                originalActivity={activeActivity?.data || null}
                onSelect={handleSelectAlternative}
            />

            {
                isUpdating && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50 animate-in slide-in-from-bottom-4">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-sm font-bold">Saving Changes...</span>
                    </div>
                )
            }

            {/* MIRU CHAT FAB & DRAWER */}
            <div className="fixed bottom-6 right-6 z-40">
                <Button
                    onClick={() => setIsChatOpen(true)}
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-white"
                >
                    <Sparkles className="w-6 h-6 text-white" />
                </Button>
            </div>

            <MiruChatDrawer
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                tripId={trip.id}
                onPlanUpdate={(newPlan) => {
                    setCurrentPlan(newPlan);
                    // Verify if we need to sync active day/tab?. Usually no, just data.
                }}
            />
        </div >
    );
}