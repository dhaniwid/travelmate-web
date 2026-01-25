import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {Badge} from "@/components/ui/badge";
import {Clock, MapPin, Star} from "lucide-react";
import {ItineraryItem} from "@/types";

export default function ItineraryTimeline({days}: { days: ItineraryItem[] }) {
    return (
        <Accordion type="single" collapsible defaultValue="day-1" className="w-full space-y-4">
            {days.map((day) => (
                <AccordionItem
                    key={day.day}
                    value={`day-${day.day}`}
                    className="border rounded-xl px-4 bg-white shadow-sm overflow-hidden"
                >
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-4 text-left">
                            <div
                                className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                                {day.day}
                            </div>
                            <div>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Day {day.day}</p>
                                <h4 className="text-lg font-bold text-slate-800">{day.title}</h4>
                            </div>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-2 pb-6 border-t border-dashed">
                        <div className="relative ml-5 border-l-2 border-slate-100 pl-8 space-y-6 mt-4">
                            {day.activities.map((act, i) => (
                                <div key={i} className="relative group">
                                    {/* Dot Indicator */}
                                    <div
                                        className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500 z-10"/>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] font-bold py-0 h-5">
                                                <Clock className="w-3 h-3 mr-1"/> {act.time}
                                            </Badge>
                                            <span
                                                className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {act.type}
                      </span>
                                        </div>

                                        <h5 className="font-bold text-slate-900">{act.activity}</h5>

                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <MapPin className="w-3 h-3 text-rose-500"/>
                                            {act.place_name}
                                        </div>

                                        {/* Deskripsi lebih simpel, tanpa box abu-abu tebal */}
                                        <p className="text-xs text-slate-500 italic mt-1 leading-relaxed">
                                            {act.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}