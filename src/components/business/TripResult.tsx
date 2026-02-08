'use client';

import React, { useEffect } from 'react';
import { TripResponse } from '@/types';

import TripHeader from './trip-result/TripHeader';
import ItineraryTimeline from './trip-result/ItineraryTimeline';
import HighlightsRow from './trip-result/HighlightsRow';
import DayNavigator from './trip-result/DayNavigator';
import TripCustomizationModal from './trip-result/TripCustomizationModal';
import ActivityReplacementDrawer from './trip-result/ActivityReplacementDrawer';
import { toast } from 'sonner';
import { Activity, ActivityAlternative } from '@/types';

interface TripResultProps {
    data: TripResponse;
    isSavedView?: boolean;
}

// Mock alternatives for the replacement drawer
const MOCK_ALTERNATIVES: ActivityAlternative[] = [
    {
        activity: "Local Ramen Hunting",
        type: "Culinary",
        description: "Find the best hidden miso ramen spots.",
        place_name: "Susukino District"
    },
    {
        activity: "Historical Museum Tour",
        type: "Culture",
        description: "Dive deep into the city's past.",
        place_name: "Hokkaido Museum"
    },
    {
        activity: "Relax at Odori Park",
        type: "Leisure",
        description: "A gentle walk through the green heart of Sapporo.",
        place_name: "Odori Park"
    }
];

export default function TripResult({ data, isSavedView = false }: TripResultProps) {
    const { trip, plan } = data;
    const [currentPlan, setCurrentPlan] = React.useState(plan);
    const [isCustomizeOpen, setIsCustomizeOpen] = React.useState(false);
    const [isReplaceOpen, setIsReplaceOpen] = React.useState(false);
    const [activeActivity, setActiveActivity] = React.useState<{ day: number, index: number, data: Activity } | null>(null);
    const [activeDay, setActiveDay] = React.useState(1);

    // Initial State from Trip Data
    const [preferences, setPreferences] = React.useState({
        dietary: [] as string[],
        styles: trip.style ? trip.style.split(',').map(s => s.trim()) : [],
        budgetTier: (trip.budget_range?.toLowerCase() || 'med') as 'low' | 'med' | 'high'
    });

    const handleApplyPreferences = (newPrefs: any) => {
        setPreferences(newPrefs);
        toast.success("Preferences updated! Recalculating your trip...", {
            description: "Future update: This will trigger a re-generation of the itinerary."
        });
    };

    const handleReplace = (day: number, index: number) => {
        const dayPlan = currentPlan.itinerary.find(d => d.day === day);
        const activity = dayPlan?.activities[index];
        if (activity) {
            setActiveActivity({ day, index, data: activity });
            setIsReplaceOpen(true);
        }
    };

    const handleDelete = (day: number, index: number) => {
        const newItinerary = currentPlan.itinerary.map(d => {
            if (d.day === day) {
                return {
                    ...d,
                    activities: d.activities.filter((_, i) => i !== index)
                };
            }
            return d;
        });

        setCurrentPlan(prev => ({ ...prev, itinerary: newItinerary }));
        toast.info("Activity removed from your itinerary");
    };

    const handleAddBelow = (day: number, index: number) => {
        toast.info("Adding feature...", {
            description: "Activity addition flow will be implemented in the next iteration."
        });
    };

    const handleSelectAlternative = (alt: ActivityAlternative) => {
        if (!activeActivity) return;

        const newActivity: Activity = {
            ...alt,
            time: activeActivity.data.time, // Persist original time
        };

        const newItinerary = currentPlan.itinerary.map(d => {
            if (d.day === activeActivity.day) {
                const newActivities = [...d.activities];
                newActivities[activeActivity.index] = newActivity;
                return { ...d, activities: newActivities };
            }
            return d;
        });

        setCurrentPlan(prev => ({ ...prev, itinerary: newItinerary }));
        toast.success(`Switched to ${alt.activity}!`);
        setIsReplaceOpen(false);
    };

    const handleDayClick = (day: number) => {
        setActiveDay(day);
        const element = document.getElementById(`day-${day}`);
        if (element) {
            const yOffset = -80; // Account for sticky navigator
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const dayArray = currentPlan.itinerary.map(d => d.day);

    return (
        <div className="animate-in fade-in duration-700 pb-20">
            {/* 1. Magazine Style Header */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-20">
                <TripHeader
                    data={data}
                    totalBudget={currentPlan.total}
                    isHistoryView={isSavedView}
                    onOpenCustomize={() => setIsCustomizeOpen(true)}
                />
            </div>

            {/* 2. Highlights Row */}
            <HighlightsRow />

            {/* 3. Sticky Day Navigator */}
            <DayNavigator
                days={dayArray}
                activeDay={activeDay}
                onDayClick={handleDayClick}
            />

            {/* 4. Itinerary Timeline */}
            <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pt-12">
                <ItineraryTimeline
                    plan={currentPlan}
                    onReplace={handleReplace}
                    onDelete={handleDelete}
                    onAddBelow={handleAddBelow}
                />
            </div>

            <TripCustomizationModal
                isOpen={isCustomizeOpen}
                onClose={() => setIsCustomizeOpen(false)}
                currentPreferences={preferences}
                onApply={handleApplyPreferences}
            />

            <ActivityReplacementDrawer
                isOpen={isReplaceOpen}
                onClose={() => setIsReplaceOpen(false)}
                originalActivity={activeActivity?.data || null}
                alternatives={MOCK_ALTERNATIVES}
                onSelect={handleSelectAlternative}
            />
        </div>
    );
}