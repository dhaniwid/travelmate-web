'use client';

import React, { useTransition, useEffect } from 'react';
import { TripResponse, Activity, ActivityAlternative } from '@/types';
import { tripService } from '@/services/trip';
import ScrollAwareNavbar from './trip-result/ScrollAwareNavbar';
import TripHeader from './trip-result/TripHeader';
import TripCustomizationModal from './trip-result/TripCustomizationModal';
import ActivityReplacementDrawer from './trip-result/ActivityReplacementDrawer';
import AddActivityModal from './trip-result/AddActivityModal';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

// New Modular Views
import StickyTabNav, { TabType } from '@/components/trip/StickyTabNav';
import ItineraryView from '@/components/trip/views/ItineraryView';
import LogisticsView from '@/components/trip/views/LogisticsView';
import EssentialsView from '@/components/trip/views/EssentialsView';
import MapView from '@/components/trip/views/MapView';
import MiruChatDrawer from '@/components/trip/MiruChatDrawer'; // NEW
import CollapsibleOverview from '@/components/business/trip-result/CollapsibleOverview';
import ItinerarySkeleton from './ItinerarySkeleton';
import ItineraryLoadingState from './ItineraryLoadingState';
import ShareModal from '@/components/business/trip/ShareModal';
import UpgradeModal from '@/components/ui/UpgradeModal';

import { updateTripPreferences } from '@/actions/preferences';
import { useSubscription } from '@/hooks/useSubscription';

interface TripResultProps {
    data: TripResponse;
    isSavedView?: boolean;
}

export default function TripResult({ data, isSavedView = false }: TripResultProps) {
    const { trip, plan, is_saved } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tripAny = trip as any;
    const [isPending, startTransition] = useTransition();
    const [currentPlan, setCurrentPlan] = React.useState(plan);
    const [currentTrip, setCurrentTrip] = React.useState(trip);
    const { userId, getToken } = useAuth();
    const { subscription } = useSubscription();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isSaved, setIsSaved] = React.useState(is_saved || isSavedView || (trip.user_id === userId && !!userId));

    // Sync state with props when data changes (e.g. after stream completes or trip switches)
    useEffect(() => {
        setCurrentPlan(data.plan);
        setCurrentTrip(data.trip);
        setIsSaved(data.is_saved || isSavedView || (data.trip?.user_id === userId && !!userId));
    }, [data, isSavedView, userId]);

    // Determine Role
    const isOwner = currentTrip.user_id === userId;
    const collaborator = (currentTrip as any).collaborators?.find((c: any) => c.user_id === userId);
    const currentUserRole = isOwner ? 'owner' : (collaborator?.role || (userId ? 'viewer' : 'guest'));

    const [isCustomizeOpen, setIsCustomizeOpen] = React.useState(false);
    const [isShareOpen, setIsShareOpen] = React.useState(false); // NEW
    const [isReplaceOpen, setIsReplaceOpen] = React.useState(false);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);
    const [upgradeContent, setUpgradeContent] = React.useState({ title: "", message: "" });
    const [activeActivity, setActiveActivity] = React.useState<{ day: number, index: number, data: Activity } | null>(null);
    const [addTarget, setAddTarget] = React.useState<{ day: number, index: number, initialTime?: string } | null>(null);
    const [activeDay, setActiveDay] = React.useState(1);
    const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(null);

    // --- PROGRESSIVE GENERATION (Polling) ---
    // Track start time for persistent progress bar across tab switches
    const [generationStartTime] = React.useState(() => Date.now());

    // Default to 'generating' if no status provided AND no activities exist yet
    const hasActivities = plan?.itinerary && plan.itinerary.some(d => d.activities && d.activities.length > 0);
    const initialStatus = hasActivities ? 'completed' : 'generating';

    const [itineraryStatus, setItineraryStatus] = React.useState(trip.itinerary_status || initialStatus);
    const [enrichmentStatus, setEnrichmentStatus] = React.useState(trip.enrichment_status || initialStatus);

    useEffect(() => {
        const isComplete = itineraryStatus === 'completed' && enrichmentStatus === 'completed';
        if (isComplete) return;

        // Poll more frequently during active generation
        // Poll more frequently during active generation (reduced from 3000ms for snappier UI)
        const pollInterval = 2000;

        console.log("🔄 Polling active...", { itinerary: itineraryStatus, enrichment: enrichmentStatus });
        console.log("Trip Data:", trip);

        const interval = setInterval(async () => {
            try {
                const token = await getToken();
                // Use tripService to avoid duplicate /api/v1 issues
                const freshData = await tripService.getTripById(trip.id, token);
                if (freshData) {
                    const freshTrip = freshData.trip;

                    // ALWAYS update plan if we get fresh data during generation/enrichment
                    // This allows "streaming" partial results to the UI
                    if (freshData.plan) {
                        setCurrentPlan(freshData.plan);
                    }

                    // 1. Update Trip State (Crucial for status checks)
                    setCurrentTrip(freshTrip);

                    // 2. Update Status states for local banners
                    if (freshTrip.itinerary_status !== itineraryStatus) {
                        setItineraryStatus(freshTrip.itinerary_status || 'completed');
                        if (freshTrip.itinerary_status === 'completed') {
                            toast.success("Itinerary Generated!", { description: "Your daily schedule is ready." });
                        }
                    }

                    if (freshTrip.enrichment_status !== enrichmentStatus) {
                        setEnrichmentStatus(freshTrip.enrichment_status || 'completed');
                        if (freshTrip.enrichment_status === 'completed') {
                            toast.success("Enrichment Complete!", { description: "Details and hidden gems added." });
                        }
                    }

                    // Stop polling ONLY if itinerary is done AND we have data
                    // We don't wait for enrichment anymore because it's lazy-loaded on-demand (M-126)
                    if (freshTrip.itinerary_status === 'completed') {
                        const hasActivities = freshData.plan?.itinerary &&
                            freshData.plan.itinerary.some(d => d.activities && d.activities.length > 0);

                        if (hasActivities) {
                            clearInterval(interval);
                        } else {
                            console.log("⏳ Itinerary status says completed, but no activities found. Polling one last time...");
                        }
                    }
                }
            } catch (e: any) {
                console.error("Polling error:", e);
                // 🛡️ STOP THE SPAM: If we get a Forbidden (403), skip retries
                if (e.response?.status === 403) {
                    console.error("⛔ ACCESS DENIED: Stopping polling.");
                    clearInterval(interval);
                    toast.error("Access Denied", {
                        description: "You do not have permission to view or sync this trip."
                    });
                }
            }
        }, pollInterval);

        return () => clearInterval(interval);
    }, [itineraryStatus, enrichmentStatus, trip.id]);

    const [isUpdating, startUpdateTransition] = useTransition();
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const [isOverviewExpanded, setIsOverviewExpanded] = React.useState(false);

    // Initial State from Trip Data
    const [preferences, setPreferences] = React.useState({
        dietary: tripAny.user_preferences?.dietary || [] as string[],
        interests: tripAny.user_preferences?.interests || (trip.style ? trip.style.split(',').map((s: string) => s.trim()) : []),
        budgetTier: tripAny.user_preferences?.budgetTier || 'moderate',
        pace: tripAny.user_preferences?.pace || 'Balanced'
    });

    // Tab Management — map legacy tab values to new 3-tab structure
    const rawTab = searchParams.get('view') || searchParams.get('tab');
    const resolveTab = (t: string | null): TabType => {
        if (t === 'map') return 'map';
        if (t === 'logistics' || t === 'flights' || t === 'essentials') return 'logistics';
        return 'itinerary'; // default + handles 'overview', 'sumi', null
    };
    const [activeTab, setActiveTab] = React.useState<TabType>(resolveTab(rawTab));

    // Sync Tab with URL
    useEffect(() => {
        const currentView = searchParams.get('view');
        if (currentView !== activeTab) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('view', activeTab);
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [activeTab, router, searchParams]);

    // --- AUTO-EXPAND FIRST ACTIVITY ON DAY CHANGE (Fixed Guard Clauses) ---
    useEffect(() => {
        // Guard: Ensure plan exists
        if (!currentPlan?.itinerary) return;

        const dayPlan = currentPlan.itinerary.find(d => d.day === activeDay);

        // Guard: Ensure day has activities
        if (dayPlan?.activities && dayPlan.activities.length > 0) {
            const firstActivity = dayPlan.activities[0];
            // Guard: Ensure activity has an ID
            // TS Fix: Cast to any as Activity type might not have 'id' in frontend definition yet
            const activityId = (firstActivity as any).id;

            if (activityId) {
                setSelectedActivityId(activityId);
            } else {
                // Fallback if ID invalid
                setSelectedActivityId(`${activeDay}-0`);
            }
        }
    }, [activeDay, currentPlan?.itinerary]);

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
        const aiEditsUsed = (currentTrip as any).ai_edits_used || 0;
        const isPro = subscription?.subscription_tier === 'PRO';

        if (!isPro && aiEditsUsed >= 3) {
            setUpgradeContent({
                title: "Quota Reached! ✨",
                message: "You've used all free AI edits. Upgrade to swap unlimited activities instantly!"
            });
            setIsUpgradeOpen(true);
            toast.error("You've used all free AI edits. Upgrade for unlimited swaps.");
            return;
        }

        const dayPlan = currentPlan.itinerary.find(d => d.day === day);
        if (dayPlan && dayPlan.activities[index]) {
            setActiveActivity({ day, index, data: dayPlan.activities[index] });
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
                    const token = await getToken();
                    // M-128: Shift from Next.js Server Action to Go Backend
                    const result = await tripService.deleteActivity(
                        trip.id,
                        day - 1, // Go uses 0-based index
                        index,
                        token
                    );

                    if (result.data) {
                        setCurrentPlan(result.data);
                    }
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

    const handleAddBelow = (day: number, index: number, time: string) => {
        setAddTarget({ day, index, initialTime: time });
        setIsAddOpen(true);
    };

    const handleAddActivity = async (formData: { title: string, time: string, miruMagic: boolean }) => {
        if (!addTarget) return;

        // 2. Persistent Update (DB)
        startUpdateTransition(async () => {
            try {
                if (isSavedView) {
                    const token = await getToken();
                    // M-128: Shift from Next.js Server Action to Go Backend
                    const result = await tripService.addActivity(
                        trip.id,
                        addTarget.day - 1, // Go uses 0-based index
                        formData.title,
                        formData.time,
                        formData.miruMagic,
                        token
                    );

                    if (result.data) {
                        setCurrentPlan(result.data);
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
                            if (d.day === addTarget!.day) {
                                const newActivities = [...d.activities];
                                newActivities.splice(addTarget!.index + 1, 0, newActivity);
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
                    const token = await getToken();
                    // M-128: Shift from Next.js Server Action to Go Backend
                    await tripService.swapActivity(
                        trip.id,
                        activeActivity.day - 1, // Go uses 0-based
                        activeActivity.index,
                        alt,
                        token
                    );

                    toast.success(`Switched to ${alt.activity}!`);

                    // Quota Notification for FREE users
                    const isPro = subscription?.subscription_tier === 'PRO';
                    const nextQuota = ((currentTrip as any).ai_edits_used || 0) + 1;
                    if (!isPro) {
                        if (nextQuota < 3) {
                            toast.info(`${3 - nextQuota} Free AI Edits left`, { icon: '✨' });
                        } else if (nextQuota === 3) {
                            toast.success("Last free AI edit used! Upgrade for unlimited swaps.", { icon: '✨' });
                        }
                    }

                    // Update local trip state to reflect new quota
                    setCurrentTrip(prev => ({ ...prev, ai_edits_used: nextQuota }));
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

    const activeDayActivities = React.useMemo(() => {
        return currentPlan?.itinerary?.find(d => d.day === activeDay)?.activities || [];
    }, [currentPlan?.itinerary, activeDay]);

    const allActivities = React.useMemo(() => {
        return currentPlan?.itinerary?.flatMap(d => d.activities) || [];
    }, [currentPlan?.itinerary]);

    if (!currentPlan || !currentPlan.itinerary) {
        return <ItineraryLoadingState startTime={generationStartTime} />;
    }

    return (
        <div id="trip-content" className="animate-in fade-in duration-700 pb-20 bg-[#060F1E] min-h-screen">
            {/* 0. Scroll-Aware Navbar */}
            <ScrollAwareNavbar
                title={`Trip to ${trip.destination || 'Unknown'}`}
                isSaved={isSaved}
                isSaving={isUpdating}
                isHistoryView={isSavedView}
                onSave={handleSaveTrigger}
                onShare={() => setIsShareOpen(true)}
            />

            {/* 1. Hero Header — compact dark */}
            <TripHeader
                data={data}
                planState={currentPlan}
                totalBudget={(currentPlan as any).total || 0}
                isHistoryView={isSavedView}
                onSaveSuccess={() => setIsSaved(true)}
                onShare={() => setIsShareOpen(true)}
                preferences={preferences}
                compact={true}
            />

            {/* 1b. Collapsible Overview — between header and tab bar */}
            <CollapsibleOverview
                trip={currentTrip}
                plan={currentPlan}
                isExpanded={isOverviewExpanded}
                onToggle={() => setIsOverviewExpanded(prev => !prev)}
                isPro={subscription?.subscription_tier === 'PRO'}
                onUpgrade={() => setIsUpgradeOpen(true)}
            />

            {/* 2. Sticky Tab Navigation */}
            <StickyTabNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* 3. Dynamic Content Area */}
            <main className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 pt-4 pb-8">

                {/* ENRICHMENT PROGRESS BANNER - Only show if it's REALLY enriching in background (e.g. legacy or pro) */}
                {itineraryStatus === 'completed' && enrichmentStatus === 'enriching' && (
                    <div className="mb-6 bg-gradient-to-r from-teal-950/40 to-blue-950/40 border border-white/8 p-4 rounded-xl flex items-center justify-between gap-4 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/8 p-2 rounded-full">
                                <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Melengkapi detail tripmu...</h4>
                                <p className="text-xs text-white/60">Miru sedang menambahkan deskripsi, logistik, dan hidden gems.</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-white/8 text-teal-400 border-0">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Proses
                        </Badge>
                    </div>
                )}

                {/* 4. Anonymous Conversion Bridge (Floating) */}
                {!isSaved && !userId && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-1 rounded-2xl shadow-[0_20px_50px_rgba(13,148,136,0.3)]">
                            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[14px] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-rose-500/20 p-2.5 rounded-xl border border-rose-500/30">
                                        <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h4 className="text-white font-bold text-sm">⚠️ This trip is temporary and will be lost.</h4>
                                        <p className="text-teal-100/70 text-xs">Save this trip to your profile now to unlock full editing and access later.</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        localStorage.setItem('pending_claim_trip_id', trip.id);
                                        router.push('/sign-up');
                                    }}
                                    className="bg-teal-500 hover:bg-teal-400 text-white font-black px-6 rounded-full shadow-lg hover:scale-105 transition-all text-xs border-b-2 border-teal-700 whitespace-nowrap"
                                >
                                    Save to Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full"
                    >
                        {activeTab === 'itinerary' && (
                            <div className="space-y-6">
                                <ItineraryView
                                    trip={currentTrip}
                                    plan={currentPlan}
                                    activeDay={activeDay}
                                    onDayChange={handleDayClick}
                                    onReplace={handleReplace}
                                    onDelete={handleDelete}
                                    onAddBelow={handleAddBelow}
                                    selectedActivityId={selectedActivityId}
                                    onActivitySelect={setSelectedActivityId}
                                    isEnriching={enrichmentStatus === 'enriching'}
                                    startTime={generationStartTime}
                                    onUpgrade={() => setIsUpgradeOpen(true)}
                                />
                            </div>
                        )}

                        {activeTab === 'map' && (
                            <MapView
                                trip={currentTrip}
                                itinerary={currentPlan.itinerary}
                                selectedActivityId={selectedActivityId}
                                onActivitySelect={setSelectedActivityId}
                            />
                        )}

                        {activeTab === 'logistics' && (
                            <LogisticsView
                                trip={currentTrip}
                                plan={currentPlan}
                                isPro={subscription?.subscription_tier === 'PRO'}
                                onUpgrade={() => setIsUpgradeOpen(true)}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            <TripCustomizationModal
                isOpen={isCustomizeOpen}
                onClose={() => setIsCustomizeOpen(false)}
                currentPreferences={preferences}
                onApply={handleApplyPreferences}
                isSaving={isUpdating}
            />

            <UpgradeModal
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
                title={upgradeContent.title}
                message={upgradeContent.message}
            />

            <AddActivityModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onAdd={handleAddActivity}
                tripId={trip.id}
                dayNum={addTarget?.day || 1}
                initialTime={addTarget?.initialTime}
                isPro={subscription?.subscription_tier === 'PRO'}
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

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                tripId={trip.id}
                currentUserRole={currentUserRole}
                currentUserId={userId || undefined}
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
                {/* Mobile: icon only */}
                <Button
                    onClick={() => setIsChatOpen(true)}
                    className="md:hidden h-14 w-14 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-white"
                >
                    <Sparkles className="w-6 h-6 text-white" />
                </Button>
                {/* Desktop: extended with label */}
                <Button
                    onClick={() => setIsChatOpen(true)}
                    className="hidden md:flex items-center gap-2 h-12 px-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-xl hover:scale-105 transition-transform border-2 border-white font-bold text-white text-sm"
                >
                    <Sparkles className="w-4 h-4" />
                    Tanya Miru
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