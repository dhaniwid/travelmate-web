'use client';

import Image from 'next/image';

interface EmptyStateNoTripProps {
    onCreateTrip: () => void;
}

export default function EmptyStateNoTrip({ onCreateTrip }: EmptyStateNoTripProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-10 px-6 bg-zinc-50 border border-zinc-200 rounded-2xl animate-in fade-in zoom-in-95 duration-500">
            <Image
                src="/assets/illustrations/empty-state-no-trip.svg"
                alt="Belum ada trip"
                width={120}
                height={120}
                className="mb-4 select-none"
                draggable={false}
                unoptimized
            />

            <h3 className="text-[20px] font-bold text-zinc-950 leading-snug mb-1.5">
                Belum ada trip nih!
            </h3>
            <p className="text-[14px] text-zinc-500 max-w-[260px] leading-relaxed mb-5">
                Kopermu siap — mulai rencanakan tujuan pertamamu.
            </p>

            <button
                type="button"
                onClick={onCreateTrip}
                className="h-12 px-7 rounded-xl bg-zinc-950 hover:bg-zinc-800 active:scale-95 text-white text-[14px] font-semibold transition-all"
            >
                Buat Trip Pertamamu
            </button>
        </div>
    );
}
