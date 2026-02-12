'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, Utensils, Heart, Compass, Wallet, Gauge } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UserPreferences {
    pace: string;
    budget_tier: string;
    dietary: string[];
    interests: string[];
    travel_style: string[];
}

const PACE_OPTIONS = [
    { value: 'RELAXED', label: 'Relaxed', icon: '🍃', desc: 'Take it slow' },
    { value: 'BALANCED', label: 'Balanced', icon: '⚖️', desc: 'Mix of both' },
    { value: 'FAST', label: 'Fast Paced', icon: '⚡', desc: 'See everything' },
];

const BUDGET_OPTIONS = [
    { value: 'BUDGET', label: 'Budget', icon: '💸', desc: 'Cost conscious' },
    { value: 'MID', label: 'Mid-Range', icon: '💰', desc: 'Comfort focus' },
    { value: 'LUXURY', label: 'Luxury', icon: '💎', desc: 'Spare no expense' },
];

const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Halal", "Gluten-Free", "Nut-Free", "Keto", "No Restrictions"];
const INTEREST_OPTIONS = ["History", "Art", "Nature", "Adventure", "Shopping", "Food", "Nightlife", "Relaxation", "Photography"];
const STYLE_OPTIONS = ["Solo", "Couple", "Family", "Friends", "Business", "Backpacking"];

interface TravelDNAEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void; // Trigger refresh on parent
}

export default function TravelDNAEditor({ isOpen, onClose, onUpdate }: TravelDNAEditorProps) {
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [prefs, setPrefs] = useState<UserPreferences>({
        pace: 'BALANCED',
        budget_tier: 'MID',
        dietary: [],
        interests: [],
        travel_style: []
    });

    // Fetch Preferences
    useEffect(() => {
        if (isOpen) {
            fetchPreferences();
        }
    }, [isOpen]);

    const fetchPreferences = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/preferences`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // Ensure arrays are initialized
                setPrefs({
                    pace: data.pace || 'BALANCED',
                    budget_tier: data.budget_tier || 'MID',
                    dietary: data.dietary || [],
                    interests: data.interests || [],
                    travel_style: data.travel_style || []
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your Travel DNA");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(prefs)
            });

            if (res.ok) {
                toast.success("Travel DNA updated successfully!");
                onUpdate();
                onClose();
            } else {
                toast.error("Failed to save changes");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSelection = (field: keyof UserPreferences, value: string) => {
        setPrefs(prev => {
            const current = prev[field] as string[];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-black text-slate-900">
                        <span className="text-3xl">🧬</span> Edit Travel DNA
                    </DialogTitle>
                    <DialogDescription>
                        Set your global preferences. Miru will verify these settings for every trip generation.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    </div>
                ) : (
                    <div className="space-y-8 py-4">
                        {/* PACE */}
                        <section className="space-y-3">
                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Gauge className="w-4 h-4 text-teal-600" /> Prefered Pace
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {PACE_OPTIONS.map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => setPrefs(p => ({ ...p, pace: opt.value }))}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all hover:scale-105",
                                            prefs.pace === opt.value
                                                ? "border-teal-500 bg-teal-50"
                                                : "border-slate-100 hover:border-teal-200"
                                        )}
                                    >
                                        <span className="text-2xl">{opt.icon}</span>
                                        <div className="text-center">
                                            <p className={cn("text-xs font-bold", prefs.pace === opt.value ? "text-teal-700" : "text-slate-600")}>{opt.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* BUDGET */}
                        <section className="space-y-3">
                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-emerald-600" /> Budget Style
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {BUDGET_OPTIONS.map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => setPrefs(p => ({ ...p, budget_tier: opt.value }))}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all hover:scale-105",
                                            prefs.budget_tier === opt.value
                                                ? "border-emerald-500 bg-emerald-50"
                                                : "border-slate-100 hover:border-emerald-200"
                                        )}
                                    >
                                        <span className="text-2xl">{opt.icon}</span>
                                        <div className="text-center">
                                            <p className={cn("text-xs font-bold", prefs.budget_tier === opt.value ? "text-emerald-700" : "text-slate-600")}>{opt.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* DIETARY */}
                        <section className="space-y-3">
                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-orange-600" /> Dietary Restrictions
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DIETARY_OPTIONS.map((opt) => (
                                    <Badge
                                        key={opt}
                                        variant="outline"
                                        onClick={() => toggleSelection('dietary', opt)}
                                        className={cn(
                                            "cursor-pointer py-1.5 px-3 rounded-full transition-all text-xs",
                                            prefs.dietary.includes(opt)
                                                ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
                                        )}
                                    >
                                        {opt}
                                    </Badge>
                                ))}
                            </div>
                        </section>

                        {/* INTERESTS */}
                        <section className="space-y-3">
                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-rose-600" /> Key Interests
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map((opt) => (
                                    <Badge
                                        key={opt}
                                        variant="outline"
                                        onClick={() => toggleSelection('interests', opt)}
                                        className={cn(
                                            "cursor-pointer py-1.5 px-3 rounded-full transition-all text-xs",
                                            prefs.interests.includes(opt)
                                                ? "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-rose-300"
                                        )}
                                    >
                                        {opt}
                                    </Badge>
                                ))}
                            </div>
                        </section>

                        {/* TRAVEL STYLE */}
                        <section className="space-y-3">
                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Compass className="w-4 h-4 text-indigo-600" /> Travel Companions
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {STYLE_OPTIONS.map((opt) => (
                                    <Badge
                                        key={opt}
                                        variant="outline"
                                        onClick={() => toggleSelection('travel_style', opt)}
                                        className={cn(
                                            "cursor-pointer py-1.5 px-3 rounded-full transition-all text-xs",
                                            prefs.travel_style.includes(opt)
                                                ? "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                                        )}
                                    >
                                        {opt}
                                    </Badge>
                                ))}
                            </div>
                        </section>

                    </div>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="bg-teal-600 hover:bg-teal-700 text-white min-w-[120px]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Save DNA
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
