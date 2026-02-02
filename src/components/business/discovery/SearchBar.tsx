import React from 'react';
import {Search, Loader2, X} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';

interface SearchBarProps {
    city: string;
    setCity: (v: string) => void;
    onSearch: () => void;
    isLoading: boolean;
    isCompact: boolean;
}

export default function SearchBar({
                                      city,
                                      setCity,
                                      onSearch,
                                      isLoading,
                                      isCompact
                                  }: SearchBarProps) {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`relative w-full group transition-all duration-700 ${isCompact ? 'max-w-md ml-auto md:ml-0' : 'max-w-lg mx-auto'}`}
        >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`w-5 h-5 ${isLoading ? 'text-teal-500' : 'text-slate-400'}`}/>
            </div>

            <Input
                type="text"
                placeholder="Where to next? (e.g. Labuan Bajo)"
                className={`pl-12 pr-24 rounded-full shadow-lg shadow-teal-900/5 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500 transition-all ${isCompact ? 'h-10 text-sm' : 'h-14 text-lg bg-white/80 backdrop-blur-sm'}`}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isLoading}
            />

            {city && !isLoading && (
                <button
                    type="button"
                    onClick={() => setCity('')}
                    className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-4 h-4"/>
                </button>
            )}

            <div className="absolute inset-y-1 right-1">
                <Button
                    type="submit"
                    size="sm"
                    className={`rounded-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-md ${isCompact ? 'h-8 px-4' : 'h-12 px-8 text-base font-semibold'}`}
                    disabled={isLoading}
                >
                    {/* Menggunakan key memaksa React me-rerender text saat loading berubah */}
                    <span key={isLoading ? "loading" : "idle"}>
                         {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Discover"}
                    </span>
                </Button>
            </div>
        </form>
    );
}