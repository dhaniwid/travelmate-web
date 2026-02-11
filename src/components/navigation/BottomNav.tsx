'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Map, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';

export default function BottomNav() {
    const pathname = usePathname();
    const { isSignedIn } = useAuth();

    // Don't show if not signed in or on auth pages
    if (!isSignedIn) return null;

    const navItems = [
        { href: '/dashboard', icon: Home, label: 'Home' },
        { href: '/history', icon: Map, label: 'My Trips' },
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200 safe-area-bottom pb-safe">
            <div className="flex items-center justify-around h-16 pb-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-300 w-full h-full",
                                isActive ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-full transition-all duration-300",
                                isActive ? "bg-teal-50" : "bg-transparent"
                            )}>
                                <Icon className={cn(
                                    "w-6 h-6 transition-all duration-300",
                                    isActive && "fill-current"
                                )} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold transition-all duration-300",
                                isActive ? "scale-105" : "scale-100 opacity-80"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
