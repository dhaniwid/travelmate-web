'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Activity } from '@/types';
import { getSmartImage } from '@/utils/image-generator';

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
            .filter(({ act }) => act.latitude !== undefined && act.longitude !== undefined);
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
        if (map && selectedActivity && selectedActivity.latitude && selectedActivity.longitude) {
            map.panTo({ lat: selectedActivity.latitude, lng: selectedActivity.longitude });
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
                            icon={isSelected ? {
                                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                                scaledSize: new google.maps.Size(40, 40)
                            } : undefined}
                            label={{
                                text: (originalIndex + 1).toString(),
                                color: isSelected ? '#42707D' : 'white',
                                fontWeight: 'bold',
                            }}
                            onClick={() => onActivitySelect(isSelected ? null : activityId)}
                        />
                    );
                })}

                <Polyline
                    path={path}
                    options={{
                        strokeColor: '#42707D',
                        strokeOpacity: 0.8,
                        strokeWeight: 3,
                        icons: [{
                            icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
                            offset: '0',
                            repeat: '20px'
                        }]
                    }}
                />

                {selectedActivity && selectedActivity.latitude && selectedActivity.longitude && (
                    <InfoWindow
                        position={{ lat: selectedActivity.latitude, lng: selectedActivity.longitude }}
                        onCloseClick={() => onActivitySelect(null)}
                    >
                        <div className="p-2 max-w-[200px]">
                            <img
                                src={getSmartImage(`${selectedActivity.activity} in ${destination}`, 'activity')}
                                alt={selectedActivity.activity}
                                className="w-full h-24 object-cover rounded-lg mb-2"
                            />
                            <h5 className="font-bold text-sm mb-1">{selectedActivity.activity}</h5>
                            <p className="text-xs text-slate-500 line-clamp-2">{selectedActivity.description}</p>
                            <span className="text-[10px] font-bold text-teal-600 uppercase mt-2 block">{selectedActivity.time}</span>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
