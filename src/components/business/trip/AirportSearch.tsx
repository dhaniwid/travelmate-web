'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Plane, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Location, searchLocations } from '@/services/flightService';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';

interface AirportSearchProps {
    value: string;
    onChange: (value: Location | null) => void; // Pass full location object on select
    placeholder?: string;
    className?: string;
}

export default function AirportSearch({ value, onChange, placeholder = "Search airport...", className }: AirportSearchProps) {
    const { getToken } = useAuth(); // Add auth hook
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Simple debounce implementation if hook doesn't exist
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 500);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const fetchLocations = async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const token = await getToken(); // Get token
                const data = await searchLocations(debouncedQuery, token); // Pass token
                setResults(data || []);
                setOpen(true);
            } catch (error) {
                console.error("Failed to search locations", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if query is different from current value (to avoid refetching on select)
        if (debouncedQuery !== value) {
            fetchLocations();
        }
    }, [debouncedQuery, value]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (loc: Location) => {
        setQuery(loc.iata_code);
        onChange(loc);
        setOpen(false);
    };

    const handleClear = () => {
        setQuery('');
        onChange(null);
        setResults([]);
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => {
                        if ((results?.length ?? 0) > 0) setOpen(true);
                    }}
                    placeholder={placeholder}
                    className="pl-9 pr-8 text-slate-900 placeholder:text-slate-400"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {open && (query.length >= 2) && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 flex items-center justify-center text-slate-500 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Searching...
                        </div>
                    ) : (results?.length ?? 0) > 0 ? (
                        <ul className="py-1">
                            {results.map((loc, i) => (
                                <li
                                    key={i}
                                    onClick={() => handleSelect(loc)}
                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        loc.type === 'AIRPORT' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {loc.type === 'AIRPORT' ? <Plane className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-900 text-sm truncate">{loc.name}</span>
                                            <span className="font-black text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2">{loc.iata_code}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">{loc.city_name}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
