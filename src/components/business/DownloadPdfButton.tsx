'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Download, Loader2, FileText} from 'lucide-react';
import {generateTripPDF} from '@/lib/pdfGenerator';
import {toast} from 'sonner';

interface DownloadPdfBtnProps {
    targetId: string;
    tripTitle: string;
}

export default function DownloadPdfButton({targetId, tripTitle}: DownloadPdfBtnProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            toast.info("Preparing your document...", {description: "Please wait while we render your PDF."});

            // Sedikit delay agar toast muncul dan UI siap
            setTimeout(async () => {
                await generateTripPDF(targetId, tripTitle);
                setIsLoading(false);
                toast.success("Download started!", {description: "Your itinerary is ready."});
            }, 500);

        } catch (error) {
            console.error(error);
            setIsLoading(false);
            toast.error("Failed to download PDF");
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={isLoading}
            variant="outline"
            className="pdf-exclude bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm gap-2"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin"/>
                    Generating...
                </>
            ) : (
                <>
                    <FileText className="w-4 h-4"/>
                    Export PDF
                </>
            )}
        </Button>
    );
}