'use client';

import React, { useEffect } from 'react';
import { TripResponse } from '@/types';

import TripHeader from './trip-result/TripHeader';
import ItineraryTimeline from './trip-result/ItineraryTimeline';
import LogisticsCard from './trip-result/LogisticsCard';
import BudgetCard from './trip-result/BudgetCard';

interface TripResultProps {
    data: TripResponse;
    isSavedView?: boolean; // Default: false (untuk mode preview creation)
}

export default function TripResult({ data, isSavedView = false }: TripResultProps) {    const { trip, plan } = data;

    return (
        <div
            className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* 1. Header Section */}
            <TripHeader
                data={data}
                // totalBudget={totalBudget}
                isHistoryView={isSavedView}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* 2. Left Column: Itinerary */}
                <ItineraryTimeline plan={plan}/>

                {/* 3. Right Column: Sticky Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                    <LogisticsCard plan={plan}/>
                    {/*<BudgetCard plan={plan} totalBudget={totalBudget} days={trip.trip_days} />*/}
                </div>
            </div>
        </div>
    );
}