import { TransportOption } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import { Clock, Info } from 'lucide-react';

export default function TransportCard({ option }: { option: TransportOption }) {
    // Helper untuk mendapatkan logo airline/transport
    const getLogo = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('garuda')) return "https://logodownload.org/wp-content/uploads/2015/12/garuda-indonesia-logo-0.png";
        if (n.includes('lion')) return "https://logodownload.org/wp-content/uploads/2020/03/lion-air-logo-0.png";
        if (n.includes('citilink')) return "https://logodownload.org/wp-content/uploads/2020/03/citilink-logo-1.png";
        if (n.includes('whoosh') || n.includes('kai')) return "https://upload.wikimedia.org/wikipedia/commons/5/58/Logo_KAI_Commuter.svg";
        return null;
    };

    const logoUrl = getLogo(option.name);

    return (
        <Card className="mb-4 border-l-4 border-l-orange-400 hover:bg-slate-50 transition-colors">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        {/* Logo Container */}
                        <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg border p-2 flex items-center justify-center">
                            {logoUrl ? (
                                <img src={logoUrl} alt={option.name} className="max-w-full max-h-full object-contain" />
                            ) : (
                                <Info className="w-6 h-6 text-slate-300" />
                            )}
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-800">{option.type} - {option.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {option.estimated_time}</span>
                                <span className="text-green-600 font-medium">{option.pros}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                        <p className="text-[10px] text-gray-400 uppercase">Est. Price</p>
                        <p className="font-bold text-orange-600 text-lg">IDR {formatMoney(option.price)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}