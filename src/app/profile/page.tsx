'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Award, MapPin } from 'lucide-react';
import React from 'react';

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const { signOut, openUserProfile } = useClerk();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse w-32 h-32 rounded-full bg-slate-200"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32 safe-area-bottom">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-teal-600 to-blue-600 pt-16 pb-24 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />

                <div className="text-center relative z-10 px-6">
                    <div className="relative inline-block">
                        <img
                            src={user?.imageUrl}
                            alt={user?.firstName || 'User'}
                            className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-xl object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-teal-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-white mt-4 tracking-tight">
                        {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-teal-100 font-medium text-sm flex items-center justify-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> Traveler Since {new Date(user?.createdAt || Date.now()).getFullYear()}
                    </p>
                </div>
            </div>

            {/* Content Container - Overlapping header */}
            <div className="max-w-md mx-auto px-4 -mt-12 relative z-20 space-y-6">

                {/* Travel DNA Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800">Travel DNA</h2>
                        <Button variant="ghost" size="sm" className="text-teal-600 h-8 px-2 text-xs hover:bg-teal-50 hover:text-teal-700">Edit</Button>
                    </div>

                    <div className="space-y-4">
                        <PreferenceRow
                            label="Pace"
                            value="Balanced"
                            description="Mixed sightseeing & chill"
                            icon="☯️"
                        />
                        <PreferenceRow
                            label="Diet"
                            value="No Restrictions"
                            description="Open to try anything"
                            icon="🍽️"
                        />
                        <PreferenceRow
                            label="Budget"
                            value="Medium"
                            description="Comfort over luxury"
                            icon="💰"
                        />
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-2xl shadow-lg p-2 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-14 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl px-4"
                        onClick={() => openUserProfile()}
                    >
                        <Settings className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-500 transition-colors" />
                        Manage Account
                    </Button>
                    <div className="h-px bg-slate-100 mx-4" />
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-14 text-rose-600 font-medium hover:bg-rose-50 hover:text-rose-700 rounded-xl px-4"
                        onClick={() => signOut({ redirectUrl: '/' })}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </Button>
                </div>

                <p className="text-center text-xs text-slate-400 py-4 font-medium">
                    TravelMate AI v1.0.0
                </p>
            </div>
        </div>
    );
}

function PreferenceRow({ label, value, description, icon }: { label: string, value: string, description: string, icon: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
                <span className="text-xl bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm">{icon}</span>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-teal-400 group-hover:scale-125 transition-transform" />
        </div>
    );
}
