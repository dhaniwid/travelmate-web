'use client';

import React from 'react';
// Hapus useRouter karena kita tidak mau redirect
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreateTripForm from '@/components/business/CreateTripForm';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@radix-ui/react-dialog';

interface TripPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDestination: string;
    initialIsSurprise?: boolean;
    onTripGenerated: (data: any) => void;
}

export default function TripPlannerModal({ isOpen, onClose, initialDestination, initialIsSurprise = false, onTripGenerated }: TripPlannerModalProps) {

    const handleSuccess = (data: any) => {
        // Data format: { trip: {...}, plan: {...} }

        // 1. Kirim data ke Parent (HomePage) agar bisa ditampilkan
        onTripGenerated(data);

        // 2. Tutup Modal
        onClose();

        // ❌ HAPUS: router.push(...)
        // Kita tidak mau pindah halaman otomatis
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-none shadow-none">
                <VisuallyHidden.Root>
                    <DialogTitle>Create Trip</DialogTitle>
                </VisuallyHidden.Root>
                <CreateTripForm
                    key={isOpen ? 'open' : 'closed'}
                    onSuccess={handleSuccess}
                    initialDestination={initialDestination}
                    initialIsSurprise={initialIsSurprise}
                />
            </DialogContent>
        </Dialog>
    );
}