'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { getAllDestinationSlugs, getDestination } from '@/data/destinations';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

function fuzzyMatch(query: string, target: string): boolean {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    if (t.includes(q)) return true;
    // Simple character-sequence match
    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
        if (t[i] === q[qi]) qi++;
    }
    return qi === q.length;
}

interface SearchBarProps {
    // Legacy props kept so existing callers don't break
    city?: string;
    setCity?: (v: string) => void;
    onSearch?: () => void;
    isLoading?: boolean;
    isCompact?: boolean;
}

export default function SearchBar({
    city: externalCity,
    setCity: setExternalCity,
    isLoading = false,
    isCompact = false,
}: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState(externalCity ?? '');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep external state in sync if parent controls value
    useEffect(() => {
        if (externalCity !== undefined && externalCity !== query) {
            setQuery(externalCity);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [externalCity]);

    const allSlugs = getAllDestinationSlugs();

    function updateQuery(value: string) {
        setQuery(value);
        setExternalCity?.(value);
        setActiveIndex(-1);

        if (value.trim().length < 2) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        const matched = allSlugs.filter((slug) => {
            const dest = getDestination(slug);
            if (!dest) return false;
            return fuzzyMatch(value, dest.name) || fuzzyMatch(value, slug);
        });

        setSuggestions(matched);
        setOpen(matched.length > 0);
    }

    function navigate(slug: string) {
        setOpen(false);
        const dest = getDestination(slug);
        const displayName = dest?.name ?? slug;
        setQuery(displayName);
        setExternalCity?.(displayName);
        router.push(`/explore/${slug}`);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;

        if (activeIndex >= 0 && suggestions[activeIndex]) {
            navigate(suggestions[activeIndex]);
            return;
        }

        // Match first suggestion or slugify unknown input
        if (suggestions.length > 0) {
            navigate(suggestions[0]);
        } else {
            router.push(`/explore/${slugify(query)}`);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!open) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, -1));
        } else if (e.key === 'Escape') {
            setOpen(false);
            setActiveIndex(-1);
        }
    }

    // Close dropdown on outside click
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative w-full ${isCompact ? 'max-w-md ml-auto md:ml-0' : 'max-w-lg mx-auto'}`}>
            <form onSubmit={handleSubmit} className="relative group">
                {/* Search icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Search className={`w-5 h-5 ${isLoading ? 'text-teal-600' : 'text-slate-400'}`} />
                </div>

                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Mau ke mana?"
                    autoComplete="off"
                    className={`pl-12 pr-24 rounded-full shadow-lg shadow-teal-900/5 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-600 transition-all ${
                        isCompact ? 'h-10 text-sm' : 'h-14 text-lg bg-white/80 backdrop-blur-sm'
                    } ${open ? 'rounded-b-none ring-teal-600' : ''}`}
                    value={query}
                    onChange={(e) => updateQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    disabled={isLoading}
                />

                {/* Clear button */}
                {query && !isLoading && (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); setExternalCity?.(''); setSuggestions([]); setOpen(false); inputRef.current?.focus(); }}
                        className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Submit button */}
                <div className="absolute inset-y-1 right-1 z-10">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`rounded-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold shadow-md shadow-teal-900/10 transition-colors ${
                            isCompact ? 'h-8 px-4 text-sm' : 'h-12 px-8 text-base'
                        }`}
                    >
                        Explore →
                    </button>
                </div>
            </form>

            {/* Autocomplete dropdown */}
            {open && suggestions.length > 0 && (
                <ul
                    role="listbox"
                    className="absolute left-0 right-0 bg-white border border-teal-200 border-t-0 rounded-b-2xl shadow-xl z-50 overflow-hidden"
                >
                    {suggestions.map((slug, i) => {
                        const dest = getDestination(slug);
                        if (!dest) return null;
                        return (
                            <li
                                key={slug}
                                role="option"
                                aria-selected={i === activeIndex}
                                onMouseDown={() => navigate(slug)}
                                onMouseEnter={() => setActiveIndex(i)}
                                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                                    i === activeIndex
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-sm">{dest.name}</span>
                                    <span className="text-slate-400 text-xs ml-2 italic line-clamp-1">{dest.tagline}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
