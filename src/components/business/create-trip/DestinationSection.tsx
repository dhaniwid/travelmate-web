import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Navigation, LocateFixed, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DestinationSectionProps {
    origin: string;
    setOrigin: (val: string) => void;
    destination: string;
    setDestination: (val: string) => void;
    isAuto: boolean;
    setAuto: (val: boolean) => void;
}

const POPULAR_DESTINATIONS = [
    "Bali, Indonesia", "Tokyo, Japan", "Paris, France", "London, UK", "New York, USA",
    "Bangkok, Thailand", "Singapore", "Seoul, South Korea", "Dubai, UAE", "Istanbul, Turkey",
    "Rome, Italy", "Barcelona, Spain", "Amsterdam, Netherlands", "Kyoto, Japan", "Osaka, Japan",
    "Phuket, Thailand", "Hanoi, Vietnam", "Sydney, Australia", "Melbourne, Australia", "Zurich, Switzerland"
];

export default function DestinationSection({
    origin,
    setOrigin,
    destination,
    setDestination,
    isAuto,
    setAuto
}: DestinationSectionProps) {
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    // Filter suggestions based on input
    const handleDestinationChange = (val: string) => {
        setDestination(val);
        if (val.length > 1) {
            const filtered = POPULAR_DESTINATIONS.filter(d =>
                d.toLowerCase().includes(val.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    // Simulasi ambil lokasi (Nanti bisa diganti dengan navigator.geolocation)
    const handleCurrentLocation = () => {
        toast.info("Locating...", { duration: 1000 });
        setTimeout(() => {
            setOrigin("Bandung, Indonesia"); // Contoh simulasi
            toast.success("Location found: Bandung");
        }, 800);
    };

    return (
        <div className="space-y-6">

            {/* Header Section */}
            <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-slate-700">Route & Destination</Label>

                {/* Toggle Surprise Me */}
                <div className="flex items-center space-x-2">
                    <Switch
                        id="auto-dest"
                        checked={isAuto}
                        onCheckedChange={(checked) => {
                            setAuto(checked);
                            if (checked) setDestination('');
                        }}
                    />
                    <Label htmlFor="auto-dest"
                        className="cursor-pointer text-sm font-medium text-slate-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-orange-500" />
                        Surprise Me
                    </Label>
                </div>
            </div>

            {/* Visual Route Container */}
            <div className="relative pl-4 border-l-2 border-dashed border-slate-200 ml-2 space-y-6">

                {/* 1. ORIGIN INPUT */}
                <div className="relative">
                    {/* Visual Dot */}
                    <div
                        className="absolute -left-[25px] top-3 w-4 h-4 rounded-full bg-blue-100 border-4 border-blue-600 shadow-sm" />

                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Starting Point (Origin)
                    </Label>
                    <div className="relative group">
                        <div
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <Navigation className="w-4 h-4" />
                        </div>
                        <Input
                            placeholder="City (e.g. Jakarta)"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            className="pl-10 pr-10 py-6 text-base bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                        />
                        {/* Locate Button */}
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={handleCurrentLocation}
                            className="absolute right-1 top-1/2 -translate-y-1/2 hover:text-blue-600 hover:bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center"
                            title="Use Current Location"
                        >
                            <LocateFixed className="w-5 h-5 text-slate-400" />
                        </Button>
                    </div>
                </div>

                {/* 2. DESTINATION INPUT */}
                <div className="relative">
                    {/* Visual Dot */}
                    <div
                        className="absolute -left-[25px] top-3 w-4 h-4 rounded-full bg-teal-100 border-4 border-teal-500 shadow-sm" />

                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Destination
                    </Label>

                    {/* Tampilan Input Manual dengan Autocomplete & Adaptive Surprise Mode */}
                    <div className="relative group">
                        <div
                            className={cn(
                                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors z-10",
                                isAuto ? "text-purple-500" : "group-focus-within:text-teal-500 text-slate-400"
                            )}>
                            <MapPin className={cn("w-4 h-4", isAuto && "animate-pulse")} />
                        </div>
                        <Input
                            placeholder={isAuto ? "✨ We'll pick a magical spot for you!" : "City (e.g. Tokyo, Bali)"}
                            value={isAuto ? "" : destination}
                            disabled={isAuto}
                            readOnly={isAuto}
                            onChange={(e) => handleDestinationChange(e.target.value)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className={cn(
                                "pl-10 py-6 text-base transition-all rounded-xl shadow-sm",
                                isAuto
                                    ? "bg-purple-50/50 border-purple-200 text-purple-700 italic cursor-not-allowed animate-in fade-in ring-2 ring-purple-100/50"
                                    : "bg-slate-50 border-slate-200 focus:bg-white focus:ring-teal-500"
                            )}
                        />
                        {/* Suggestions Dropdown */}
                        {!isAuto && showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                                {suggestions.map((dest) => (
                                    <div
                                        key={dest}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevents focus loss before selection
                                            setDestination(dest);
                                            setShowSuggestions(false);
                                        }}
                                        className="px-4 py-3 hover:bg-teal-50 cursor-pointer text-sm text-slate-700 flex items-center gap-2"
                                    >
                                        <MapPin className="w-3 h-3 text-teal-400" />
                                        {dest}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}