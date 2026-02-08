import React from 'react';

const HIGHLIGHTS = [
    {
        title: "Sightseeing",
        label: "Fuji",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80",
    },
    {
        title: "Culinary",
        label: "Sushi",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80",
    },
    {
        title: "Culture",
        label: "Temple",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80", // Placeholder, will fix Sushi/Temple later
    }
];

export default function HighlightsRow() {
    return (
        <div className="flex flex-wrap justify-center gap-6 py-8">
            {HIGHLIGHTS.map((h, i) => (
                <div key={i} className="group relative h-32 w-56 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
                    <img
                        src={h.image}
                        alt={h.label}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-0.5">{h.title}</p>
                        <p className="font-bold text-lg leading-tight">{h.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
