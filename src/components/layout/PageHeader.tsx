'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { UserButton } from '@clerk/nextjs';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    className?: string;
    showUserButton?: boolean;
}

export default function PageHeader({
    title,
    subtitle,
    rightElement,
    className,
    showUserButton = true
}: PageHeaderProps) {
    return (
        <div className={cn("bg-slate-900 text-white rounded-b-[2.5rem] pt-8 pb-12 mb-6 shadow-xl shadow-slate-900/10 relative z-20", className)}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-white/95">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-slate-400 font-medium text-sm lg:text-base">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Right Action */}
                    <div className="flex items-center gap-4">
                        {rightElement}
                        {showUserButton && (
                            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/5 hover:bg-white/20 transition-all">
                                <UserButton afterSignOutUrl="/" appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-8 h-8 md:w-9 md:h-9"
                                    }
                                }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
