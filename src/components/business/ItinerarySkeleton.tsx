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
                            {[1, 2, 3].map((act) => (
                                <div key={act} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex gap-4 sm:gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-12 bg-slate-100 rounded" />
                                            <div className="h-4 w-16 bg-slate-50 rounded-full" />
                                        </div>
                                        <div className="h-6 w-3/4 bg-slate-100 rounded" />
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 bg-slate-50 rounded-full" />
                                            <div className="h-3 w-1/3 bg-slate-50 rounded" />
                                        </div>
                                    </div>
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl hidden sm:block" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}