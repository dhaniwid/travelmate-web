'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Plane, TrendingDown, Clock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    activateFlightGuardian,
    getFlightAlertStatus,
    deactivateFlightAlert,
    searchFlightOffers,
    type FlightAlertStatus,
} from '@/services/flightService';
import { formatDistanceToNow } from 'date-fns';
import AirportSearch from './AirportSearch';

interface FlightWatchCardProps {
    tripId: string;
    destinationCity: string;
    destinationAirport?: string;
    initialOrigin?: string; // pre-filled from transport search origin city
    variant?: 'full' | 'compact'; // 'full' for Logistics tab, 'compact' for Overview sidebar
}

export default function FlightWatchCard({
    tripId,
    destinationCity,
    destinationAirport,
    initialOrigin = '',
    variant = 'full',
}: FlightWatchCardProps) {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [isChecking, setIsChecking] = useState(false); // New state
    const [activeAlert, setActiveAlert] = useState<FlightAlertStatus | null>(null);
    const [originAirport, setOriginAirport] = useState(initialOrigin);
    const [flightOffer, setFlightOffer] = useState<any>(null); // New state

    // Auto-determine destination if available, or allow manual override
    const [manualDestination, setManualDestination] = useState('');
    const destination = destinationAirport || manualDestination;

    // Fetch existing alerts on mount — wait for Clerk to be ready and tripId to be available
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !tripId) return;
        fetchAlertStatus();
    }, [tripId, isLoaded, isSignedIn]);

    const fetchAlertStatus = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const response = await getFlightAlertStatus(tripId, token);
            if (response.alerts && response.alerts.length > 0) {
                const activeAlert = response.alerts.find((a) => a.is_active);
                if (activeAlert) {
                    setActiveAlert(activeAlert);
                    setIsActive(true);
                    setOriginAirport(activeAlert.origin_airport);
                }
            }
        } catch (error) {
            console.error('Failed to fetch alert status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckFlights = async () => {
        if (!originAirport.trim() || !destination.trim()) return;
        setIsChecking(true);
        setFlightOffer(null);

        try {
            const token = await getToken();
            const today = new Date();
            today.setDate(today.getDate() + 30);
            const dateStr = today.toISOString().split('T')[0];

            const offers = await searchFlightOffers(originAirport, destination, dateStr, undefined, token);

            if (offers && offers.length > 0) {
                setFlightOffer(offers[0]);
            } else {
                toast.error("Penerbangan tidak ditemukan untuk rute ini.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengecek penerbangan.");
        } finally {
            setIsChecking(false);
        }
    };

    const handleActivate = async () => {
        if (!originAirport.trim()) {
            toast.error('Masukkan kode bandara asal kamu');
            return;
        }

        if (!destination.trim()) {
            toast.error('Bandara tujuan tidak tersedia untuk trip ini');
            return;
        }

        setIsActivating(true);
        try {
            const token = await getToken();
            const response = await activateFlightGuardian(
                tripId,
                originAirport.toUpperCase(),
                destination.toUpperCase(),
                token
            );

            toast.success(`Flight Guardian aktif! Harga saat ini: ${response.currency} ${response.current_price}`);
            await fetchAlertStatus();
            setFlightOffer(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Gagal mengaktifkan Flight Guardian');
        } finally {
            setIsActivating(false);
        }
    };

    const handleDeactivate = async () => {
        if (!activeAlert) return;

        try {
            const token = await getToken();
            await deactivateFlightAlert(activeAlert.id, token);
            toast.success('Flight Guardian dinonaktifkan');
            setIsActive(false);
            setActiveAlert(null);
        } catch (error) {
            toast.error('Gagal menonaktifkan Flight Guardian');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            </div>
        );
    }

    // ─── COMPACT VARIANT (Overview Sidebar) ─────────────────────────────────
    if (variant === 'compact') {
        if (!isActive || !activeAlert) {
            return (
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Plane className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-800">Flight Guardian</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Pantau harga penerbangan & hemat lebih banyak.</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            // Redirect to Logistics tab
                            const url = new URL(window.location.href);
                            url.searchParams.set('view', 'logistics');
                            window.location.search = '?view=logistics';
                        }}
                        variant="outline"
                        className="w-full h-9 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-bold rounded-xl text-xs shadow-sm"
                    >
                        Atur di Logistics
                        <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>

                    {/* Decorative background icon */}
                    <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12">
                        <Plane className="w-24 h-24 text-blue-600" />
                    </div>
                </div>
            );
        }
        // Compact active state
        return (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 border-green-200 shadow-md">
                {activeAlert && (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="p-2 bg-green-100 rounded-xl">
                                        <Shield className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800">Guardian Aktif</h4>
                                    <p className="text-[10px] text-slate-500">{activeAlert!.origin_airport} → {activeAlert!.destination_airport}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mb-3">
                            <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">Sekarang</p>
                                <p className="text-base font-black text-blue-900">{activeAlert!.currency} {activeAlert!.current_price.toFixed(0)}</p>
                            </div>
                            <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
                                <p className="text-[10px] font-bold text-green-600 uppercase mb-0.5">Terendah</p>
                                <p className="text-base font-black text-green-900">{activeAlert!.currency} {activeAlert!.lowest_price_seen.toFixed(0)}</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleDeactivate}
                            variant="outline"
                            className="w-full h-8 text-xs border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 font-bold rounded-xl"
                        >
                            Hentikan Pemantauan
                        </Button>
                    </>
                )}
            </div>
        );
    }
    // ─── FULL VARIANT (Logistics Tab) — Inactive State ──────────────────────
    if (!isActive || !activeAlert) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-6 border border-blue-100 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-2xl">
                        <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Pantau Harga Penerbangan</h3>
                        <p className="text-xs text-slate-600">Biarkan Miru memantau penurunan harga</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                        {/* Connector Icon */}
                        <div className="hidden md:flex absolute left-1/2 top-9 -translate-x-1/2 z-10 w-8 h-8 bg-white rounded-full border border-slate-200 items-center justify-center text-slate-400 shadow-sm">
                            <Plane className="w-3 h-3 rotate-90" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Bandara Asal</label>
                            <AirportSearch
                                value={originAirport}
                                onChange={(loc) => setOriginAirport(loc ? loc.iata_code : '')}
                                placeholder="City or Airport (e.g. Jakarta)"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Tujuan ({destinationCity})</label>
                            {destinationAirport ? (
                                <div className="h-10 flex items-center justify-center rounded-xl border border-slate-200 border-dashed text-slate-500 font-bold bg-slate-50/50">
                                    {destinationAirport}
                                </div>
                            ) : (
                                <AirportSearch
                                    value={manualDestination}
                                    onChange={(loc) => setManualDestination(loc ? loc.iata_code : '')}
                                    placeholder="Search Destination Airport"
                                />
                            )}
                        </div>
                    </div>

                    {/* Best Flight Result */}
                    {flightOffer && (
                        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm">
                                    ✈️
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">{flightOffer.airline}</div>
                                    <div className="text-xs text-emerald-700 font-medium">
                                        {flightOffer.duration} • {flightOffer.stops === 0 ? 'Langsung' : `${flightOffer.stops} Transit`}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-emerald-700">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: flightOffer.currency }).format(flightOffer.price)}
                                </div>
                                <div className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">Harga Terbaik</div>
                            </div>
                        </div>
                    )}

                    <div className="mt-2 text-center text-xs text-slate-400">
                        {/* Spacer or disclaimer */}
                    </div>

                    {!flightOffer ? (
                        <Button
                            onClick={handleCheckFlights}
                            disabled={isChecking || !originAirport || !destination}
                            className="w-full h-12 text-base rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200/50 transition-all hover:scale-[1.01]"
                        >
                            {isChecking ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengecek Penerbangan...</>
                            ) : (
                                "Cek Harga Penerbangan"
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleActivate}
                            disabled={isActivating}
                            className="w-full h-12 text-base rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold shadow-lg shadow-blue-200/50 transition-all hover:scale-[1.01]"
                        >
                            {isActivating ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengaktifkan Guardian...</>
                            ) : (
                                <><Shield className="w-4 h-4 mr-2" /> Pantau Harga Ini</>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // ─── FULL VARIANT — Active / Monitoring State ────────────────────────────
    if (!activeAlert) return null;

    const priceDropPercent =
        activeAlert!.initial_price > 0
            ? ((activeAlert!.initial_price - activeAlert!.lowest_price_seen) / activeAlert!.initial_price) * 100
            : 0;

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border-2 border-green-200 shadow-xl relative overflow-hidden">
            {/* Pulsing Background Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="p-3 bg-green-100 rounded-2xl">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Guardian Active</h3>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                            <Plane className="w-3 h-3" />
                            {activeAlert!.origin_airport} → {activeAlert!.destination_airport}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                            Harga Sekarang
                        </span>
                    </div>
                    <p className="text-2xl font-black text-blue-900">
                        {activeAlert!.currency} {activeAlert!.current_price.toFixed(2)}
                    </p>
                </div>

                <div
                    className={`bg-gradient-to-br ${priceDropPercent > 0 ? 'from-green-50 to-green-100' : 'from-slate-50 to-slate-100'
                        } rounded-2xl p-4`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <div
                            className={`w-8 h-8 ${priceDropPercent > 0 ? 'bg-green-500' : 'bg-slate-400'
                                } rounded-lg flex items-center justify-center`}
                        >
                            <TrendingDown className="w-4 h-4 text-white" />
                        </div>
                        <span
                            className={`text-xs font-bold ${priceDropPercent > 0 ? 'text-green-700' : 'text-slate-700'
                                } uppercase tracking-wide`}
                        >
                            Terendah Tercatat
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p
                            className={`text-2xl font-black ${priceDropPercent > 0 ? 'text-green-900' : 'text-slate-900'
                                }`}
                        >
                            {activeAlert!.currency} {activeAlert!.lowest_price_seen.toFixed(2)}
                        </p>
                        {priceDropPercent > 0 && (
                            <span className="text-xs font-bold text-green-600">
                                -{priceDropPercent.toFixed(0)}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Last Checked */}
            {activeAlert!.last_checked_at && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 rounded-xl p-3">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                        Terakhir dicek{' '}
                        {activeAlert!.last_checked_at ? formatDistanceToNow(new Date(activeAlert!.last_checked_at as string), { addSuffix: true }) : 'baru saja'}
                    </span>
                </div>
            )}

            {/* Info Banner */}
            <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 mb-4">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                    Miru mengecek harga setiap 12 jam. Kamu akan diberitahu jika ada penawaran lebih baik!
                </p>
            </div>

            {/* Deactivate Button */}
            <Button
                onClick={handleDeactivate}
                variant="outline"
                className="w-full h-10 border-2 border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold rounded-xl transition-colors"
            >
                Hentikan Pemantauan
            </Button>
        </div>
    );
}
