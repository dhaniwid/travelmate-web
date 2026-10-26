export default function DestinationLoading() {
    return (
        <div className="min-h-screen bg-white max-w-[480px] md:max-w-2xl mx-auto">
            {/* Skeleton hero */}
            <div className="relative h-[320px] bg-zinc-100 animate-pulse">
                <div className="flex items-center justify-between px-5 pt-6">
                    <div className="h-9 w-9 rounded-full bg-zinc-200" />
                    <div className="h-9 w-9 rounded-full bg-zinc-200" />
                </div>
                <div className="absolute bottom-6 left-5 right-5">
                    <div className="h-5 w-24 rounded-full bg-zinc-200 mb-2" />
                    <div className="h-9 w-48 rounded-xl bg-zinc-200 mb-2" />
                    <div className="h-4 w-64 rounded-lg bg-zinc-200" />
                </div>
            </div>
        </div>
    );
}
