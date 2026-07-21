'use client';

import Image from 'next/image';

interface EmptyStateNoTripProps {
    onCreateTrip: () => void;
}

export default function EmptyStateNoTrip({ onCreateTrip }: EmptyStateNoTripProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-10 px-6 animate-in fade-in zoom-in-95 duration-500">
            <Image
                src="/assets/illustrations/empty-state-no-trip.svg"
                alt="Belum ada trip"
                width={144}
                height={144}
                className="mb-5 select-none"
                draggable={false}
                unoptimized
            />

            <h3 className="text-[20px] font-bold text-white leading-snug mb-2">
                Belum ada trip nih!
            </h3>
            <p className="text-[14px] text-white/50 max-w-[260px] leading-relaxed mb-5">
                Kopermu siap — mulai rencanakan tujuan pertamamu.
            </p>

            <button
                type="button"
                onClick={onCreateTrip}
                className="h-12 px-7 rounded-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-white text-[14px] font-semibold transition-all shadow-lg shadow-teal-900/30"
            >
                Buat Trip Pertamamu
            </button>
        </div>
    );
}
