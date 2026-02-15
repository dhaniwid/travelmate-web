import React, { useState } from 'react';
import { PackingItem } from '@/types/trip';
import { CheckCircle2, Circle, Luggage } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

interface PackingListWidgetProps {
    packingList: PackingItem[];
    className?: string;
}

const PackingListWidget: React.FC<PackingListWidgetProps> = ({ packingList, className }) => {
    // Local state to track checked items
    // Key format: "categoryIndex-itemIndex"
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const toggleItem = (categoryIdx: number, itemIdx: number) => {
        const key = `${categoryIdx}-${itemIdx}`;
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    if (!packingList || packingList.length === 0) {
        return (
            <EmptyState
                icon={Luggage}
                title="Packing list pending"
                description="We'll generate a tailored packing list once your destination and weather data is locked in."
                className="bg-transparent border-none p-0"
            />
        );
    }

    return (
        <div className={cn("bg-slate-50 rounded-xl p-6 border border-slate-100", className)}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Luggage className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Review Packing List</h3>
                    <p className="text-sm text-slate-500">Based on your destination's weather & activities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packingList.map((category, catIdx) => (
                    <div key={catIdx} className="bg-white rounded-lg p-4 shadow-sm border border-slate-100/50">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-50">
                            {category.category}
                        </h4>
                        <ul className="space-y-2">
                            {category.items.map((item, itemIdx) => {
                                const isChecked = checkedItems[`${catIdx}-${itemIdx}`];
                                return (
                                    <li
                                        key={itemIdx}
                                        onClick={() => toggleItem(catIdx, itemIdx)}
                                        className="flex items-start gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-md transition-colors"
                                    >
                                        <div className={cn(
                                            "w-5 h-5 mt-0.5 flex-shrink-0 transition-colors",
                                            isChecked ? "text-emerald-500" : "text-slate-300 group-hover:text-slate-400"
                                        )}>
                                            {isChecked ? <CheckCircle2 className="w-full h-full" /> : <Circle className="w-full h-full" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm transition-all",
                                            isChecked ? "text-slate-400 line-through decoration-slate-300" : "text-slate-600 group-hover:text-slate-800"
                                        )}>
                                            {item}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackingListWidget;
