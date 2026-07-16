'use client';

import React, { useState } from 'react';
import {
    Plane, Train, Bus, Car, MapPin, Loader2, Search, Bed, Lock,
    ChevronDown, ChevronUp, ExternalLink, Shield, ShieldCheck,
    FileText, CreditCard, CloudRain, Phone, ArrowRight, X,
} from 'lucide-react';
import { Trip, TripPlan, TransportOption } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { activateFlightGuardian, getFlightAlertStatus, deactivateFlightAlert } from '@/services/flightService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getHotelSearchLink } from '@/utils/booking';

interface LogisticsViewProps {
    trip: Trip;
    plan: TripPlan;
    isPro?: boolean;
    onUpgrade?: () => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const transportIcon = (option: TransportOption) => {
    const text = `${option.strategy_tag || ''} ${option.name || ''} ${option.breakdown?.main_leg || ''} ${option.operators_hint || ''}`.toLowerCase();
    if (option.type === 'flight' || text.includes('pesawat') || text.includes('flight') || text.includes('garuda') || text.includes('lion air'))
        return <Plane className="w-4 h-4 text-sky-400" />;
    if (option.type === 'train' || text.includes('kereta') || text.includes('train') || text.includes('krl') || text.includes('whoosh'))
        return <Train className="w-4 h-4 text-emerald-400" />;
    if (text.includes('bus') || text.includes('damri') || text.includes('shuttle'))
        return <Bus className="w-4 h-4 text-orange-400" />;
    return <Car className="w-4 h-4 text-white/50" />;
};

const STRATEGY_LABEL: Record<string, string> = { HEMAT: 'Paling Hemat', CEPAT: 'Tercepat', NYAMAN: 'Paling Nyaman' };

const hasFlightOption = (options: TransportOption[]) =>
    options.some(o => {
        if (o.type === 'flight') return true;
        const t = `${o.strategy_tag} ${o.name} ${o.breakdown?.main_leg || ''} ${o.operators_hint || ''}`.toLowerCase();
        return t.includes('flight') || t.includes('pesawat') || t.includes('penerbangan');
    });

// ── section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] uppercase tracking-widest text-white/45 mb-3">{children}</p>
    );
}

// ── dark skeleton ─────────────────────────────────────────────────────────────

function DarkSkeleton({ className }: { className?: string }) {
    return <div className={cn('bg-white/8 animate-pulse rounded-lg', className)} />;
}

// ── main component ────────────────────────────────────────────────────────────

export default function LogisticsView({ trip, plan, isPro = false, onUpgrade }: LogisticsViewProps) {
    const { getToken } = useAuth();

    // ── Transport state ──
    const [originInput, setOriginInput] = useState('');
    const [transportLoading, setTransportLoading] = useState(false);
    const [transportError, setTransportError] = useState('');
    const [transportOptions, setTransportOptions] = useState<TransportOption[] | null>(
        plan.transport_options && plan.transport_options.length > 0 ? plan.transport_options : null
    );
    const [searchedOrigin, setSearchedOrigin] = useState<string>(
        plan.transport_options && plan.transport_options.length > 0 ? (trip.origin || '') : ''
    );

    const handleSearchTransport = async () => {
        const origin = originInput.trim();
        if (!origin) return;
        setTransportLoading(true);
        setTransportError('');
        try {
            const token = await getToken();
            const res = await api.post(
                `/trips/${trip.id}/logistics/transport`,
                { origin_city: origin },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTransportOptions(res.data.transport_options ?? []);
            setSearchedOrigin(origin);
        } catch {
            setTransportError('Gagal mengambil data transport. Coba lagi.');
        } finally {
            setTransportLoading(false);
        }
    };

    // ── Accommodation state ──
    const [accomExpanded, setAccomExpanded] = useState(false);
    const [accomTimedOut, setAccomTimedOut] = useState(false);
    React.useEffect(() => {
        if ((plan.strategic_accommodation ?? []).length > 0) return;
        const t = setTimeout(() => setAccomTimedOut(true), 30_000);
        return () => clearTimeout(t);
    }, [plan.strategic_accommodation]);

    // ── Flight Guardian state ──
    const [fgLoading, setFgLoading] = useState(false);
    const [fgActive, setFgActive] = useState(false);
    const [fgAlert, setFgAlert] = useState<any>(null);
    const [fgChecked, setFgChecked] = useState(false);

    React.useEffect(() => {
        if (!trip.id || fgChecked) return;
        setFgChecked(true);
        (async () => {
            try {
                const token = await getToken();
                const res = await getFlightAlertStatus(trip.id, token);
                const active = res.alerts?.find((a: any) => a.is_active);
                if (active) { setFgAlert(active); setFgActive(true); }
            } catch { /* silent */ }
        })();
    }, [trip.id]);

    const handleActivateFG = async () => {
        setFgLoading(true);
        try {
            const token = await getToken();
            const res = await activateFlightGuardian(
                trip.id,
                searchedOrigin.toUpperCase(),
                (plan.destination_airport || trip.destination).toUpperCase(),
                token
            );
            toast.success(`Flight Guardian aktif! Harga saat ini: ${res.currency} ${res.current_price}`);
            const status = await getFlightAlertStatus(trip.id, token);
            const active = status.alerts?.find((a: any) => a.is_active);
            if (active) { setFgAlert(active); setFgActive(true); }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Gagal mengaktifkan Flight Guardian');
        } finally {
            setFgLoading(false);
        }
    };

    const handleDeactivateFG = async () => {
        if (!fgAlert) return;
        try {
            const token = await getToken();
            await deactivateFlightAlert(fgAlert.id, token);
            toast.success('Flight Guardian dinonaktifkan');
            setFgActive(false);
            setFgAlert(null);
        } catch {
            toast.error('Gagal menonaktifkan Flight Guardian');
        }
    };

    const hasTransport = transportOptions && transportOptions.length > 0;
    const showFlightGuardian = hasTransport && hasFlightOption(transportOptions!);

    // ── Essentials derived data ──
    const arrival = plan.arrival_guide;
    const isInternational = trip.destination && !['bali', 'lombok', 'yogyakarta', 'solo', 'jakarta', 'bandung',
        'surabaya', 'semarang', 'malang', 'medan', 'makassar', 'manado', 'flores', 'raja ampat',
        'komodo', 'labuan bajo'].some(d => trip.destination.toLowerCase().includes(d));

    const essentialRows = [
        { icon: <Bus className="w-3.5 h-3.5 text-white/50" />, text: arrival?.primary_transport || `Ojek online tersedia di ${trip.destination}` },
        { icon: <FileText className="w-3.5 h-3.5 text-white/50" />, text: isInternational ? 'Siapkan paspor (min. 6 bulan berlaku) + cek visa' : 'Siapkan KTP / identitas diri' },
        { icon: <CloudRain className="w-3.5 h-3.5 text-white/50" />, text: 'Pantau cuaca sebelum berangkat — bawa jas hujan / payung' },
        { icon: <CreditCard className="w-3.5 h-3.5 text-white/50" />, text: 'Siapkan uang tunai & e-wallet (GoPay/OVO) untuk warung & pasar' },
        { icon: <Phone className="w-3.5 h-3.5 text-white/50" />, text: 'Darurat: 112 (nasional) · 119 (ambulans) · 110 (polisi)' },
    ];

    const hasEssentials = !!arrival || true; // static rows always available
    const essentialsLoading = !arrival && !accomTimedOut && (plan.strategic_accommodation ?? []).length === 0;

    return (
        <div className="pb-20 space-y-6 animate-in fade-in duration-300">

            {/* ── 1. TRANSPORT ─────────────────────────────────── */}
            <section>
                <SectionLabel>Transport</SectionLabel>

                {!hasTransport ? (
                    /* Idle — input form */
                    <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-4 space-y-3">
                        <p className="text-[13px] font-semibold text-white">Dari mana kamu berangkat?</p>
                        <p className="text-[12px] text-white/45">
                            Miru akan carikan opsi transport terbaik ke {trip.destination}.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={originInput}
                                onChange={e => setOriginInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !transportLoading && handleSearchTransport()}
                                placeholder="Kota asal (mis. Jakarta, Bandung...)"
                                maxLength={100}
                                disabled={transportLoading}
                                className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/6 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-teal-500/50 disabled:opacity-50"
                            />
                            <button
                                onClick={handleSearchTransport}
                                disabled={transportLoading || !originInput.trim()}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white text-[13px] font-semibold transition-colors whitespace-nowrap"
                            >
                                {transportLoading
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Mencari...</>
                                    : <><Search className="w-3.5 h-3.5" /> Cari</>
                                }
                            </button>
                        </div>
                        {transportError && (
                            <p className="text-[12px] text-rose-400">{transportError}</p>
                        )}
                    </div>
                ) : (
                    /* Results */
                    <div className="space-y-2">
                        {/* Origin chip + reset */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-teal-500/8 border border-teal-500/20 rounded-xl">
                            <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                            <span className="text-[12px] text-teal-300 flex-1">{searchedOrigin} → {trip.destination}</span>
                            <button
                                onClick={() => { setTransportOptions(null); setOriginInput(searchedOrigin); }}
                                className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
                            >
                                <X className="w-3 h-3" /> Ganti
                            </button>
                        </div>

                        {transportOptions!.map((opt, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-[#0A1628] border border-white/8 rounded-xl hover:border-white/16 transition-colors">
                                <div className="w-9 h-9 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center flex-shrink-0">
                                    {transportIcon(opt)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-white leading-snug truncate">{opt.name}</p>
                                    <p className="text-[11px] text-white/45 mt-0.5">
                                        {opt.total_duration_display && `~${opt.total_duration_display}`}
                                        {opt.total_duration_display && opt.operators_hint && ' · '}
                                        {opt.operators_hint}
                                    </p>
                                </div>
                                {opt.strategy_tag && (
                                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/12 border border-teal-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                                        {STRATEGY_LABEL[opt.strategy_tag?.toUpperCase()] || opt.strategy_tag}
                                    </span>
                                )}
                                <button
                                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent((opt.booking_query || opt.name) + ' tiket')}`, '_blank')}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-teal-400 transition-colors flex-shrink-0"
                                    aria-label="Cari tiket"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── 2. AKOMODASI ─────────────────────────────────── */}
            <section>
                <SectionLabel>Akomodasi</SectionLabel>

                {(() => {
                    const options = plan.strategic_accommodation ?? [];
                    const tripCtx = { destination: trip.destination, startDate: trip.start_date ?? '', days: trip.trip_days };

                    if (options.length === 0) {
                        return (
                            <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-4">
                                {accomTimedOut ? (
                                    <div className="flex items-center gap-3">
                                        <Bed className="w-4 h-4 text-white/30 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-[13px] font-semibold text-white/60">Rekomendasi Akomodasi</p>
                                            <p className="text-[11px] text-rose-400 mt-0.5">Gagal memuat — coba muat ulang halaman.</p>
                                        </div>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="text-[11px] text-white/50 hover:text-white/80 border border-white/12 px-2.5 py-1 rounded-lg transition-colors"
                                        >
                                            Muat ulang
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center flex-shrink-0">
                                            <Bed className="w-4 h-4 text-white/30" />
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <DarkSkeleton className="w-2/5 h-3.5" />
                                            <DarkSkeleton className="w-3/5 h-3" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const teaser = options[0];
                    const rest = options.slice(1);
                    const bookingUrl = getHotelSearchLink(`${teaser.area_name}, ${trip.destination}`, trip.start_date ?? '', trip.trip_days);

                    return (
                        <div className="space-y-2">
                            {/* Teaser card */}
                            <AccomDarkCard option={teaser} bookingUrl={bookingUrl} isPro={isPro} isTeaser />

                            {/* Expand toggle */}
                            {rest.length > 0 && (
                                <>
                                    {accomExpanded && rest.map((opt, i) => (
                                        <AccomDarkCard
                                            key={i}
                                            option={opt}
                                            bookingUrl={getHotelSearchLink(`${opt.area_name}, ${trip.destination}`, trip.start_date ?? '', trip.trip_days)}
                                            isPro={isPro}
                                        />
                                    ))}

                                    {isPro ? (
                                        <button
                                            onClick={() => setAccomExpanded(v => !v)}
                                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-teal-500/25 text-[12px] text-teal-400 font-semibold hover:bg-teal-500/8 transition-colors"
                                        >
                                            {accomExpanded
                                                ? <><ChevronUp className="w-3.5 h-3.5" /> Sembunyikan</>
                                                : <><ChevronDown className="w-3.5 h-3.5" /> Lihat {rest.length} pilihan lainnya</>
                                            }
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onUpgrade}
                                            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-dashed border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/8 transition-colors text-left"
                                        >
                                            <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                            <p className="text-[12px] text-amber-300/70 flex-1">
                                                +{rest.length} area tersedia di PRO
                                            </p>
                                            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                                                Upgrade →
                                            </span>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })()}
            </section>

            {/* ── 3. FLIGHT GUARDIAN (conditional) ─────────────── */}
            {showFlightGuardian && (
                <section>
                    <SectionLabel>Flight Guardian</SectionLabel>

                    {fgActive && fgAlert ? (
                        /* Active state */
                        <div className="bg-teal-500/8 border border-teal-500/25 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-[13px] font-semibold text-teal-300">Guardian aktif</p>
                                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                                    </div>
                                    <p className="text-[11px] text-white/45 mt-0.5">
                                        Memantau {fgAlert.origin_airport} → {fgAlert.destination_airport}
                                        {fgAlert.current_price ? ` · ${fgAlert.currency} ${fgAlert.current_price}` : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={handleDeactivateFG}
                                    className="text-[11px] text-white/35 hover:text-rose-400 transition-colors"
                                >
                                    Hentikan
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Idle state */
                        <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Shield className="w-4 h-4 text-teal-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[13px] font-semibold text-white">Pantau harga penerbangan</p>
                                    <p className="text-[12px] text-white/45 mt-0.5 mb-3">
                                        Miru pantau setiap 12 jam — notifikasi jika harga turun.
                                    </p>

                                    {/* Route preview */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[12px] text-white/60 bg-white/6 border border-white/8 px-3 py-1.5 rounded-full">
                                            {searchedOrigin || trip.origin || '—'}
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5 text-white/20" />
                                        <span className="text-[12px] text-white/60 bg-white/6 border border-white/8 px-3 py-1.5 rounded-full">
                                            {plan.destination_airport || trip.destination}
                                        </span>
                                        <span className="ml-auto text-[10px] text-white/25">tujuan terkunci</span>
                                    </div>

                                    <button
                                        onClick={handleActivateFG}
                                        disabled={fgLoading}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-[12px] font-semibold transition-colors"
                                    >
                                        {fgLoading
                                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengaktifkan...</>
                                            : <><Shield className="w-3.5 h-3.5" /> Pantau Harga</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* ── 4. ESSENTIALS ────────────────────────────────── */}
            <section>
                <SectionLabel>Essentials</SectionLabel>

                {essentialsLoading ? (
                    <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-4 space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <DarkSkeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
                                <DarkSkeleton className="flex-1 h-3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#0A1628] border border-white/8 rounded-2xl divide-y divide-white/6">
                        {essentialRows.map((row, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-7 h-7 rounded-lg bg-white/6 flex items-center justify-center flex-shrink-0">
                                    {row.icon}
                                </div>
                                <p className="text-[12px] text-white/60 leading-snug">{row.text}</p>
                            </div>
                        ))}
                        {(arrival as any)?.arrival_info && (
                            <div className="flex items-center gap-3 px-4 py-3">
                                <div className="w-7 h-7 rounded-lg bg-white/6 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-3.5 h-3.5 text-white/50" />
                                </div>
                                <p className="text-[12px] text-white/60 leading-snug">{(arrival as any).arrival_info}</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

// ── AccomDarkCard — dark accommodation card ───────────────────────────────────

interface AccomDarkCardProps {
    option: any;
    bookingUrl: string;
    isPro: boolean;
    isTeaser?: boolean;
}

function AccomDarkCard({ option, bookingUrl, isPro, isTeaser }: AccomDarkCardProps) {
    const hotelList: string[] = Array.isArray(option.hotel_suggestions)
        ? option.hotel_suggestions
        : ((option.hotel_suggestions as string) || '').split(',').map((h: string) => h.trim()).filter(Boolean);

    return (
        <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-4">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Bed className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-[13px] font-semibold text-white leading-snug">{option.area_name}</p>
                            {option.type && (
                                <span className="text-[10px] font-semibold text-violet-400/80 uppercase tracking-wide">{option.type}</span>
                            )}
                        </div>
                        <a
                            href={bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-teal-400 transition-colors flex-shrink-0"
                            aria-label="Cari hotel"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                    <p className="text-[12px] text-white/45 mt-1.5 leading-snug line-clamp-2">{option.reason}</p>

                    {/* Hotel suggestions — PRO gate */}
                    {hotelList.length > 0 && (
                        <div className="mt-2.5 relative">
                            {isPro ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {hotelList.map((hotel, i) => (
                                        <a
                                            key={i}
                                            href={`https://www.google.com/maps/search/${encodeURIComponent(hotel)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] text-teal-400 hover:text-teal-300 underline-offset-2 hover:underline transition-colors"
                                        >
                                            {hotel}{i < hotelList.length - 1 ? ',' : ''}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="blur-sm pointer-events-none select-none flex flex-wrap gap-1.5">
                                        {hotelList.map((hotel, i) => (
                                            <span key={i} className="text-[11px] text-teal-400">
                                                {hotel}{i < hotelList.length - 1 ? ',' : ''}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="inline-flex items-center gap-1 bg-teal-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                            <Lock className="w-2.5 h-2.5" /> PRO
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
