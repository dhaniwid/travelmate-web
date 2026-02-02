import React from 'react';

interface HeroHeaderProps {
    isCompact: boolean;
}

export default function HeroHeader({ isCompact }: HeroHeaderProps) {
    return (
        <div className={`transition-all duration-700 ease-in-out ${isCompact ? 'text-left' : 'text-center'}`}>
            <h1 className={`${isCompact ? 'text-2xl' : 'text-5xl md:text-7xl'} font-black text-slate-900 tracking-tight transition-all`}>
                Travel<span className="text-teal-600">Mate</span><span className="text-orange-500">.</span>
            </h1>
            {!isCompact && (
                <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mt-4 animate-in fade-in slide-in-from-bottom-2 font-medium">
                    Don't just plan. <span className="text-teal-700 font-bold">Dream first.</span>
                    <br />Discover the soul of a city before you book.
                </p>
            )}
        </div>
    );
}