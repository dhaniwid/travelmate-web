'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
    iconClassName?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
    iconClassName
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center p-12 rounded-[32px] border border-dashed border-slate-200 bg-slate-50/50 animate-in fade-in zoom-in-95 duration-500",
            className
        )}>
            <div className={cn(
                "w-20 h-20 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center mb-6 ring-8 ring-slate-100/50",
                iconClassName
            )}>
                <Icon className="w-10 h-10 text-teal-600" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {title}
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mb-8 leading-relaxed">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="h-12 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
