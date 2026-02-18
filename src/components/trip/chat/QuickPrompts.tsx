'use client';

interface QuickPrompt {
    label: string;
    message: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
    { label: '🍱 Best Lunch Spots', message: 'What are the best lunch spots near my itinerary?' },
    { label: '🌦️ Weather Forecast', message: 'What is the weather forecast for my trip dates?' },
    { label: '💎 Hidden Gems', message: 'What hidden gems or off-the-beaten-path spots should I visit?' },
    { label: '📸 Photo Spots', message: 'What are the best photography spots on this trip?' },
    { label: '🚌 Transport Tips', message: 'What are the best ways to get around during this trip?' },
];

interface QuickPromptsProps {
    onSelect: (message: string) => void;
    disabled?: boolean;
}

/**
 * QuickPrompts — horizontally scrollable pill chips that fire a preset question into Miru Chat.
 */
export default function QuickPrompts({ onSelect, disabled = false }: QuickPromptsProps) {
    return (
        <div className="px-3 py-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 px-1">
                Quick Ask
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
                {QUICK_PROMPTS.map((qp) => (
                    <button
                        key={qp.label}
                        onClick={() => !disabled && onSelect(qp.message)}
                        disabled={disabled}
                        className="
                            flex-shrink-0 snap-start
                            px-3 py-1.5 rounded-full text-xs font-medium
                            border border-teal-200 bg-teal-50 text-teal-700
                            hover:bg-teal-100 hover:border-teal-400 hover:shadow-sm
                            active:scale-95 transition-all duration-150
                            disabled:opacity-40 disabled:cursor-not-allowed
                            whitespace-nowrap
                        "
                    >
                        {qp.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
