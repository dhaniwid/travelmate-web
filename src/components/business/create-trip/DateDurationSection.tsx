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
                <Label className="text-sm font-normal text-white/40">Kapan?</Label>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white/40 cursor-pointer" onClick={() => setFlexible(!isFlexible)}>
                        Saya fleksibel
                    </span>
                    <Switch checked={isFlexible} onCheckedChange={setFlexible} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                {!isFlexible ? (
                    <div className="space-y-1">
                        <span className="text-xs text-white/40 font-medium ml-1">Tanggal mulai</span>
                        <div className="relative">
                            <Input
                                type="date"
                                className="bg-white/10 h-14 border-white/20 text-white focus:border-teal-500 rounded-xl [color-scheme:dark]"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <span className="text-xs text-transparent select-none hidden sm:block">.</span>
                        <div className="flex items-center h-14 px-4 rounded-xl bg-teal-500/15 text-teal-300 text-sm font-bold border border-teal-500/20 w-full animate-in fade-in select-none">
                            <CalendarDays className="w-4 h-4 mr-2" /> Anytime soon
                        </div>
                    </div>
                )}

                {/* Duration pill selector */}
                <div className="space-y-1">
                    <span className="text-xs text-white/40 font-medium ml-1">Durasi (Hari)</span>
                    <div className="flex flex-wrap gap-1.5">
                        {/* Fleksibel pill */}
                        <button
                            type="button"
                            onClick={handleFleksibel}
                            title="AI menentukan durasi optimal"
                            className={cn(
                                'h-10 px-3 rounded-xl text-xs font-bold transition-all border select-none flex items-center gap-1',
                                isDurationFlexible
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                    : 'bg-white/8 text-white/60 border-white/15 hover:border-teal-400 hover:text-teal-400'
                            )}
                        >
                            <Sparkles className="w-3 h-3" />
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
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                            : locked
                                            ? 'bg-white/5 text-white/20 border-white/10 cursor-pointer'
                                            : 'bg-white/8 text-white/60 border-white/15 hover:border-teal-400 hover:text-teal-400'
                                    )}
                                >
                                    {locked ? (
                                        <>
                                            <span>{day}</span>
                                            <Lock className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-white/25" />
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
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                    : isPro
                                    ? 'bg-white/8 text-white/60 border-white/15 hover:border-teal-400 hover:text-teal-400'
                                    : 'bg-white/5 text-white/30 border-white/10 hover:border-amber-400 hover:text-amber-400'
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
                                className="h-9 w-28 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-teal-500 text-sm text-center font-bold"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleCustomConfirm}
                                disabled={!customDaysStr || parseInt(customDaysStr) < CUSTOM_MIN || parseInt(customDaysStr) > CUSTOM_MAX}
                                className="h-9 px-4 rounded-xl bg-teal-600 text-white text-xs font-bold disabled:opacity-40 hover:bg-teal-700 transition-colors"
                            >
                                OK
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCustomInput(false)}
                                className="h-9 px-3 rounded-xl border border-white/15 text-white/40 text-xs font-bold hover:bg-white/8 transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    )}

                    {isDurationFlexible && (
                        <p className="text-xs text-teal-400 font-medium mt-1">
                            ✨ Miru akan menentukan durasi optimal untuk destinasimu
                        </p>
                    )}

                    {!isPro && !isDurationFlexible && (
                        <p className="text-xs text-white/35 mt-1">
                            Hari 4–7 & custom tersedia di <span className="text-amber-400 font-semibold">PRO ✨</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
