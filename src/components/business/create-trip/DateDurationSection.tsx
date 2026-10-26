import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CalendarDays, Lock, Sparkles, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    startDate: string;
    tripDays: number;
    isFlexible: boolean;
    isDurationFlexible: boolean;
    isPro: boolean;
    setStartDate: (val: string) => void;
    setTripDays: (val: number) => void;
    setFlexible: (val: boolean) => void;
    setIsDurationFlexible: (val: boolean) => void;
    onUpgradeNeeded?: () => void;
}

const FREE_MAX_DAYS = 3;
const DAY_OPTIONS = [1, 2, 3, 4, 5, 7];
const CUSTOM_MIN = 6;
const CUSTOM_MAX = 30;

export default function DateDurationSection({
    startDate, tripDays, isFlexible, isDurationFlexible, isPro,
    setStartDate, setTripDays, setFlexible, setIsDurationFlexible, onUpgradeNeeded
}: Props) {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customDaysStr, setCustomDaysStr] = useState('');

    const handleDaySelect = (day: number) => {
        if (!isPro && day > FREE_MAX_DAYS) {
            onUpgradeNeeded?.();
            return;
        }
        setIsDurationFlexible(false);
        setShowCustomInput(false);
        setTripDays(day);
    };

    const handleFleksibel = () => {
        setIsDurationFlexible(true);
        setShowCustomInput(false);
    };

    const handleLebih = () => {
        if (!isPro) {
            onUpgradeNeeded?.();
            return;
        }
        setIsDurationFlexible(false);
        setShowCustomInput(true);
        setCustomDaysStr('');
    };

    const handleCustomConfirm = () => {
        const val = parseInt(customDaysStr, 10);
        if (isNaN(val) || val < CUSTOM_MIN || val > CUSTOM_MAX) return;
        setTripDays(val);
        setShowCustomInput(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="text-[13px] font-bold text-zinc-900">Kapan?</Label>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-600 cursor-pointer" onClick={() => setFlexible(!isFlexible)}>
                        Saya fleksibel
                    </span>
                    <Switch checked={isFlexible} onCheckedChange={setFlexible} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                {!isFlexible ? (
                    <div className="space-y-1">
                        <span className="text-xs text-zinc-500 font-medium ml-1">Tanggal mulai</span>
                        <div className="relative">
                            <Input
                                type="date"
                                className="bg-zinc-100 h-12 border-zinc-200 text-zinc-950 font-medium focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-zinc-950 rounded-xl"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <span className="text-xs text-transparent select-none hidden sm:block">.</span>
                        <div className="flex items-center h-12 px-4 rounded-xl bg-teal-50 text-teal-800 text-sm font-bold border border-teal-200 w-full animate-in fade-in select-none">
                            <CalendarDays className="w-4 h-4 mr-2 text-teal-600" /> Anytime soon
                        </div>
                    </div>
                )}

                {/* Duration pill selector */}
                <div className="space-y-1">
                    <span className="text-xs text-zinc-500 font-medium ml-1">Durasi (Hari)</span>
                    <div className="flex flex-wrap gap-1.5">
                        {/* Fleksibel pill */}
                        <button
                            type="button"
                            onClick={handleFleksibel}
                            title="AI menentukan durasi optimal"
                            className={cn(
                                'h-10 px-3 rounded-xl text-xs font-bold transition-all border select-none flex items-center gap-1',
                                isDurationFlexible
                                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                                    : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-950 hover:text-zinc-950'
                            )}
                        >
                            <Sparkles className="w-3 h-3 text-teal-500" />
                            Fleksibel
                        </button>

                        {/* Day pills */}
                        {DAY_OPTIONS.map((day) => {
                            const locked = !isPro && day > FREE_MAX_DAYS;
                            const selected = !isDurationFlexible && !showCustomInput && tripDays === day;
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDaySelect(day)}
                                    title={locked ? 'Tersedia di PRO' : `${day} hari`}
                                    className={cn(
                                        'relative h-10 w-10 rounded-xl text-sm font-bold transition-all border select-none',
                                        selected
                                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                                            : locked
                                            ? 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-pointer'
                                            : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-950 hover:text-zinc-950'
                                    )}
                                >
                                    {locked ? (
                                        <>
                                            <span>{day}</span>
                                            <Lock className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-zinc-400" />
                                        </>
                                    ) : (
                                        day
                                    )}
                                </button>
                            );
                        })}

                        {/* Lebih? pill */}
                        <button
                            type="button"
                            onClick={handleLebih}
                            title={isPro ? 'Custom: 6–30 hari' : 'Upgrade ke PRO untuk trip lebih dari 7 hari'}
                            className={cn(
                                'h-10 px-3 rounded-xl text-xs font-bold transition-all border select-none flex items-center gap-1',
                                showCustomInput
                                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                                    : isPro
                                    ? 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-950 hover:text-zinc-950'
                                    : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-950 hover:text-zinc-950'
                            )}
                        >
                            <Plus className="w-3 h-3" />
                            Lebih?
                            {!isPro && <Lock className="w-2.5 h-2.5 ml-0.5" />}
                        </button>
                    </div>

                    {/* Custom day input for PRO */}
                    {showCustomInput && (
                        <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <Input
                                type="number"
                                min={CUSTOM_MIN}
                                max={CUSTOM_MAX}
                                placeholder={`${CUSTOM_MIN}–${CUSTOM_MAX} hari`}
                                value={customDaysStr}
                                onChange={(e) => setCustomDaysStr(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCustomConfirm()}
                                className="h-9 w-28 rounded-xl bg-zinc-100 border-zinc-200 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-950 text-sm text-center font-bold"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleCustomConfirm}
                                disabled={!customDaysStr || parseInt(customDaysStr) < CUSTOM_MIN || parseInt(customDaysStr) > CUSTOM_MAX}
                                className="h-9 px-4 rounded-xl bg-zinc-950 text-white text-xs font-bold disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                            >
                                OK
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCustomInput(false)}
                                className="h-9 px-3 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-bold hover:bg-zinc-100 transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    )}

                    {isDurationFlexible && (
                        <p className="text-xs text-teal-700 font-semibold mt-1">
                            ✨ Miru akan menentukan durasi optimal untuk destinasimu
                        </p>
                    )}

                    {!isPro && !isDurationFlexible && (
                        <p className="text-xs text-zinc-500 mt-1">
                            Hari 4–7 & custom tersedia di <span className="text-teal-700 font-bold">PRO ✨</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
