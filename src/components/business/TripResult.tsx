'use client';

import React from 'react';
import { TripResponse } from '@/types';

import TripHeader from './trip-result/TripHeader';
import ItineraryTimeline from './trip-result/ItineraryTimeline';
import LogisticsCard from './trip-result/LogisticsCard';
import BudgetCard from './trip-result/BudgetCard';

interface TripResultProps {
    data: TripResponse;
    isSavedView?: boolean; // Default: false (untuk mode preview creation)
}

export default function TripResult({ data, isSavedView = false }: TripResultProps) {
    const { trip, plan } = data;

    // Kalkulasi Total Budget di level Parent agar bisa dipassing ke Header & BudgetCard
    // const totalBudget = (plan.budget_breakdown?.transport || 0) +
    //     (plan.budget_breakdown?.accommodation || 0) +
    //     (plan.budget_breakdown?.food || 0) +
    //     (plan.budget_breakdown?.tickets || 0) +
    //     (plan.budget_breakdown?.misc || 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* 1. Header Section */}
            <TripHeader
                data={data}
                // totalBudget={totalBudget}
                isHistoryView={isSavedView}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* 2. Left Column: Itinerary */}
                <ItineraryTimeline plan={plan} />

                {/* 3. Right Column: Sticky Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                    <LogisticsCard plan={plan} />
                    {/*<BudgetCard plan={plan} totalBudget={totalBudget} days={trip.trip_days} />*/}
                </div>
            </div>
        </div>
    );
}