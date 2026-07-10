import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Train, Bus, Car, ArrowRight, Clock, Wallet, Zap, Star, ExternalLink } from "lucide-react";
import { TransportOption } from "@/types";

const getIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("flight") || lower.includes("pesawat") || lower.includes("air") || lower.includes("garuda")) return <Plane className="w-4 h-4" />;
    if (lower.includes("train") || lower.includes("kereta") || lower.includes("whoosh") || lower.includes("rail")) return <Train className="w-4 h-4" />;
    if (lower.includes("bus") || lower.includes("shuttle") || lower.includes("damri")) return <Bus className="w-4 h-4" />;
    return <Car className="w-4 h-4" />;
};

const STRATEGY_CONFIG: Record<string, { badge: React.ReactNode; border: string }> = {
    HEMAT: {
        badge: <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1"><Wallet className="w-3 h-3" /> Budget Saver</Badge>,
        border: "border-green-200",
    },
    CEPAT: {
        badge: <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 gap-1"><Zap className="w-3 h-3" /> Tercepat</Badge>,
        border: "border-blue-200",
    },
    NYAMAN: {
        badge: <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 gap-1"><Star className="w-3 h-3" /> Paling Nyaman</Badge>,
        border: "border-purple-200",
    },
};

const PRICE_TIER_LABEL: Record<string, string> = {
    LOW: "Budget Friendly",
    MED: "Mid-Range",
    HIGH: "Premium",
};

export default function TransportCard({ option }: { option: TransportOption }) {
    const config = STRATEGY_CONFIG[option.strategy_tag?.toUpperCase()] ?? {
        badge: <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1"><Star className="w-3 h-3" /> Recommended</Badge>,
        border: "border-slate-200",
    };

    // Split multi-leg name by " + "
    const legs = option.name.split(/\s\+\s/);

    const handleBook = () => {
        const query = option.booking_query || option.name + " tiket harga";
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    };

    return (
        <Card className={`relative p-5 border shadow-sm hover:shadow-md transition-all duration-300 bg-white ${config.border}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                    {config.badge}
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Est. {option.total_duration_display}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-slate-700">
                        {PRICE_TIER_LABEL[option.price_tier] ?? option.price_tier}
                    </div>
                    {option.operators_hint && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{option.operators_hint}</div>
                    )}
                </div>
            </div>

            {/* Leg visualizer */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide">
                {legs.map((leg, index) => {
                    const timeMatch = leg.match(/\((.*?)\)/);
                    const time = timeMatch ? timeMatch[1] : "";
                    const name = leg.replace(/\(.*?\)/, "").trim();
                    return (
                        <div key={index} className="flex items-center flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg hover:bg-white hover:border-slate-300 transition-colors">
                                    <div className="text-slate-500">{getIcon(name)}</div>
                                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{name}</span>
                                </div>
                                {time && <span className="text-[9px] font-mono text-slate-400">{time}</span>}
                            </div>
                            {index < legs.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300 mx-2 mb-3 flex-shrink-0" />}
                        </div>
                    );
                })}
            </div>

            {/* Pros */}
            <div className="mt-2 pt-3 border-t border-slate-50 flex items-start justify-between gap-3">
                <p className="text-xs text-slate-500 italic flex-1">"{option.pros}"</p>
                <button
                    type="button"
                    onClick={handleBook}
                    className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 whitespace-nowrap shrink-0"
                >
                    Cari tiket <ExternalLink className="w-3 h-3" />
                </button>
            </div>
        </Card>
    );
}
