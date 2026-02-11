'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TripSectionNavProps {
    className?: string;
}

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'map', label: 'Map' },
    { id: 'essentials', label: 'Essentials' },
];

export default function TripSectionNav({ className }: TripSectionNavProps) {
    const [activeSection, setActiveSection] = useState('overview');

    useEffect(() => {
        const observers = new Map();

        const callback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(callback, {
            rootMargin: '-100px 0px -70% 0px',
            threshold: 0
        });

        SECTIONS.forEach((section) => {
            const el = document.getElementById(section.id);
            if (el) {
                observer.observe(el);
                observers.set(section.id, el);
            }
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 120; // Logistics bar + Section nav height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <nav className={cn(
            "sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm",
            className
        )}>
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center gap-8 h-14 overflow-x-auto no-scrollbar">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={cn(
                                "text-sm font-bold whitespace-nowrap transition-all relative h-full flex items-center px-1",
                                activeSection === section.id
                                    ? "text-teal-600"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {section.label}
                            {activeSection === section.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}
