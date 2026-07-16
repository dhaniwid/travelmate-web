export default function DestinationLoading() {
    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(to bottom, #060F1E 0%, #0D5463 40%, #C2500A 75%, #7A2E0A 100%)',
        }}>
            {/* Skeleton top bar */}
            <div className="flex items-center justify-between px-5 pt-12">
                <div className="h-9 w-24 rounded-full bg-white/10 animate-pulse" />
                <div className="h-9 w-20 rounded-full bg-white/10 animate-pulse" />
            </div>
            {/* Skeleton city name */}
            <div className="absolute bottom-24 left-6 right-6">
                <div className="h-14 w-56 rounded-xl bg-white/10 animate-pulse mb-3" />
                <div className="h-5 w-72 rounded-lg bg-white/8 animate-pulse" />
            </div>
        </div>
    );
}
