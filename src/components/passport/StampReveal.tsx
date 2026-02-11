import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface StampRevealProps {
    isOpen: boolean;
    onClose: () => void;
    stampImage: string;
    city: string;
    mood: string;
}

export function StampReveal({
    isOpen,
    onClose,
    stampImage,
    city,
    mood,
}: StampRevealProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset logic if needed
            const timer = setTimeout(() => setShowConfetti(true), 600);
            return () => clearTimeout(timer);
        } else {
            setShowConfetti(false);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    {/* Card Container */}
                    <motion.div
                        initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.8, rotate: 5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-sm bg-[#F5F1E8] rounded-xl shadow-2xl overflow-hidden aspect-[3/4]"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundImage: "url('https://www.transparenttextures.com/patterns/cardboard-flat.png')"
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Content */}
                        <div className="flex flex-col items-center justify-center h-full p-8 space-y-8 relative z-10">

                            <div className="text-center space-y-1">
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="font-serif italic text-slate-500 text-lg"
                                >
                                    Just Arrived
                                </motion.p>
                                <motion.h2
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-4xl font-bold text-slate-900 tracking-tight uppercase"
                                >
                                    {city}
                                </motion.h2>
                            </div>

                            {/* The Stamp Slam */}
                            <div className="relative w-64 h-64">
                                <motion.div
                                    initial={{ scale: 2.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: 0.5,
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 15,
                                        mass: 0.5
                                    }}
                                    className="w-full h-full relative mix-blend-multiply"
                                >
                                    <Image
                                        src={stampImage}
                                        alt="New Stamp"
                                        fill
                                        className="object-contain"
                                    />
                                </motion.div>

                                {/* Impact Ripple (Optional) */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.2, opacity: [0, 0.3, 0] }}
                                    transition={{ delay: 0.5, duration: 0.4 }}
                                    className="absolute inset-0 rounded-full border-4 border-slate-900/20"
                                />
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="w-full"
                            >
                                <Button
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                                    onClick={onClose}
                                >
                                    Add to Passport
                                </Button>
                            </motion.div>

                        </div>

                        {/* Confetti / Decor elements could go here */}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
