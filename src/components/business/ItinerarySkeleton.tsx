import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ItinerarySkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {[1, 2].map((day) => (
                <Card key={day} className="border-none shadow-none bg-transparent">
                    <CardHeader className="pb-4 px-0">
                        <div className="flex items-center gap-3">
                            {/* Day Badge Skeleton */}
                            <div className="w-10 h-10 rounded-xl bg-slate-200" />
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-slate-200 rounded" />
                                <div className="h-5 w-40 bg-slate-200 rounded" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-0 pt-0">
                        <div className="relative ml-5 border-l-2 border-slate-100 pl-8 space-y-8">
                            {[1, 2].map((act) => (
                                <div key={act} className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="h-5 w-20 bg-slate-100 rounded-md" />
                                        <div className="h-5 w-24 bg-slate-100 rounded-md" />
                                    </div>
                                    <div className="h-6 w-3/4 bg-slate-200 rounded" />
                                    <div className="h-16 w-full bg-slate-50 rounded-lg border border-slate-100" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}