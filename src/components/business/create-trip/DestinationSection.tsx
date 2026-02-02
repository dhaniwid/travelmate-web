import React from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {MapPin, Navigation, LocateFixed, Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';

interface DestinationSectionProps {
    origin: string;
    setOrigin: (val: string) => void;
    destination: string;
    setDestination: (val: string) => void;
    isAuto: boolean;
    setAuto: (val: boolean) => void;
}

export default function DestinationSection({
                                               origin,
                                               setOrigin,
                                               destination,
                                               setDestination,
                                               isAuto,
                                               setAuto
                                           }: DestinationSectionProps) {

    // Simulasi ambil lokasi (Nanti bisa diganti dengan navigator.geolocation)
    const handleCurrentLocation = () => {
        toast.info("Locating...", {duration: 1000});
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
                        <Sparkles className="w-3 h-3 text-orange-500"/>
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
                        className="absolute -left-[25px] top-3 w-4 h-4 rounded-full bg-blue-100 border-4 border-blue-600 shadow-sm"/>

                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Starting Point (Origin)
                    </Label>
                    <div className="relative group">
                        <div
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <Navigation className="w-4 h-4"/>
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-blue-600 hover:bg-blue-50 rounded-lg h-8 w-8"
                            title="Use Current Location"
                        >
                            <LocateFixed className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>

                {/* 2. DESTINATION INPUT */}
                <div className="relative">
                    {/* Visual Dot */}
                    <div
                        className="absolute -left-[25px] top-3 w-4 h-4 rounded-full bg-teal-100 border-4 border-teal-500 shadow-sm"/>

                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Destination
                    </Label>

                    {isAuto ? (
                        // Tampilan saat Mode Surprise Me Aktif
                        <div
                            className="h-[52px] w-full rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 flex items-center px-4 gap-3 animate-in fade-in">
                            <Sparkles className="w-5 h-5 text-orange-500 animate-pulse"/>
                            <span className="text-slate-600 font-medium italic">
                                Let AI choose a hidden gem for you...
                            </span>
                        </div>
                    ) : (
                        // Tampilan Input Manual
                        <div className="relative group">
                            <div
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                <MapPin className="w-4 h-4"/>
                            </div>
                            <Input
                                placeholder="City (e.g. Tokyo, Bali)"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="pl-10 py-6 text-base bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm focus:ring-teal-500"
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}