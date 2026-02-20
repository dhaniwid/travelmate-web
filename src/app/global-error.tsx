"use client";

// global-error.tsx
// Root-level error boundary — catches errors in the RootLayout and sends them to Sentry.
// This is different from error.tsx which only catches nested segment errors.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white text-center p-8">
                    <div className="max-w-md space-y-6">
                        {/* Miru brand mark */}
                        <div className="text-5xl">✦</div>
                        <h1 className="text-3xl font-black">Something went wrong</h1>
                        <p className="text-slate-400 text-base leading-relaxed">
                            An unexpected error occurred. Our team has been notified automatically.
                        </p>
                        {error.digest && (
                            <p className="text-xs text-slate-600 font-mono">Error ID: {error.digest}</p>
                        )}
                        <button
                            onClick={reset}
                            className="mt-4 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-2xl font-bold text-white transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
