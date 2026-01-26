'use client';

import {MapContainer, TileLayer, Marker, Popup, Polyline} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {ItineraryItem} from '@/types';
import L from 'leaflet';
import {useEffect, useState} from 'react';

// --- FIX ICON LEAFLET YANG HILANG DI NEXT.JS ---
// Leaflet punya bug klasik dengan icon default webpack. Kita ganti dengan CDN.
const iconDefault = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icon khusus untuk urutan (Opsional, pakai default dulu biar cepat)

export default function ItineraryMap({days}: { days: ItineraryItem[] }) {
    // Kumpulkan semua titik koordinat yang valid
    const allPoints: { lat: number; lng: number; name: string; day: number }[] = [];

    days.forEach(day => {
        day.activities.forEach(act => {
            // Filter koordinat 0 atau null (jika AI gagal generate)
            if (act.latitude && act.longitude && act.latitude !== 0) {
                allPoints.push({
                    lat: act.latitude,
                    lng: act.longitude,
                    name: `Day ${day.day}: ${act.place_name}`,
                    day: day.day
                });
            }
        });
    });

    // Jika tidak ada point, jangan render map
    if (allPoints.length === 0) return null;

    // Hitung titik tengah (Center)
    const centerLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
    const centerLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 z-0">
            <MapContainer
                center={[centerLat, centerLng]}
                zoom={12}
                scrollWheelZoom={false}
                style={{height: "100%", width: "100%"}}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Markers */}
                {allPoints.map((point, idx) => (
                    <Marker key={idx} position={[point.lat, point.lng]} icon={iconDefault}>
                        <Popup>
                            <span className="font-bold">{point.name}</span>
                        </Popup>
                    </Marker>
                ))}

                {/* Render Garis Rute (Polyline) per Hari */}
                {days.map((day, i) => {
                    const route = day.activities
                        .filter(a => a.latitude && a.latitude !== 0)
                        .map(a => [a.latitude, a.longitude] as [number, number]);

                    // Warna beda tiap hari (Cycle colors)
                    const colors = ['blue', 'red', 'green', 'purple', 'orange'];
                    const color = colors[i % colors.length];

                    return <Polyline key={i} positions={route} pathOptions={{color: color, weight: 4, opacity: 0.7}}/>;
                })}
            </MapContainer>
        </div>
    );
}