'use client';

import React, { useEffect } from 'react';
import CreateTripForm from '@/components/business/CreateTripForm';

interface TripPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDestination: string;
    initialIsSurprise?: boolean;
    initialSocialVal?: number;
    initialTheme?: string;
    onTripGenerated: (data: any) => void;
}

export default function TripPlannerModal({ isOpen, onClose, initialDestination, initialIsSurprise = false, initialSocialVal = 50, initialTheme = '', onTripGenerated }: TripPlannerModalProps) {
    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSuccess = (data: any) => {
        onTripGenerated(data);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex flex-col justify-end md:justify-center md:items-center"
            role="dialog"
            aria-modal="true"
            aria-label="Buat itinerary baru"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet — slides up on mobile, centered on desktop */}
            <div className="relative w-full md:max-w-xl z-10 animate-in slide-in-from-bottom duration-300 md:animate-in md:zoom-in-95 md:duration-200">
                <CreateTripForm
                    key={isOpen ? 'open' : 'closed'}
                    onSuccess={handleSuccess}
                    onClose={onClose}
                    initialDestination={initialDestination}
                    initialIsSurprise={initialIsSurprise}
                    initialSocialVal={initialSocialVal}
                    initialTheme={initialTheme}
                />
            </div>
        </div>
    );
}
