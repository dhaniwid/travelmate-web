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
    onSelectDestination?: (destinationName: string) => void;
    placeholder?: string;
    buttonLabel?: string;
    isLoading?: boolean;
    isCompact?: boolean;
}

export default function SearchBar({
    city: externalCity,
    setCity: setExternalCity,
    onSelectDestination,
    placeholder = 'Mau ke mana?',
    buttonLabel = 'Eksplor →',
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
        setOpen(true);
    }

    function navigate(slugOrName: string, isSlug = true) {
        setOpen(false);
        const dest = isSlug ? getDestination(slugOrName) : undefined;
        const displayName = dest?.name ?? slugOrName.trim();
        setQuery(displayName);
        setExternalCity?.(displayName);

        if (onSelectDestination) {
            onSelectDestination(displayName);
            return;
        }

        const targetSlug = dest?.slug ?? slugify(displayName);
        router.push(`/explore/${targetSlug}`);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) {
            if (onSelectDestination) {
                onSelectDestination('');
            }
            return;
        }

        if (activeIndex >= 0 && suggestions[activeIndex]) {
            navigate(suggestions[activeIndex], true);
            return;
        }

        // Exact match with a curated suggestion or use custom typed destination
        const exactSlug = suggestions.find((s) => {
            const d = getDestination(s);
            return d?.name.toLowerCase() === query.trim().toLowerCase() || s === slugify(query);
        });

        if (exactSlug) {
            navigate(exactSlug, true);
        } else {
            navigate(query.trim(), false);
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
        <div ref={containerRef} className={`relative w-full ${isCompact ? 'max-w-md ml-auto md:ml-0' : 'w-full'}`}>
            <form onSubmit={handleSubmit} className="relative group">
                {/* Search icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Search className={`w-5 h-5 ${isLoading ? 'text-teal-600' : 'text-zinc-900'}`} />
                </div>

                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    autoComplete="off"
                    className={`pl-12 pr-32 rounded-xl border-0 bg-zinc-100 text-zinc-950 placeholder:text-zinc-500 font-medium ring-1 ring-zinc-200/80 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-zinc-950 transition-all ${
                        isCompact ? 'h-11 text-sm' : 'h-14 text-base md:text-lg'
                    } ${open ? 'rounded-b-none bg-white ring-2 ring-zinc-950' : ''}`}
                    value={query}
                    onChange={(e) => updateQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.trim().length >= 2 && setOpen(true)}
                    disabled={isLoading}
                />

                {/* Clear button */}
                {query && !isLoading && (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); setExternalCity?.(''); setSuggestions([]); setOpen(false); inputRef.current?.focus(); }}
                        className="absolute right-28 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Submit button */}
                <div className="absolute inset-y-1.5 right-1.5 z-10">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`rounded-lg bg-zinc-950 hover:bg-zinc-800 active:bg-black text-white font-semibold transition-colors ${
                            isCompact ? 'h-8 px-4 text-xs' : 'h-11 px-5 text-sm'
                        }`}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </form>

            {/* Autocomplete dropdown */}
            {open && query.trim().length >= 2 && (
                <ul
                    role="listbox"
                    className="absolute left-0 right-0 bg-white border-2 border-zinc-950 border-t border-t-zinc-200 rounded-b-xl shadow-xl z-50 overflow-hidden"
                >
                    {suggestions.map((slug, i) => {
                        const dest = getDestination(slug);
                        if (!dest) return null;
                        return (
                            <li
                                key={slug}
                                role="option"
                                aria-selected={i === activeIndex}
                                onMouseDown={() => navigate(slug, true)}
                                onMouseEnter={() => setActiveIndex(i)}
                                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-zinc-100 last:border-b-0 ${
                                    i === activeIndex
                                        ? 'bg-zinc-100 text-zinc-950'
                                        : 'text-zinc-800 hover:bg-zinc-50'
                                }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                    <Search className="w-4 h-4 text-zinc-700" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="font-bold text-sm text-zinc-950 block">{dest.name}</span>
                                    <span className="text-zinc-500 text-xs line-clamp-1">{dest.tagline}</span>
                                </div>
                            </li>
                        );
                    })}
                    {/* Always allow custom destination planning for any typed city */}
                    {!suggestions.some((s) => getDestination(s)?.name.toLowerCase() === query.trim().toLowerCase()) && (
                        <li
                            role="option"
                            aria-selected={ false }
                            onMouseDown={() => navigate(query.trim(), false)}
                            className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors bg-zinc-50 hover:bg-zinc-100 text-zinc-950"
                        >
                            <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center flex-shrink-0">
                                <Search className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="font-bold text-sm text-zinc-950 block">
                                    Eksplor &ldquo;{query.trim()}&rdquo;
                                </span>
                                <span className="text-teal-700 text-xs font-medium">
                                    Lihat tempat eksotis, kuliner & susun itinerary →
                                </span>
                            </div>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
