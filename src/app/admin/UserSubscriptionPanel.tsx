'use client';

import React, { useState } from 'react';
import { Search, Crown, UserX, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminUser {
    user_id: string;
    email: string;
    name: string;
    subscription_tier: string;
    subscription_status: string;
    subscription_started_at: string | null;
    subscription_ends_at: string | null;
    created_at: string;
}

interface ActionLog {
    message: string;
    type: 'success' | 'error';
    ts: string;
}

async function adminFetch(path: string, options?: RequestInit) {
    const res = await fetch(`/api/admin${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers ?? {}),
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}

export default function UserSubscriptionPanel() {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [actioning, setActioning] = useState<string | null>(null);
    const [logs, setLogs] = useState<ActionLog[]>([]);
    const [confirm, setConfirm] = useState<{ userId: string; email: string; tier: string; days: number } | null>(null);

    const addLog = (message: string, type: 'success' | 'error') => {
        const ts = new Date().toLocaleTimeString('id-ID');
        setLogs(prev => [{ message, type, ts }, ...prev].slice(0, 20));
    };

    const handleSearch = async () => {
        if (!search.trim()) return;
        setLoading(true);
        try {
            const data = await adminFetch(`?search=${encodeURIComponent(search)}`);
            setUsers(data.data ?? []);
            if ((data.data ?? []).length === 0) addLog(`No users found for "${search}"`, 'error');
        } catch (e: any) {
            addLog(`Search failed: ${e.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!confirm) return;
        setActioning(confirm.userId);
        setConfirm(null);
        try {
            const data = await adminFetch('', {
                method: 'POST',
                body: JSON.stringify({ userId: confirm.userId, tier: confirm.tier, duration_days: confirm.days }),
            });
            addLog(data.message ?? `${confirm.tier} set for ${confirm.email}`, 'success');
            // Refresh user list
            const refreshed = await adminFetch(`?search=${encodeURIComponent(search)}`);
            setUsers(refreshed.data ?? []);
        } catch (e: any) {
            addLog(`Action failed: ${e.message}`, 'error');
        } finally {
            setActioning(null);
        }
    };

    const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <Button onClick={handleSearch} disabled={loading} className="rounded-xl bg-slate-900 hover:bg-black text-white px-5">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
            </div>

            {/* Confirm Dialog */}
            {confirm && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-amber-900">Konfirmasi Aksi</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Set <strong>{confirm.tier}</strong>
                                {confirm.tier === 'PRO' ? ` (${confirm.days} hari)` : ''} untuk{' '}
                                <strong>{confirm.email}</strong>?
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleAction} className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
                            Ya, Lanjutkan
                        </Button>
                        <Button variant="outline" onClick={() => setConfirm(null)} className="rounded-xl">
                            Batal
                        </Button>
                    </div>
                </div>
            )}

            {/* User Table */}
            {users.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">User</th>
                                <th className="px-4 py-3 text-left">Tier</th>
                                <th className="px-4 py-3 text-left">Expires</th>
                                <th className="px-4 py-3 text-left">Joined</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {users.map(u => (
                                <tr key={u.user_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900 leading-tight">{u.name || '—'}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={u.subscription_tier === 'PRO'
                                            ? 'bg-teal-100 text-teal-700 border-teal-200'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }>
                                            {u.subscription_tier === 'PRO' && <Crown className="w-3 h-3 mr-1" />}
                                            {u.subscription_tier}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{fmtDate(u.subscription_ends_at)}</td>
                                    <td className="px-4 py-3 text-slate-500">{fmtDate(u.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {actioning === u.user_id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setConfirm({ userId: u.user_id, email: u.email, tier: 'PRO', days: 30 })}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
                                                    >
                                                        PRO 30d
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirm({ userId: u.user_id, email: u.email, tier: 'PRO', days: 365 })}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                                                    >
                                                        PRO 365d
                                                    </button>
                                                    {u.subscription_tier === 'PRO' && (
                                                        <button
                                                            onClick={() => setConfirm({ userId: u.user_id, email: u.email, tier: 'FREE', days: 0 })}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                                                        >
                                                            <UserX className="w-3 h-3 inline mr-1" />
                                                            Downgrade
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Action Logs */}
            {logs.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Action Log</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg font-mono ${
                                log.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
                            }`}>
                                {log.type === 'success'
                                    ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                }
                                <span>[{log.ts}] {log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
