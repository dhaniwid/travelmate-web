/**
 * Booking Helper Utilities
 * Generates deep links for affiliate partners (Skyscanner, Booking.com, Google Flights)
 */

/**
 * HELPER: Format date to YYYY-MM-DD
 */
const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
};

/**
 * HELPER: Validation for known airport codes
 * Maps common Indonesian & International cities to IATA codes
 */
const getAirportCode = (city: string): string | null => {
    const map: Record<string, string> = {
        'jakarta': 'CGK',
        'bali': 'DPS',
        'denpasar': 'DPS',
        'surabaya': 'SUB',
        'medan': 'KNO',
        'yogyakarta': 'YIA',
        'jogja': 'YIA',
        'makassar': 'UPG',
        'singapore': 'SIN',
        'kuala lumpur': 'KUL',
        'bangkok': 'BKK',
        'tokyo': 'HND', // Or NRT, but HND is closer
        'osaka': 'KIX',
        'seoul': 'ICN',
        'london': 'LHR',
        'paris': 'CDG',
        'amsterdam': 'AMS',
        'dubai': 'DXB',
        'istanbul': 'IST'
    };

    return map[city.toLowerCase()] || null;
};

/**
 * Generates a flight search link.
 * Prioritizes Skyscanner if airport codes are known.
 * Fallbacks to Google Flights specific URL.
 */
export const getFlightSearchLink = (origin: string, destination: string, date: string) => {
    const formattedDate = formatDate(date);
    const originCode = getAirportCode(origin);
    const destCode = getAirportCode(destination);

    // 1. If we have both codes, use Skyscanner direct search (YYMMDD format for sc)
    // Actually skyscanner format in 2024 is often /transport/flights/origin/dest/yymmdd
    // Let's use the standard search params if possible, or the path structure
    if (originCode && destCode && formattedDate) {
        // Skyscanner format: https://www.skyscanner.com/transport/flights/cgk/dps/241225
        const simpleDate = formattedDate.substring(2).replace(/-/g, ''); // 2024-12-25 -> 241225
        return `https://www.skyscanner.com/transport/flights/${originCode.toLowerCase()}/${destCode.toLowerCase()}/${simpleDate}`;
    }

    // 2. Fallback: Google Flights specific URL (better than generic google search)
    // https://www.google.com/travel/flights?q=Flights%20to%20Bali%20from%20Jakarta%20on%202024-12-25
    const query = `Flights to ${destination} from ${origin} on ${formattedDate}`;
    return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
};

/**
 * Generates a hotel search link on Booking.com.
 * Forces search in specific area name if provided.
 * @param destination City or specific Area
 * @param checkIn Date string in YYYY-MM-DD format
 * @param days Duration of stay
 */
export const getHotelSearchLink = (destination: string, checkIn: string, days: number) => {
    if (!checkIn) {
        // Fallback if no date: just search destination
        return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&group_adults=2`;
    }

    try {
        const start = new Date(checkIn);
        const end = new Date(start);
        end.setDate(start.getDate() + days);

        const sDate = start.toISOString().split('T')[0];
        const eDate = end.toISOString().split('T')[0];

        return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&checkin=${sDate}&checkout=${eDate}&group_adults=2`;
    } catch (e) {
        console.error("Date parsing error for hotel link", e);
        return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`;
    }
};

/**
 * Generates an activity search link (Klook/Viator default).
 */
export const getActivitySearchLink = (activityName: string, location: string) => {
    const query = `${activityName} in ${location}`;
    return `https://www.klook.com/search?text=${encodeURIComponent(query)}`;
};

