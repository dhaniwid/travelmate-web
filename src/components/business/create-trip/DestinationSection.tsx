import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    destination: string;
    isAuto: boolean;
    setDestination: (val: string) => void;
    setAuto: (val: boolean) => void;
}

const POPULAR_DESTINATIONS = ["Bali", "Tokyo", "Labuan Bajo", "Seoul", "Paris"];

export default function DestinationSection({ destination, isAuto, setDestination, setAuto }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="text-base font-semibold text-slate-700">Where to?</Label>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 cursor-pointer" onClick={() => setAuto(!isAuto)}>
                        Surprise me
                    </span>
                    <Switch checked={isAuto} onCheckedChange={setAuto} />
                </div>
            </div>

            <div className="relative group">
                <MapPin className={cn(
                    "absolute left-3 top-3.5 h-5 w-5 transition-colors",
                    isAuto ? "text-slate-300" : "text-slate-500 group-hover:text-teal-500"
                )} />
                <Input
                    value={isAuto ? '' : destination}
                    onChange={(e) => setDestination(e.target.value)}
                    disabled={isAuto}
                    placeholder={isAuto ? "✨ Picking a hidden gem for you..." : "e.g. Bali, Japan, Labuan Bajo"}
                    className={cn(
                        "pl-10 h-12 text-lg transition-all border-slate-200",
                        isAuto
                            ? "bg-slate-50 italic text-slate-400 border-dashed"
                            : "bg-white focus:ring-teal-500 hover:border-teal-300"
                    )}
                />
            </div>

            {!isAuto && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                    {POPULAR_DESTINATIONS.map((dest) => (
                        <Badge
                            key={dest}
                            variant="secondary"
                            className="cursor-pointer hover:bg-teal-100 hover:text-teal-700 transition-colors px-3 py-1 bg-slate-100 text-slate-600"
                            onClick={() => setDestination(dest)}
                        >
                            {dest}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}