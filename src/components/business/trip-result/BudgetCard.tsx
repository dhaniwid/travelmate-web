import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { TripResponse } from '@/types';

export default function BudgetCard({ plan, totalBudget, days }: { plan: TripResponse['plan'], totalBudget: number, days: number }) {
    return (
        <Card className="border-none shadow-lg shadow-slate-100/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                    <Wallet className="w-5 h-5 text-emerald-600" /> Budget Estimate
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-dashed border-slate-100">
                    <span className="text-slate-500">Transport</span>
                    <span className="font-semibold text-slate-700">{formatMoney(plan.budget_breakdown?.transport)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed border-slate-100">
                    <span className="text-slate-500">Stay ({days} days)</span>
                    <span className="font-semibold text-slate-700">{formatMoney(plan.budget_breakdown?.accommodation)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed border-slate-100">
                    <span className="text-slate-500">Food & Drink</span>
                    <span className="font-semibold text-slate-700">{formatMoney(plan.budget_breakdown?.food)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed border-slate-100">
                    <span className="text-slate-500">Tickets & Misc</span>
                    <span className="font-semibold text-slate-700">{formatMoney((plan.budget_breakdown?.tickets || 0) + (plan.budget_breakdown?.misc || 0))}</span>
                </div>

                <div className="pt-4 mt-2 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl text-center border border-emerald-100/50">
                    <div className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider mb-1">Total Estimated Cost</div>
                    <div className="text-2xl font-black text-emerald-700">
                        {formatMoney(totalBudget)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}