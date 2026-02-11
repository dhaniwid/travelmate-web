import React from 'react';
import { Bed, MapPin, Building, ExternalLink } from 'lucide-react';
import { AccommodationOption } from '@/types/trip';
import { Button } from '@/components/ui/button';

import { getHotelSearchLink } from '@/utils/booking';

interface AccommodationCardProps {
    option: AccommodationOption;
    tripContext: {
        destination: string;
        startDate: string;
        days: number;
    };
    className?: string;
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({ option, tripContext, className }) => {
    // Generate Booking.com Search URL with Dates
    // E.g. "Namba, Osaka"
    const searchLocation = `${option.area_name}, ${tripContext.destination}`;
    const bookingSearchUrl = getHotelSearchLink(searchLocation, tripContext.startDate, tripContext.days);

    return (
        <div className={`group bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all ${className}`}>
            {/* Header: Area Name & Type */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <Bed className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">{option.area_name}</h4>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {option.type || 'Stay'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Body: Reason & Vibe */}
            <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-slate-600 leading-relaxed">
                        <span className="font-medium text-slate-700">Why here:</span> {option.reason}
                    </p>
                </div>
                {option.vibe && (
                    <div className="flex items-start gap-2">
                        <Building className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-500 italic">
                            "{option.vibe}"
                        </p>
                    </div>
                )}
            </div>

            {/* Footer: Hotel Suggestions & Action */}
            <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Top Picks</p>
                    <p className="text-sm text-slate-700 font-medium">
                        {Array.isArray(option.hotel_suggestions) ? option.hotel_suggestions.join(", ") : option.hotel_suggestions || 'Check local listings'}
                    </p>
                </div>

                <a href={bookingSearchUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                        Check Rates <ExternalLink className="w-3 h-3" />
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default AccommodationCard;
