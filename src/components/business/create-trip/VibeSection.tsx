import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Armchair, Rocket, User, Users } from 'lucide-react';

interface Props {
    paceVal: number[];
    setPaceVal: (val: number[]) => void;
    socialVal: number[];
    setSocialVal: (val: number[]) => void;
}

export default function VibeSection({ paceVal, setPaceVal, socialVal, setSocialVal }: Props) {
    return (
        <div className="space-y-6 pt-2">
            <Label className="text-base font-semibold text-slate-700">Set the Vibe 🎚️</Label>

            {/* Pace Slider */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-teal-100 transition-colors">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                    <div className="flex items-center gap-2 text-slate-500"><Armchair className="w-4 h-4"/> Chill</div>
                    <div className="flex items-center gap-2 text-slate-500">Active <Rocket className="w-4 h-4"/></div>
                </div>
                <Slider value={paceVal} onValueChange={setPaceVal} max={100} step={10} className="py-2" />
                <div className="text-xs text-center text-slate-400 italic">
                    {paceVal[0] < 30 ? "Relaxing Staycation" : paceVal[0] > 70 ? "Full Exploration" : "Balanced Pace"}
                </div>
            </div>

            {/* Social Slider */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-teal-100 transition-colors">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                    <div className="flex items-center gap-2 text-slate-500"><User className="w-4 h-4"/> Quiet</div>
                    <div className="flex items-center gap-2 text-slate-500">Popular <Users className="w-4 h-4"/></div>
                </div>
                <Slider value={socialVal} onValueChange={setSocialVal} max={100} step={10} className="py-2" />
                <div className="text-xs text-center text-slate-400 italic">
                    {socialVal[0] < 30 ? "Hidden Gems & Peace" : socialVal[0] > 70 ? "Viral Spots & Hype" : "Mix of Both"}
                </div>
            </div>
        </div>
    );
}