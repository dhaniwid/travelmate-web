import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Map, DollarSign, Activity, Lock } from "lucide-react";

// FORCE DYNAMIC: Always fetch fresh stats
export const dynamic = "force-dynamic";

async function getAdminStats() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/admin/stats`, {
            headers: {
                "X-Admin-Secret": process.env.ADMIN_SECRET || "travelmate_admin_secret_2026",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("Failed to fetch admin stats:", res.status, await res.text());
            return null;
        }

        return res.json();
    } catch (e) {
        console.error("Error fetching admin stats:", e);
        return null;
    }
}

export default async function AdminDashboard() {
    const user = await currentUser();

    // 1. SIMPLE SECURITY: Check User Email
    // Replace with your actual admin email(s)
    const adminEmails = ["dhaniwid@gmail.com", "admin@travelmate.com"];
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

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Overview of TravelMate performance.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Live Data
                        </Badge>
                        <div className="text-sm text-gray-500">
                            Welcome, {user.firstName || userEmail}
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
                            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                            <p className="text-xs text-muted-foreground">Registered accounts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                            <Map className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_trips || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats?.trips_created_24h || 0} in last 24h
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Premium Convert</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.total_users > 0
                                    ? ((stats?.premium_users || 0) / stats.total_users * 100).toFixed(1)
                                    : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.premium_users || 0} paid subscribers
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Activity (24h)</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.events_last_24h || 0}</div>
                            <p className="text-xs text-muted-foreground">Analytics events</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead className="text-right">ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats?.recent_activity?.length > 0 ? (
                                    stats.recent_activity.map((event: any) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-medium">
                                                {new Date(event.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{event.user_id}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{event.event_type}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-gray-400">
                                                {event.id.substring(0, 8)}...
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No recent activity found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
