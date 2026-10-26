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
                <Label htmlFor="auto-dest" className="cursor-pointer text-xs font-semibold text-zinc-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    Acak Destinasi
                </Label>
            </div>

            {/* Destination Input */}
            <div className="relative group">
                <div className={cn(
                    "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors z-10",
                    isAuto ? "text-teal-600" : "text-zinc-500 group-focus-within:text-zinc-950"
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
                        "pl-10 py-6 text-base font-medium transition-all rounded-xl placeholder:text-zinc-400",
                        isAuto
                            ? "bg-teal-50 border-teal-200 text-teal-800 italic cursor-not-allowed"
                            : "bg-zinc-100 border-zinc-200 text-zinc-950 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-zinc-950"
                    )}
                />
                {/* Autocomplete dropdown */}
                {!isAuto && showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
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
                                    className="px-4 py-3 hover:bg-zinc-50 cursor-pointer flex items-center gap-2.5 border-b border-zinc-100 last:border-b-0"
                                >
                                    <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                                    <div>
                                        <span className="text-sm font-bold text-zinc-950">{dest.name}</span>
                                        <span className="text-xs text-zinc-500 ml-2">{dest.tagline}</span>
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
                        className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
                    >
                        <Navigation className="w-3 h-3 text-teal-600" />
                        Tambah kota asal
                        <span className="text-zinc-400 font-normal">(opsional — untuk saran transport)</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                ) : (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1">
                            Berangkat dari
                            <span className="text-zinc-400 font-normal normal-case tracking-normal">(opsional)</span>
                        </Label>
                        <div className="relative group">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-950 transition-colors">
                                <Navigation className="w-4 h-4" />
                            </div>
                            <Input
                                placeholder="Kota asal (e.g. Jakarta)"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="pl-10 pr-10 py-5 text-sm font-medium text-zinc-950 bg-zinc-100 border-zinc-200 placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-zinc-950 transition-all rounded-xl"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={handleCurrentLocation}
                                className="absolute right-1 top-1/2 -translate-y-1/2 hover:text-zinc-950 hover:bg-zinc-200 rounded-lg h-9 w-9"
                                title="Gunakan Lokasi Saat Ini"
                            >
                                <LocateFixed className="w-4 h-4 text-zinc-500" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
