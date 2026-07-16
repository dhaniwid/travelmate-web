import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Map, TrendingUp, Activity, Lock, UserPlus, BarChart2 } from "lucide-react";
import KnowledgeFeedPanel from "./KnowledgeFeedPanel";
import UserSubscriptionPanel from "./UserSubscriptionPanel";
import LandmarkConfigPanel from "./LandmarkConfigPanel";
import ValidationQueuePanel from "./ValidationQueuePanel";

// FORCE DYNAMIC: Always fetch fresh stats
export const dynamic = "force-dynamic";

interface EventBreakdown {
    event_type: string;
    count: number;
}

interface AdminStats {
    total_users: number;
    total_trips: number;
    premium_users: number;
    conversion_rate_pct: number;
    events_last_24h: number;
    trips_created_24h: number;
    new_users_today: number;
    recent_activity: { id: string; user_id: string; event_type: string; created_at: string }[];
    event_breakdown: EventBreakdown[];
}

async function getAdminStats(): Promise<AdminStats | null> {
    try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8889/api/v1').replace(/\/+$/, '');
        const res = await fetch(`${apiBase}/admin/stats`, {
            headers: {
                "X-Admin-Secret": process.env.ADMIN_SECRET ?? "",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("[Admin] Failed to fetch stats:", res.status, await res.text());
            return null;
        }

        return res.json();
    } catch (e) {
        console.error("[Admin] Error fetching stats:", e);
        return null;
    }
}

export default async function AdminDashboard() {
    const user = await currentUser();

    const adminEmails = ["dhaniwid@gmail.com", "admin@miru.travel", "widodo.apple@gmail.com"];
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!user || !userEmail || !adminEmails.includes(userEmail)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <Lock className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-gray-500">You do not have permission to view this page.</p>
            </div>
        );
    }

    const stats = await getAdminStats();
    const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' });

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Miru Admin</h1>
                        <p className="text-muted-foreground text-sm mt-1">Last updated: {now} WIB</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Live Data
                        </Badge>
                        <div className="text-sm text-gray-500">
                            {user.firstName || userEmail}
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_users ?? '—'}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats?.new_users_today ?? 0} new today
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                            <Map className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_trips ?? '—'}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats?.trips_created_24h ?? 0} in last 24h
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">PRO Conversion</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.conversion_rate_pct !== undefined
                                    ? `${stats.conversion_rate_pct.toFixed(1)}%`
                                    : '—'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.premium_users ?? 0} PRO subscribers
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Events (24h)</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.events_last_24h ?? '—'}</div>
                            <p className="text-xs text-muted-foreground">Analytics events fired</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 🧠 RAG Knowledge Feed */}
                <KnowledgeFeedPanel />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Event Breakdown */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart2 className="h-4 w-4" />
                                Event Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats?.event_breakdown && stats.event_breakdown.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.event_breakdown.map((eb) => {
                                        const maxCount = stats.event_breakdown[0]?.count || 1;
                                        const pct = Math.round((eb.count / maxCount) * 100);
                                        return (
                                            <div key={eb.event_type} className="space-y-1">
                                                <div className="flex justify-between text-xs font-medium text-slate-600">
                                                    <span className="font-mono truncate max-w-[160px]">{eb.event_type}</span>
                                                    <span>{eb.count}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-teal-500 rounded-full transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-6">No events recorded yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Event</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                                        stats.recent_activity.map((event) => (
                                            <TableRow key={event.id}>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(event.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'short', timeStyle: 'short' })}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs max-w-[120px] truncate">
                                                    {event.user_id.substring(0, 16)}…
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-xs">{event.event_type}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No recent activity found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* 🔍 Landmark Validation Queue */}
                <ValidationQueuePanel />

                {/* 🏛️ Landmark Configs */}
                <LandmarkConfigPanel />

                {/* PRO Subscription Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>👑</span> PRO Subscription Management
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manual upgrade/downgrade — bridge selama KYC Mayar.id pending.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <UserSubscriptionPanel />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
