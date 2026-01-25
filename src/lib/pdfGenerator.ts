import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateTripPDF = async (elementId: string, tripTitle: string) => {
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Element with id '${elementId}' not found`);

    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Kualitas standar (cukup tajam)
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1440, // Layout desktop

            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (!clonedElement) return;

                // 1. HAPUS TOMBOL DOWNLOAD
                const downloadBtns = clonedElement.querySelectorAll('.pdf-exclude');
                downloadBtns.forEach(el => el.remove());

                // 2. STYLING KHUSUS HEADER (Agar teks putih terbaca)
                const style = clonedDoc.createElement('style');
                style.innerHTML = `
                    /* Header Biru Solid (Backup jika gambar gagal) */
                    .relative.h-72, .relative.h-96 {
                        background-color: #1e3a8a !important; 
                        background-image: none !important;
                    }
                    /* Teks Header Putih */
                    .relative.h-72 h2, .relative.h-72 .text-white,
                    .relative.h-96 h2, .relative.h-96 .text-white {
                        color: #ffffff !important;
                        text-shadow: none !important;
                    }
                    /* Matikan Gradient */
                    .bg-gradient-to-t { background: none !important; }
                    /* Matikan Animasi */
                    * { transition: none !important; animation: none !important; transform: none !important; }
                `;
                clonedDoc.head.appendChild(style);
            }
        });

        // --- GENERATE PDF ---
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const scaledHeight = imgHeight * (pdfWidth / imgWidth);

        let heightLeft = scaledHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 5) {
            position = heightLeft - scaledHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
            heightLeft -= pdfHeight;
        }

        const safeTitle = tripTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        pdf.save(`TravelMate-${safeTitle}.pdf`);

    } catch (error) {
        console.error("PDF Gen Error:", error);
        throw error;
    }
};