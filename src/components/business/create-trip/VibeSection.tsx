import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { User, Users } from 'lucide-react';

interface Props {
    socialVal: number[];
    setSocialVal: (val: number[]) => void;
}

export default function VibeSection({ socialVal, setSocialVal }: Props) {
    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-2">
                <Label className="text-base font-semibold text-slate-700">
                    Trip Vibe 🎚️
                </Label>
                <p className="text-xs text-slate-500">
                    Your travel pace is set in your Travel DNA. Adjust trip-specific preferences here.
                </p>
            </div>

            {/* Social Slider */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-teal-100 transition-colors">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                    <div className="flex items-center gap-2 text-slate-500"><User className="w-4 h-4" /> Hidden Gems</div>
                    <div className="flex items-center gap-2 text-slate-500">Popular Spots <Users className="w-4 h-4" /></div>
                </div>
                <Slider value={socialVal} onValueChange={setSocialVal} max={100} step={10} className="py-2" />
                <div className="text-xs text-center text-slate-400 italic">
                    {socialVal[0] < 30 ? "Off-the-beaten-path & Peaceful" : socialVal[0] > 70 ? "Trending & Social" : "Mix of Both"}
                </div>
            </div>
        </div>
    );
}