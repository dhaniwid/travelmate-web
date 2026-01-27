import {TransportOption, AccommodationOption} from "@/types";

// Helper untuk format tanggal YYYY-MM-DD (jika diperlukan oleh OTA)
// const formatDate = (dateStr: string) => ...

export const bookingHelper = {

    // 1. Generate Link untuk Transport (Contoh: Tiket.com / Traveloka)
    getTransportLink: (transport: TransportOption, origin: string, destination: string, date: string) => {
        // Logika sederhana: Deteksi keyword untuk menentukan moda transportasi
        const lowerName = transport.name.toLowerCase();

        // Encode parameter agar aman di URL
        const from = encodeURIComponent(origin);
        const to = encodeURIComponent(destination);

        if (lowerName.includes("kereta") || lowerName.includes("train")) {
            // Link search Kereta Api (Contoh format Tiket.com)
            // d = origin, a = destination, date = yyyy-mm-dd
            return `https://www.tiket.com/kereta-api/cari?d=${from}&a=${to}&date=${date}&adult=1`;
        }

        if (lowerName.includes("pesawat") || lowerName.includes("flight") || lowerName.includes("fly")) {
            // Link search Pesawat (Contoh format Traveloka)
            // Perlu kode bandara sebenarnya (misal CGK-JOG), tapi kita coba search text dulu atau google flights
            return `https://www.google.com/travel/flights?q=flights+from+${from}+to+${to}+on+${date}`;
        }

        // Default: Google Search biasa
        return `https://www.google.com/search?q=${encodeURIComponent(transport.name + " tickets")}`;
    },

    // 2. Generate Link untuk Hotel (Contoh: Agoda / Booking.com / Google Hotels)
    getHotelLink: (hotel: AccommodationOption, destination: string, checkInDate: string) => {
        const query = encodeURIComponent(`${hotel.name} ${destination}`);

        // Google Hotels (Paling aman karena agregator)
        return `https://www.google.com/search?q=${query}&kh_src=travel_hotel`;

        // Jika nanti punya affiliate Traveloka:
        // return `https://www.traveloka.com/en-id/hotel/search?spec=${date}.1.1...`;
    }
};