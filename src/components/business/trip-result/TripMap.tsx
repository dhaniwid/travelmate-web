'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Activity } from '@/types';
import { MapActivityThumbnail } from '@/components/business/MapActivityThumbnail';

interface TripMapProps {
    activities: Activity[];
    destination: string;
    activeDay: number;
    selectedActivityId: string | null;
    onActivitySelect: (id: string | null) => void;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const options = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "poi",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "stylers": [{ "visibility": "off" }]
        }
    ]
};

const isValidCoordinate = (lat: any, lng: any): boolean => {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    return !isNaN(numLat) && !isNaN(numLng) && isFinite(numLat) && isFinite(numLng);
};

// Custom Marker Icons (SVG Paths)
const getMarkerIcon = (type: string, isSelected: boolean) => {
    const scale = isSelected ? 1.4 : 1.0;
    const strokeColor = isSelected ? '#ffffff' : '#ffffff';
    const strokeWidth = isSelected ? 2 : 1;

    // Default Pin Shape (replaces standard marker)
    let path = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z";
    let fillColor = "#64748b"; // Slate-500 default

    const t = type?.toLowerCase() || "";

    if (t.includes('culinary') || t.includes('eat') || t.includes('food') || t.includes('lunch') || t.includes('dinner')) {
        fillColor = "#f97316"; // Orange-500
        // Fork/Knife simplified or just color distinction for now to keep SVG path simple
        // Using standard pin shape but color coded is often cleaner than complex paths in Google Maps
    } else if (t.includes('sight') || t.includes('visit') || t.includes('explore')) {
        fillColor = "#3b82f6"; // Blue-500
    } else if (t.includes('relax') || t.includes('leisure') || t.includes('spa')) {
        fillColor = "#14b8a6"; // Teal-500
    }

    return {
        path: path,
        fillColor: fillColor,
        fillOpacity: 1,
        strokeWeight: strokeWidth,
        strokeColor: strokeColor,
        scale: 1.5 * scale,
        anchor: new google.maps.Point(12, 24),
        labelOrigin: new google.maps.Point(12, 9)
    };
};

export default function TripMap({
    activities,
    destination,
    activeDay,
    selectedActivityId,
    onActivitySelect
}: TripMapProps) {
    if (!activities) return null;

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Filter activities with valid coordinates and keep track of original index
    const validActivities = useMemo(() => {
        return activities
            .map((act, originalIndex) => ({ act, originalIndex }))
            .filter(({ act }) => isValidCoordinate(act.latitude, act.longitude));
    }, [activities]);

    // Find the currently selected activity object from the ID
    const selectedActivity = useMemo(() => {
        if (!selectedActivityId) return null;
        const [dayStr, indexStr] = selectedActivityId.split('-');
        const index = parseInt(indexStr);
        if (dayStr === activeDay.toString() && activities[index]) {
            return activities[index];
        }
        return null;
    }, [selectedActivityId, activeDay, activities]);

    // Fly-To Effect
    useEffect(() => {
        if (map && selectedActivity && isValidCoordinate(selectedActivity.latitude, selectedActivity.longitude)) {
            map.panTo({ lat: selectedActivity.latitude!, lng: selectedActivity.longitude! });
            map.setZoom(15);
        }
    }, [map, selectedActivity]);

    const center = useMemo(() => {
        if (validActivities.length > 0) {
            return {
                lat: validActivities[0].act.latitude!,
                lng: validActivities[0].act.longitude!,
            };
        }
        return { lat: -6.2, lng: 106.8 }; // Default (Jakarta)
    }, [validActivities]);

    const path = useMemo(() => {
        return validActivities.map(({ act }) => ({
            lat: act.latitude!,
            lng: act.longitude!,
        }));
    }, [validActivities]);

    if (!isLoaded) return <div className="w-full h-full bg-slate-100 animate-pulse rounded-3xl" />;

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                options={options}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {validActivities.map(({ act, originalIndex }, index) => {
                    const activityId = `${activeDay}-${originalIndex}`;
                    const isSelected = selectedActivityId === activityId;

                    return (
                        <Marker
                            key={index}
                            position={{ lat: act.latitude!, lng: act.longitude! }}
                            zIndex={isSelected ? 100 : 1}
                            icon={getMarkerIcon(act.type || '', isSelected)}
                            label={{
                                text: (originalIndex + 1).toString(),
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 'bold',
                            }}
                            onClick={() => onActivitySelect(isSelected ? null : activityId)}
                        />
                    );
                })}

                {path.length > 1 && (
                    <Polyline
                        path={path}
                        options={{
                            strokeColor: '#334155', // Dark Slate
                            strokeOpacity: 0,       // Hide solid line
                            strokeWeight: 2,
                            icons: [{
                                icon: {
                                    path: 'M 0,-1 0,1',
                                    strokeOpacity: 1,
                                    scale: 3,
                                    strokeColor: '#334155'
                                },
                                offset: '0',
                                repeat: '20px'
                            }]
                        }}
                    />
                )}

                {selectedActivity && isValidCoordinate(selectedActivity.latitude, selectedActivity.longitude) && (
                    <InfoWindow
                        position={{ lat: selectedActivity.latitude!, lng: selectedActivity.longitude! }}
                        onCloseClick={() => onActivitySelect(null)}
                    >
                        <div className="p-0 max-w-[220px]">
                            <MapActivityThumbnail activity={selectedActivity} />

                            <div className="p-3">
                                <h5 className="font-bold text-sm mb-1 text-slate-800 line-clamp-1">{selectedActivity.activity}</h5>
                                <p className="text-xs text-slate-500 line-clamp-2">{selectedActivity.description}</p>
                                <span className="text-[10px] font-bold text-teal-600 uppercase mt-2 block">{selectedActivity.time}</span>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
