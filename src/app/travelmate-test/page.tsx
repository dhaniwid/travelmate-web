'use client';

import React, { useState } from 'react';
import ActivityCard from '@/components/business/trip-result/ActivityCard';
import ActivityReplacementDrawer from '@/components/business/trip-result/ActivityReplacementDrawer';
import { Activity, ActivityAlternative } from '@/types';
import { toast } from 'sonner';

const MOCK_ACTIVITIES: Activity[] = [
    {
        time: "09:00",
        activity: "Surfing at Canggu Beach",
        type: "Adventure",
        description: "Catch some early waves at one of Bali's most famous surf spots. Perfect for beginners and intermediate surfers.",
        place_name: "Canggu Beach, Bali"
    },
    {
        time: "12:30",
        activity: "Organic Lunch at Shady Shack",
        type: "Foodie",
        description: "Enjoy a fresh, plant-based meal in a breezy garden setting. Their bowls are legendary.",
        place_name: "The Shady Shack, Canggu"
    },
    {
        time: "16:00",
        activity: "Sunset Yoga Session",
        type: "Relaxation",
        description: "Rejuvenate your body and mind with a guided yoga flow as the sun dips below the horizon.",
        place_name: "The Practice, Canggu"
    }
];

const MOCK_ALTERNATIVES: ActivityAlternative[] = [
    {
        activity: "Beach Horse Riding",
        type: "Adventure",
        description: "Explore the coastline from a different perspective with a gentle horse ride along the black sand.",
        place_name: "Pererenan Beach"
    },
    {
        activity: "Latte Art Workshop",
        type: "Cultural",
        description: "Learn the secrets of the perfect pour from expert baristas in a cozy local cafe.",
        place_name: "BGS Bali, Canggu"
    },
    {
        activity: "Spa & Massage Treatment",
        type: "Relaxation",
        description: "Indulge in a traditional Balinese massage to melt away all your travel stress.",
        place_name: "Spring Spa, Canggu"
    }
];

export default function TravelMateTestPage() {
    const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleReplaceClick = (index: number) => {
        setSelectedIndex(index);
        setIsDrawerOpen(true);
    };

    const handleSelectAlternative = (alt: ActivityAlternative) => {
        if (selectedIndex === null) return;

        const newActivities = [...activities];
        newActivities[selectedIndex] = {
            ...alt,
            time: activities[selectedIndex].time
        };

        setActivities(newActivities);
        setIsDrawerOpen(false);
        toast.success(`Plan updated: ${alt.activity}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 md:px-0">
            <div className="max-w-2xl mx-auto space-y-12">
                <header className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">UI Sandbox</h1>
                    <p className="text-slate-500 font-medium">Testing Enhanced Activity Cards & Inline Actions</p>
                </header>

                <div className="space-y-4">
                    {activities.map((activity, idx) => (
                        <ActivityCard
                            key={idx}
                            activity={activity}
                            onReplace={() => handleReplaceClick(idx)}
                            onDelete={() => toast.error("Delete requested for index " + idx)}
                            onAddBelow={() => toast.info("Add below requested for index " + idx)}
                        />
                    ))}
                </div>

                <footer className="pt-10 border-t border-slate-200 text-center">
                    <p className="text-sm text-slate-400 font-mono">TravelMate Design System v2.0</p>
                </footer>
            </div>

            <ActivityReplacementDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                originalActivity={selectedIndex !== null ? activities[selectedIndex] : null}
                alternatives={MOCK_ALTERNATIVES}
                onSelect={handleSelectAlternative}
            />
        </div>
    );
}
