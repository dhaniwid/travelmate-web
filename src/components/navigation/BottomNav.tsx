'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Compass, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';

export default function BottomNav() {
    const pathname = usePathname();
    const { isSignedIn } = useAuth();

    // Show on top-level screens — Dashboard, Explore index, and Profile
    const isAllowedPath =
        pathname === '/dashboard' ||
        pathname === '/explore' ||
        pathname === '/profile';

    if (!isSignedIn || !isAllowedPath) return null;

    const navItems = [
        { href: '/dashboard', icon: Home, label: 'Beranda', match: (p: string) => p === '/dashboard' },
        { href: '/explore', icon: Compass, label: 'Eksplor', match: (p: string) => p === '/explore' || p.startsWith('/explore/') },
        { href: '/profile', icon: User, label: 'Profil', match: (p: string) => p === '/profile' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center justify-around h-16 relative">
                {navItems.map((item) => {
                    const isActive = item.match(pathname || '');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-colors duration-200 w-full h-full",
                                isActive ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-700"
                            )}
                        >
                            <div className="relative p-1">
                                <Icon className={cn(
                                    "w-5 h-5 transition-all duration-200",
                                    isActive ? "stroke-[2.5px] text-zinc-950" : "stroke-[1.75px]"
                                )} />
                            </div>
                            <span className={cn(
                                "text-[11px] tracking-tight transition-all duration-200",
                                isActive ? "font-bold text-zinc-950" : "font-medium text-zinc-500"
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

