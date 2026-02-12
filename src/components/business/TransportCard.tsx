import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Train, Bus, Car, ArrowRight, Clock, Wallet, Zap, Star } from "lucide-react";
import { TransportOption } from "@/types";
import { ExternalLink } from "lucide-react";
import { bookingHelper } from "@/lib/booking";

const getIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("flight") || lower.includes("pesawat") || lower.includes("air") || lower.includes("garuda")) return <Plane
        className="w-4 h-4" />;
    if (lower.includes("train") || lower.includes("kereta") || lower.includes("whoosh") || lower.includes("rail")) return <Train
        className="w-4 h-4" />;
    if (lower.includes("bus") || lower.includes("shuttle") || lower.includes("damri")) return <Bus
        className="w-4 h-4" />;
    return <Car className="w-4 h-4" />;
};

// Helper formatRupiah (pastikan ada)
const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
};

export default function TransportCard({ option }: { option: TransportOption }) {
    // Split berdasarkan " + "
    const legs = option.name.split(/\s\+\s/);

    // LOGIC HIGHLIGHT TAG (Diperbarui agar tidak "Comfort" semua)
    let highlight = null;
    let cardBorder = "border-slate-200";
    const typeLower = (option.description || "").toLowerCase();

    if (typeLower.includes("budget") || typeLower.includes("hemat") || typeLower.includes("economy")) {
        highlight = (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1">
                <Wallet className="w-3 h-3" /> Budget Saver
            </Badge>
        );
        cardBorder = "border-green-200";
    } else if (typeLower.includes("fast") || typeLower.includes("express") || typeLower.includes("quick")) {
        highlight = (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 gap-1">
                <Zap className="w-3 h-3" /> Fastest
            </Badge>
        );
        cardBorder = "border-blue-200";
    } else {
        // Default untuk Balanced / Comfort / Lainnya
        highlight = (
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 gap-1">
                <Star className="w-3 h-3" /> Recommended
            </Badge>
        );
        cardBorder = "border-purple-200";
    }

    // Kita butuh props tambahan: origin, destination, date
    // Tapi jika TransportCard hanya menerima 'option', kita mungkin perlu passing data context dari parent.
    // UNTUK SIMPLIFIKASI SEKARANG: Kita arahkan ke Google Search nama transportnya saja dulu.

    const handleBook = () => {
        // Membuka tab baru ke Google Search untuk opsi ini
        const url = `https://www.google.com/search?q=${encodeURIComponent(option.name + " tickets price")}`;
        window.open(url, '_blank');
    };

    return (
        <Card
            className={`relative p-5 border shadow-sm hover:shadow-md transition-all duration-300 bg-white mt-4 ${cardBorder}`}>
            {/* Header: Type Only (Harga Dihilangkan) */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        {highlight}
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Total Est. {option.estimated_time}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-black text-slate-900 tracking-tight">
                        {formatRupiah(Number(option.price))}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">per person</div>
                </div>
            </div>

            {/* Route Visualizer (Timeline Horizontal) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide">
                {legs.map((leg, index) => {
                    // Coba pisahkan Nama dan (Waktu)
                    // Contoh: "Train to Gambir (3h)" -> name: "Train to Gambir", time: "3h"
                    const timeMatch = leg.match(/\((.*?)\)/);
                    const time = timeMatch ? timeMatch[1] : "";
                    const name = leg.replace(/\(.*?\)/, "").trim();

                    return (
                        <div key={index}
                            className="flex items-center flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg hover:bg-white hover:border-slate-300 transition-colors">
                                    <div className="text-slate-500">{getIcon(name)}</div>
                                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{name}</span>
                                </div>
                                {/* Tampilkan waktu per segmen kecil di bawah box */}
                                {time && <span className="text-[9px] font-mono text-slate-400">{time}</span>}
                            </div>

                            {index < legs.length - 1 &&
                                <ArrowRight className="w-3 h-3 text-slate-300 mx-2 mb-3 flex-shrink-0" />}
                        </div>
                    );
                })}
            </div>

            <div className="mt-2 pt-3 border-t border-slate-50">
                <p className="text-xs text-slate-500 italic">
                    "{option.pros}"
                </p>
            </div>
        </Card>
    );
}