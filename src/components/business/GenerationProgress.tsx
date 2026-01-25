import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export type ProgressStep = {
    id: string;
    label: string;
    status: 'pending' | 'loading' | 'complete';
};

export default function GenerationProgress({ steps }: { steps: ProgressStep[] }) {
    return (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                            {step.status === 'complete' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : step.status === 'loading' ? (
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            ) : (
                                <Circle className="w-5 h-5 text-slate-300" />
                            )}
                        </div>
                        <div className="flex flex-col">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                  step.status === 'pending' ? 'text-slate-400' : 'text-blue-600'
              }`}>
                Step {index + 1}
              </span>
                            <span className={`text-sm font-semibold ${
                                step.status === 'pending' ? 'text-slate-400' : 'text-slate-700'
                            }`}>
                {step.label}
              </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}