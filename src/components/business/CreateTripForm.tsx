'use client';

import React from 'react';
import {useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {tripService} from '@/services/trip';
import {TripRequest} from '@/types';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Loader2, Plane, Sparkles, MapPin, Wallet} from 'lucide-react';

import {toast} from "sonner";
import {formatMoney} from '@/lib/utils';

import GenerationProgress, {ProgressStep} from './GenerationProgress';
import ItinerarySkeleton from './ItinerarySkeleton';

// -------------------------

export default function CreateTripForm({onSuccess}: { onSuccess: (data: any) => void }) {
    const [isAutoDest, setIsAutoDest] = useState(false);
    const [isAutoBudget, setIsAutoBudget] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);

    const [steps, setSteps] = useState<ProgressStep[]>([
        {id: 'meta', label: 'Initializing', status: 'pending'},
        {id: 'iti', label: 'Generating Itinerary', status: 'pending'},
        {id: 'log', label: 'Finding Logistics', status: 'pending'},
        {id: 'final', label: 'Fetching Photos', status: 'pending'},
    ]);

    const [formData, setFormData] = useState<TripRequest>({
        origin: 'Jakarta',
        destination: '',
        start_date: new Date().toISOString().split('T')[0],
        trip_days: 5,
        style: 'general',
        budget: 0,
    });

    const updateStep = (id: string, status: 'loading' | 'complete') => {
        setSteps(prev => prev.map(step => step.id === id ? {...step, status} : step));
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsStreaming(true);

        // Reset steps
        setSteps(prev => prev.map(s => ({...s, status: 'pending'})));
        updateStep('meta', 'loading');

        const payload = {
            ...formData,
            destination: isAutoDest ? '' : formData.destination,
            budget: isAutoBudget ? 0 : formData.budget,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/stream`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Server error");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            let finalData: any = {trip: payload, plan: {}};

            while (true) {
                const {value, done} = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                lines.forEach(line => {
                    if (!line.trim()) return;
                    try {
                        const event = JSON.parse(line);

                        if (event.type === 'metadata') {
                            updateStep('meta', 'complete');
                            updateStep('iti', 'loading');
                            finalData.trip.id = event.data.trip_id;
                        } else if (event.type === 'itinerary') {
                            updateStep('iti', 'complete');
                            updateStep('log', 'loading');
                            finalData.plan.itinerary = event.data;
                        } else if (event.type === 'logistics') {
                            updateStep('log', 'complete');
                            updateStep('final', 'loading');
                            finalData.plan = {...finalData.plan, ...event.data};
                        }
                    } catch (e) {
                        console.error("Error parsing stream chunk", e);
                    }
                });
            }

            updateStep('final', 'complete');
            toast.success("Trip successfully crafted!");

            // Berikan sedikit delay agar user bisa melihat semua centang hijau
            setTimeout(() => {
                onSuccess(finalData);
                setIsStreaming(false);
            }, 800);

        } catch (error) {
            setIsStreaming(false);
            toast.error("Failed to generate plan. Please try again.");
        }
    };

    if (isStreaming) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <Card className="border-t-4 border-t-blue-600 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-center text-blue-600 animate-pulse">
                            Generating Your Dream Trip...
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GenerationProgress steps={steps}/>
                        <div className="mt-8 border-t pt-8">
                            <h4 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-yellow-500"/>
                                Previewing your plan...
                            </h4>
                            <ItinerarySkeleton/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-lg mx-auto shadow-lg border-t-4 border-t-blue-600">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Plane className="h-6 w-6 text-blue-600"/>
                    Plan Your Adventure
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Origin & Destination */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label>Origin</Label>
                            <div className="relative">
                                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"/>
                                <Input
                                    className="pl-8"
                                    value={formData.origin}
                                    onChange={(e) => setFormData({...formData, origin: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Destination</Label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={isAutoDest}
                                        onCheckedChange={setIsAutoDest}
                                        id="auto-dest"
                                    />
                                    <Label htmlFor="auto-dest"
                                           className="text-xs text-blue-600 font-bold cursor-pointer">
                                        Surprise Me! ✨
                                    </Label>
                                </div>
                            </div>
                            <Input
                                value={isAutoDest ? '' : formData.destination}
                                onChange={(e) => setFormData({...formData, destination: e.target.value})}
                                disabled={isAutoDest}
                                placeholder={isAutoDest ? "We'll choose for you..." : "e.g. Bali"}
                                className={isAutoDest ? "bg-gray-50 italic" : ""}
                            />
                        </div>
                    </div>

                    {/* Date & Days */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                min={getTodayDate()}
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (Days)</Label>
                            <Input
                                type="number"
                                min={1} max={14}
                                value={formData.trip_days}
                                onChange={(e) => setFormData({...formData, trip_days: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    {/* Style */}
                    <div className="space-y-2">
                        <Label>Travel Style</Label>
                        <Select
                            value={formData.style}
                            onValueChange={(val) => setFormData({...formData, style: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select style"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">Surprise Me / General</SelectItem>
                                <SelectItem value="cultural">Cultural & History</SelectItem>
                                <SelectItem value="relaxed">Relaxed & Chill</SelectItem>
                                <SelectItem value="adventure">Nature & Adventure</SelectItem>
                                <SelectItem value="foodie">Foodie Hunt</SelectItem>
                                <SelectItem value="luxury">Luxury & Comfort</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Budget */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                            <Label className="flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-blue-600"/> Budget (IDR)
                            </Label>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={isAutoBudget}
                                    onCheckedChange={setIsAutoBudget}
                                    id="auto-budget"
                                />
                                <Label htmlFor="auto-budget" className="text-xs text-blue-600 font-bold cursor-pointer">
                                    Calculate for me
                                </Label>
                            </div>
                        </div>

                        {!isAutoBudget && (
                            <>
                                <div className="text-2xl font-bold text-slate-700">
                                    Rp {formatMoney(formData.budget)}
                                </div>
                                <Slider
                                    defaultValue={[formData.budget]}
                                    max={50000000}
                                    step={100000}
                                    onValueChange={(vals) => setFormData({...formData, budget: vals[0]})}
                                    className="py-4"
                                />
                            </>
                        )}
                        {isAutoBudget && (
                            <p className="text-sm text-blue-600 italic text-center">
                                We will estimate the standard cost for this trip.
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 shadow-lg shadow-blue-100"
                        disabled={isStreaming}
                    >
                        Check & Generate <Sparkles className="ml-2 h-4 w-4"/>
                    </Button>

                </form>
            </CardContent>
        </Card>
    );
}