'use client';

import React from 'react';
import { TripPlan } from '@/types';

interface TripStatsGridProps {
    plan: TripPlan;
    destination: string;
}

function formatBudget(breakdown: TripPlan['budget_breakdown']): string {
    if (!breakdown) return '—';
    const total =
        (breakdown.transport || 0) +
        (breakdown.accommodation || 0) +
        (breakdown.food || 0) +
        (breakdown.tickets || 0) +
        (breakdown.misc || 0);
    if (total === 0) return '—';
    const juta = total / 1_000_000;
    if (juta >= 1) return `Rp ${juta % 1 === 0 ? juta.toFixed(0) : juta.toFixed(1)} jt`;
    const ribu = total / 1_000;
    return `Rp ${ribu.toFixed(0)} rb`;
}

export default function TripStatsGrid({ plan, destination }: TripStatsGridProps) {
    const totalActivities = (plan.itinerary || []).reduce(
        (sum, day) => sum + (day.activities?.length || 0),
        0
    );

    const budgetDisplay = formatBudget(plan.budget_breakdown);
    const cuacaDisplay = plan.arrival_guide?.best_time_visit || '—';

    const stats = [
        { label: 'Aktivitas', value: totalActivities > 0 ? String(totalActivities) : '—' },
        { label: 'Estimasi', value: budgetDisplay },
        { label: 'Cuaca', value: cuacaDisplay },
    ];

    return (
        <div className="grid grid-cols-3 gap-2 px-4 md:px-8 py-3">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-[#0A1628] rounded-xl border border-white/8 p-3 flex flex-col gap-1"
                >
                    <span className="text-[10px] uppercase tracking-wider text-white/40">
                        {stat.label}
                    </span>
                    <span
                        className="text-[12px] font-semibold text-white leading-snug line-clamp-2"
                        title={stat.value}
                    >
                        {stat.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
