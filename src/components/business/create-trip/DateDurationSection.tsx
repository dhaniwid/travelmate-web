import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    startDate: string;
    tripDays: number;
    isFlexible: boolean;
    setStartDate: (val: string) => void;
    setTripDays: (val: number) => void;
    setFlexible: (val: boolean) => void;
}

export default function DateDurationSection({
    startDate, tripDays, isFlexible,
    setStartDate, setTripDays, setFlexible
}: Props) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="text-base font-semibold text-slate-700">When?</Label>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 cursor-pointer" onClick={() => setFlexible(!isFlexible)}>
                        I'm flexible
                    </span>
                    <Switch checked={isFlexible} onCheckedChange={setFlexible} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* KOLOM KIRI: DATE PICKER / FLEXIBLE BADGE */}
                {!isFlexible ? (
                    <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-medium ml-1">Start Date</span>
                        <div className="relative">
                            <Input
                                type="date"
                                className="bg-white h-14 border-slate-200 focus:border-teal-500 rounded-xl"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <span className="text-xs text-transparent select-none hidden sm:block">.</span>
                        <div className="flex items-center h-14 px-4 rounded-xl bg-teal-50 text-teal-700 text-sm font-bold border border-teal-100 w-full animate-in fade-in select-none">
                            <CalendarDays className="w-4 h-4 mr-2" /> Anytime soon
                        </div>
                    </div>
                )}

                {/* KOLOM KANAN: DURATION */}
                <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-medium ml-1">Duration (Days)</span>
                    <div className="relative group">
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-teal-400 transition-colors pointer-events-none" />
                        <Input
                            type="number"
                            min={1}
                            max={30}
                            className={cn(
                                "h-14 border-slate-200 focus:border-teal-500 pr-12 font-medium text-slate-700 rounded-xl",
                                "bg-white"
                            )}
                            value={tripDays}
                            onChange={(e) => setTripDays(parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}