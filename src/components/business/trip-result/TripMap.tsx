'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, InfoWindow } from '@react-google-maps/api';
import { Activity, ItineraryItem } from '@/types';
import { MapActivityThumbnail } from '@/components/business/MapActivityThumbnail';

const TOD_EMOJI = (timeStr: string) => {
    const h = parseInt((timeStr || '').split(':')[0]);
    if (isNaN(h) || h < 11) return '☕';
    if (h < 16) return '☀️';
    if (h < 19) return '🌅';
    return '🌙';
};

interface TripMapProps {
    itinerary: ItineraryItem[];
    destination: string;
    selectedActivityId: string | null;
    onActivitySelect: (id: string | null) => void;
    activeDays?: Set<number>;
}

const mapContainerStyle = { width: '100%', height: '100%' };
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

const mapOptions: google.maps.MapOptions = {
    mapId: MAP_ID,
    disableDefaultUI: true,
    zoomControl: true,
};

// Colors per day — Hari 1 = teal (matches MT-122 accent), rest cycle
const DAY_COLORS = [
    '#14b8a6', // teal  — Hari 1
    '#f97316', // orange — Hari 2
    '#a855f7', // purple — Hari 3
    '#ec4899', // pink   — Hari 4
    '#f59e0b', // amber  — Hari 5
    '#06b6d4', // cyan   — Hari 6
    '#3b82f6', // blue   — Hari 7+
];

const isValidCoordinate = (lat: any, lng: any): boolean => {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    return !isNaN(numLat) && !isNaN(numLng) && isFinite(numLat) && isFinite(numLng)
        && !(numLat === 0 && numLng === 0);
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    bali: { lat: -8.4095, lng: 115.1889 },
    denpasar: { lat: -8.6705, lng: 115.2126 },
    jakarta: { lat: -6.2088, lng: 106.8456 },
    yogyakarta: { lat: -7.7956, lng: 110.3695 },
    surabaya: { lat: -7.2575, lng: 112.7521 },
    bandung: { lat: -6.9175, lng: 107.6191 },
    lombok: { lat: -8.6529, lng: 116.3241 },
    semarang: { lat: -6.9932, lng: 110.4203 },
    medan: { lat: 3.5952, lng: 98.6722 },
    makassar: { lat: -5.1477, lng: 119.4327 },
    palembang: { lat: -2.9761, lng: 104.7754 },
    manado: { lat: 1.4748, lng: 124.8421 },
    labuan_bajo: { lat: -8.4967, lng: 119.8888 },
    raja_ampat: { lat: -0.5649, lng: 130.5262 },
    komodo: { lat: -8.5533, lng: 119.4891 },
    singapore: { lat: 1.3521, lng: 103.8198 },
    kuala_lumpur: { lat: 3.1390, lng: 101.6869 },
    bangkok: { lat: 13.7563, lng: 100.5018 },
    tokyo: { lat: 35.6762, lng: 139.6503 },
    osaka: { lat: 34.6937, lng: 135.5023 },
    paris: { lat: 48.8566, lng: 2.3522 },
    london: { lat: 51.5074, lng: -0.1278 },
    amsterdam: { lat: 52.3676, lng: 4.9041 },
    barcelona: { lat: 41.3851, lng: 2.1734 },
    rome: { lat: 41.9028, lng: 12.4964 },
    dubai: { lat: 25.2048, lng: 55.2708 },
    sydney: { lat: -33.8688, lng: 151.2093 },
    new_york: { lat: 40.7128, lng: -74.0060 },
};

function getDestinationCoords(destination: string): { lat: number; lng: number } {
    const key = destination.toLowerCase().replace(/\s+/g, '_');
    if (CITY_COORDS[key]) return CITY_COORDS[key];
    for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (key.includes(city) || city.includes(key.split('_')[0])) return coords;
    }
    return { lat: -2.5489, lng: 118.0149 };
}

// ─── AdvancedMarker per day color ─────────────────────────────────────────────

interface AdvancedActivityMarkerProps {
    map: google.maps.Map | null;
    position: google.maps.LatLngLiteral;
    label: string;
    color: string;
    isSelected: boolean;
    zIndex: number;
    onClick: () => void;
}

function AdvancedActivityMarker({ map, position, label, color, isSelected, zIndex, onClick }: AdvancedActivityMarkerProps) {
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

    useEffect(() => {
        if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

        const size = isSelected ? 38 : 30;
        const bgColor = isSelected ? '#0f172a' : color;

        const pin = document.createElement('div');
        pin.style.cssText = `
            width:${size}px;height:${size}px;
            background:${bgColor};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2.5px solid white;
            box-shadow:0 2px 10px rgba(0,0,0,0.35);
            cursor:pointer;
            display:flex;align-items:center;justify-content:center;
            transition:all 0.2s ease;
        `;
        const inner = document.createElement('div');
        inner.style.cssText = `
            transform:rotate(45deg);
            color:white;
            font-size:${isSelected ? '12px' : '9px'};
            font-weight:800;
            font-family:sans-serif;
            line-height:1;
        `;
        inner.textContent = label;
        pin.appendChild(inner);

        const marker = new google.maps.marker.AdvancedMarkerElement({ map, position, content: pin, zIndex, title: String(label) });
        marker.addListener('click', onClick);
        markerRef.current = marker;

        return () => {
            if (markerRef.current) { markerRef.current.map = null; markerRef.current = null; }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, position.lat, position.lng, color, isSelected, zIndex, label]);

    useEffect(() => {
        const marker = markerRef.current;
        if (!marker) return;
        const listener = marker.addListener('click', onClick);
        return () => google.maps.event.removeListener(listener);
    }, [onClick]);

    return null;
}

// ─── Flat activity record with day context ────────────────────────────────────

interface ActivityWithDay {
    act: Activity;
    day: number;
    activityIndex: number;
    id: string; // "day-actIndex"
    color: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripMap({ itinerary, destination, selectedActivityId, onActivitySelect, activeDays }: TripMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
        libraries: ['marker'],
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const onLoad = useCallback((m: google.maps.Map) => setMap(m), []);
    const onUnmount = useCallback(() => setMap(null), []);

    // Build flat list with day context, filtered by activeDays
    const allPins = useMemo<ActivityWithDay[]>(() => {
        const pins: ActivityWithDay[] = [];
        itinerary.forEach((dayItem) => {
            if (activeDays && !activeDays.has(dayItem.day)) return;
            const color = DAY_COLORS[(dayItem.day - 1) % DAY_COLORS.length];
            dayItem.activities.forEach((act, actIdx) => {
                if (isValidCoordinate(act.latitude, act.longitude)) {
                    pins.push({
                        act,
                        day: dayItem.day,
                        activityIndex: actIdx,
                        id: `${dayItem.day}-${actIdx}`,
                        color,
                    });
                }
            });
        });
        return pins;
    }, [itinerary, activeDays]);

    const selectedPin = useMemo(() => allPins.find(p => p.id === selectedActivityId) || null, [allPins, selectedActivityId]);

    // Auto fit-bounds when map + pins ready
    useEffect(() => {
        if (!map) return;
        if (selectedPin && isValidCoordinate(selectedPin.act.latitude, selectedPin.act.longitude)) {
            map.panTo({ lat: selectedPin.act.latitude!, lng: selectedPin.act.longitude! });
            map.setZoom(15);
        } else if (allPins.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            allPins.forEach(p => bounds.extend({ lat: p.act.latitude!, lng: p.act.longitude! }));
            map.fitBounds(bounds, 60);
        }
    }, [map, selectedPin, allPins]);

    const center = useMemo(() => {
        if (allPins.length > 0) return { lat: allPins[0].act.latitude!, lng: allPins[0].act.longitude! };
        return getDestinationCoords(destination);
    }, [allPins, destination]);

    // Route polylines per day
    const dayRoutes = useMemo(() => {
        return itinerary.map((dayItem) => {
            const color = DAY_COLORS[(dayItem.day - 1) % DAY_COLORS.length];
            const path = dayItem.activities
                .filter(a => isValidCoordinate(a.latitude, a.longitude))
                .map(a => ({ lat: a.latitude!, lng: a.longitude! }));
            return { day: dayItem.day, color, path };
        }).filter(r => r.path.length > 1);
    }, [itinerary]);

    if (!isLoaded) return <div className="w-full h-full bg-[#0A1628] animate-pulse rounded-2xl" />;

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                options={mapOptions}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {allPins.map((pin, idx) => (
                    <AdvancedActivityMarker
                        key={`${pin.id}-${pin.id === selectedActivityId}`}
                        map={map}
                        position={{ lat: pin.act.latitude!, lng: pin.act.longitude! }}
                        label={`${pin.activityIndex + 1}`}
                        color={pin.color}
                        isSelected={pin.id === selectedActivityId}
                        zIndex={pin.id === selectedActivityId ? 100 : idx + 1}
                        onClick={() => onActivitySelect(pin.id === selectedActivityId ? null : pin.id)}
                    />
                ))}

                {dayRoutes.map(route => (
                    <Polyline
                        key={route.day}
                        path={route.path}
                        options={{
                            strokeColor: route.color,
                            strokeOpacity: 0,
                            strokeWeight: 2,
                            icons: [{
                                icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.6, scale: 3, strokeColor: route.color },
                                offset: '0',
                                repeat: '20px',
                            }],
                        }}
                    />
                ))}

                {selectedPin && isValidCoordinate(selectedPin.act.latitude, selectedPin.act.longitude) && (
                    <InfoWindow
                        position={{ lat: selectedPin.act.latitude!, lng: selectedPin.act.longitude! }}
                        onCloseClick={() => onActivitySelect(null)}
                    >
                        <div className="p-0 max-w-[220px]">
                            <MapActivityThumbnail activity={selectedPin.act} />
                            <div className="p-3">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span
                                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                                        style={{ background: selectedPin.color }}
                                    >
                                        Hari {selectedPin.day}
                                    </span>
                                    <span className="text-[11px]">{TOD_EMOJI(selectedPin.act.time)}</span>
                                </div>
                                <h5 className="font-bold text-sm mb-1 text-slate-800 line-clamp-2 leading-snug">{selectedPin.act.activity}</h5>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                    {selectedPin.act.description || selectedPin.act.description_short}
                                </p>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}

