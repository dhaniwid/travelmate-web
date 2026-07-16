'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Navigation, LocateFixed, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getAllDestinationSlugs, getDestination } from '@/data/destinations';

interface DestinationSectionProps {
    origin: string;
    setOrigin: (val: string) => void;
    savedOrigin?: string;
    destination: string;
    setDestination: (val: string) => void;
    isAuto: boolean;
    setAuto: (val: boolean) => void;
}

export default function DestinationSection({
    origin,
    setOrigin,
    savedOrigin = '',
    destination,
    setDestination,
    isAuto,
    setAuto
}: DestinationSectionProps) {
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [showOrigin, setShowOrigin] = React.useState(!!origin);

    const allSlugs = getAllDestinationSlugs();

    const handleDestinationChange = (val: string) => {
        setDestination(val);
        if (val.length > 1) {
            const filtered = allSlugs.filter(slug => {
                const dest = getDestination(slug);
                return dest?.name.toLowerCase().includes(val.toLowerCase());
            });
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation tidak didukung browser ini");
            return;
        }
        toast.info("Mencari lokasi...", { duration: 1000 });
        navigator.geolocation.getCurrentPosition(
            () => {
                setOrigin("Lokasi Saya");
                toast.success("Lokasi berhasil dideteksi");
            },
            () => {
                setOrigin("Jakarta");
                toast.info("Tidak bisa akses GPS, menggunakan Jakarta");
            }
        );
    };

    return (
        <div className="space-y-4">

            {/* Surprise Me toggle */}
            <div className="flex items-center justify-end space-x-2">
                <Switch
                    id="auto-dest"
                    checked={isAuto}
                    onCheckedChange={(checked) => {
                        setAuto(checked);
                        if (checked) setDestination('');
                    }}
                />
                <Label htmlFor="auto-dest" className="cursor-pointer text-sm font-medium text-white/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    Acak Destinasi
                </Label>
            </div>

            {/* Destination Input */}
            <div className="relative group">
                <div className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 transition-colors z-10",
                    isAuto ? "text-purple-400" : "text-white/40 group-focus-within:text-teal-400"
                )}>
                    <MapPin className={cn("w-4 h-4", isAuto && "animate-pulse")} />
                </div>
                <Input
                    placeholder={isAuto ? "✨ Kami pilihkan destinasi untukmu!" : "Mau ke mana? (e.g. Bali, Semarang)"}
                    value={isAuto ? "" : destination}
                    disabled={isAuto}
                    readOnly={isAuto}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className={cn(
                        "pl-10 py-6 text-base text-white transition-all rounded-xl placeholder:text-white/35",
                        isAuto
                            ? "bg-purple-500/15 border-purple-400/30 text-purple-300 italic cursor-not-allowed"
                            : "bg-white/10 border-white/20 focus:bg-white/15 focus:border-teal-500"
                    )}
                />
                {/* Autocomplete dropdown */}
                {!isAuto && showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-[#0D2040] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                        {suggestions.map((slug) => {
                            const dest = getDestination(slug);
                            if (!dest) return null;
                            return (
                                <div
                                    key={slug}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setDestination(dest.name);
                                        setShowSuggestions(false);
                                    }}
                                    className="px-4 py-3 hover:bg-white/8 cursor-pointer flex items-center gap-2"
                                >
                                    <MapPin className="w-3 h-3 text-teal-400 flex-shrink-0" />
                                    <div>
                                        <span className="text-sm font-semibold text-white">{dest.name}</span>
                                        <span className="text-xs text-white/40 ml-2 italic">{dest.tagline}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Origin — progressive/optional */}
            <div>
                {!showOrigin ? (
                    <button
                        type="button"
                        onClick={() => { setShowOrigin(true); if (savedOrigin && !origin) setOrigin(savedOrigin); }}
                        className="flex items-center gap-1.5 text-xs text-white/35 hover:text-teal-400 transition-colors"
                    >
                        <Navigation className="w-3 h-3" />
                        Tambah kota asal
                        <span className="text-white/20">(opsional — untuk saran transport)</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                ) : (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Label className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-1">
                            Berangkat dari
                            <span className="text-white/25 font-normal normal-case tracking-normal">(opsional)</span>
                        </Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-teal-400 transition-colors">
                                <Navigation className="w-4 h-4" />
                            </div>
                            <Input
                                placeholder="Kota asal (e.g. Jakarta)"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="pl-10 pr-10 py-5 text-sm text-white bg-white/10 border-white/20 placeholder:text-white/35 focus:bg-white/15 focus:border-teal-500 transition-all rounded-xl"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={handleCurrentLocation}
                                className="absolute right-1 top-1/2 -translate-y-1/2 hover:text-teal-400 hover:bg-white/10 rounded-lg h-9 w-9"
                                title="Gunakan Lokasi Saat Ini"
                            >
                                <LocateFixed className="w-4 h-4 text-white/40" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
