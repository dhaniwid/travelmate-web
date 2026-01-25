import {Trip} from '@/types';
import {Card, CardContent} from '@/components/ui/card';
import {Calendar, MapPin} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import Link from 'next/link';

// Helper format date: "2024-03-10" -> "10 Mar 2024"
const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});
};

export default function HistoryCard({trip}: { trip: Trip }) {
    return (
        <Link href={`/trips/${trip.id}`} className="block group">
            <Card
                className="h-full hover:shadow-lg transition-all hover:border-blue-400 cursor-pointer overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"/>
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 truncate">{trip.destination}</h3>
                        <Badge variant="secondary" className="text-xs">{trip.style}</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-500 mt-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4"/>
                            <span>From {trip.origin}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4"/>
                            <span>{formatDate(trip.start_date)} ({trip.trip_days}d)</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t text-xs text-gray-400 font-mono">
                        ID: {trip.id.substring(0, 8)}...
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}