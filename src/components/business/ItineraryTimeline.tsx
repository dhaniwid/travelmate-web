import {Badge} from "@/components/ui/badge";
import {Clock, MapPin} from "lucide-react";
import {ItineraryItem} from "@/types";

export default function ItineraryTimeline({days}: { days: ItineraryItem[] }) {
    return (
        <div className="w-full space-y-8">
            {days.map((day) => (
                <div
                    key={day.day}
                    className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden break-inside-avoid"
                >
                    {/* --- HEADER HARI --- */}
                    <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-4">
                        {/* 1. KOTAK NOMOR HARI */}
                        {/* Kembali ke Flexbox murni. Hapus padding top manual. */}
                        <div
                            className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200 leading-none">
                            {day.day}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {/* 2. BADGE HARI */}
                                {/* Gunakan py-0.5 agar tinggi otomatis seimbang atas-bawah */}
                                <Badge variant="secondary"
                                       className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold flex items-center">
                                    Day {day.day}
                                </Badge>
                            </div>
                            <h4 className="text-lg md:text-xl font-bold text-slate-800 leading-tight">
                                {day.title}
                            </h4>
                        </div>
                    </div>

                    {/* --- KONTEN AKTIVITAS --- */}
                    <div className="p-6 md:p-8">
                        <div className="relative ml-4 md:ml-6 border-l-2 border-slate-100 pl-8 space-y-8">
                            {day.activities.map((act, i) => (
                                <div key={i} className="relative group">
                                    {/* Timeline Dot */}
                                    <div
                                        className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-white border-[3px] border-slate-300 group-hover:border-blue-500 transition-colors duration-300 z-10"/>

                                    <div className="flex flex-col gap-2">
                                        {/* Time & Tag Row */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* 3. JAM */}
                                            {/* Hapus height fix (h-6). Gunakan padding py-1. Hapus pt manual pada text. */}
                                            <Badge variant="outline"
                                                   className="font-bold border-slate-300 text-slate-600 px-2 py-1 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3"/>
                                                <span className="text-xs leading-none">{act.time}</span>
                                            </Badge>

                                            {/* 4. TIPE AKTIVITAS (TRANSPORT dll) */}
                                            {/* Hapus pt-[2px]. Biarkan default font rendering. */}
                                            <span
                                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {act.type}
                                            </span>
                                        </div>

                                        {/* Activity Title */}
                                        <h5 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {act.activity}
                                        </h5>

                                        {/* Location */}
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                            <MapPin className="w-3.5 h-3.5 text-rose-500"/>
                                            {act.place_name}
                                        </div>

                                        {/* Description */}
                                        <div
                                            className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic leading-relaxed">
                                            "{act.description}"
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}