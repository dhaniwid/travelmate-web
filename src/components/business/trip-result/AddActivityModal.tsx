import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Clock, MapPin, Loader2, Plus, Utensils, Camera, ShoppingBag, Leaf, Trophy } from "lucide-react";
import { cn } from '@/lib/utils';
import { tripService } from '@/services/trip';
import { useAuth } from '@clerk/nextjs';

interface AddActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { title: string, time: string, miruMagic: boolean }) => void;
    isSaving?: boolean;
    tripId: string;
    dayNum: number;
    initialTime?: string;
    isPro?: boolean;
}

const CategoryIcon = ({ category }: { category: string }) => {
    const iconClass = "w-3 h-3 group-hover:scale-110 transition-transform";
    switch (category.toLowerCase()) {
        case 'culinary': return <Utensils className={iconClass} />;
        case 'sightseeing': return <Camera className={iconClass} />;
        case 'shopping': return <ShoppingBag className={iconClass} />;
        case 'leisure': return <Leaf className={iconClass} />;
        case 'adventure': return <Trophy className={iconClass} />;
        default: return <Sparkles className={iconClass} />;
    }
};

export default function AddActivityModal({
    isOpen,
    onClose,
    onAdd,
    isSaving = false,
    tripId,
    dayNum,
    initialTime,
    isPro = false
}: AddActivityModalProps) {
    const { getToken } = useAuth();
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("10:00");
    const [autoEnhance, setAutoEnhance] = useState(true);
    const [suggestions, setSuggestions] = useState<{ title: string, category: string }[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle("");
            if (initialTime) {
                setTime(initialTime);
            }
        }
    }, [isOpen, initialTime]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchSuggestions = async () => {
            setIsLoadingSuggestions(true);
            try {
                const token = await getToken();
                // Pass dayNum - 1 to match backend 0-based index
                const results = await tripService.getAddActivitySuggestions(tripId, dayNum - 1, time, token);
                setSuggestions(results || []);
            } catch (err) {
                console.error(err);
                setSuggestions([]);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [isOpen, time, tripId, dayNum]);

    const handleAdd = () => {
        if (!title.trim()) return;
        onAdd({ title, time, miruMagic: autoEnhance });
    };

    const handleSuggestionClick = (suggestedTitle: string) => {
        setTitle(suggestedTitle);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] overflow-hidden border-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-0 bg-white">
                <DialogHeader className="px-10 pt-12 pb-4 text-left">
                    <DialogTitle className="text-[2.2rem] font-black tracking-tight text-slate-900 leading-[1.1]">
                        Add Activity
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mt-2">
                        Insert a new moment into your journey.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-10 pb-8 space-y-6">
                    {/* Activity Title */}
                    <div className="space-y-3">
                        <Label htmlFor="title" className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            Activity Name
                        </Label>
                        <div className="relative">
                            <Input
                                id="title"
                                placeholder="What's the plan?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-[4.2rem] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-lg font-bold pl-6 pr-6 shadow-sm placeholder:text-slate-300"
                            />
                        </div>

                        {/* AI SUGGESTIONS SECTION */}
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex items-center gap-2 mb-3 ml-1">
                                <Sparkles className="w-3 h-3 text-teal-500" />
                                <span className="text-[0.6rem] font-bold text-teal-600 uppercase tracking-widest">Miru's Suggestions for this time</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {isLoadingSuggestions ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3 px-4 py-2 bg-teal-50/50 rounded-2xl border border-teal-100/50"
                                    >
                                        <div className="relative">
                                            <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                                            <div className="absolute inset-0 bg-teal-400/20 blur-lg rounded-full animate-ping" />
                                        </div>
                                        <p className="text-[0.7rem] font-black text-teal-800 uppercase tracking-[0.15em] animate-pulse">
                                            Miru is thinking...
                                        </p>
                                    </motion.div>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map((s, idx) => {
                                        const isLocked = !isPro && idx >= 3;
                                        return (
                                            <button
                                                key={idx}
                                                disabled={isLocked}
                                                onClick={() => handleSuggestionClick(s.title)}
                                                className={cn(
                                                    "group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 transition-all active:scale-95 text-left",
                                                    isLocked ? "opacity-50 blur-[1px] cursor-not-allowed grayscale" : "hover:bg-teal-50 hover:border-teal-200"
                                                )}
                                            >
                                                <CategoryIcon category={s.category} />
                                                <span className={cn(
                                                    "text-xs font-bold text-slate-600 whitespace-nowrap",
                                                    !isLocked && "group-hover:text-teal-700"
                                                )}>
                                                    {s.title}
                                                </span>
                                                {!isLocked && <Plus className="w-3 h-3 text-slate-300 group-hover:text-teal-400" />}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-[0.65rem] text-slate-400 ml-1 italic font-medium">Type a time to see suggestions...</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Time Input */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label htmlFor="time" className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                Scheduled Time
                            </Label>
                            <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="time"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="h-[3.8rem] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-lg font-bold pl-14 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Placeholder for visual balance or extra meta */}
                        <div className="flex flex-col justify-end">
                            <div className="flex items-center justify-between p-4 rounded-3xl bg-teal-50/50 border border-teal-100/50 h-[3.8rem]">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-teal-600" />
                                    <span className="text-[0.7rem] font-black text-teal-700 uppercase tracking-wider">Miru Magic</span>
                                </div>
                                <Switch
                                    checked={autoEnhance}
                                    onCheckedChange={setAutoEnhance}
                                    className="data-[state=checked]:bg-teal-600 scale-90"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-10 pb-12 pt-4 bg-white">
                    <Button
                        onClick={handleAdd}
                        disabled={!title.trim() || isSaving}
                        className="w-full rounded-[1.5rem] bg-[#42707D] hover:bg-[#355963] text-white font-bold h-[4.5rem] shadow-2xl shadow-teal-900/10 transition-all active:scale-[0.98] text-[1.1rem] tracking-wide"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Invoking Miru Magic...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Add to Journey</span>
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
