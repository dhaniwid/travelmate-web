import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PassportStampProps {
    imageSrc: string;
    city: string;
    date: string;
    serialCode: string; // e.g., "NRT-0813-M"
    className?: string;
    rotation?: number; // e.g., 2 or -1.5
}

export function PassportStamp({
    imageSrc,
    city,
    date,
    serialCode,
    className,
    rotation = 0,
}: PassportStampProps) {
    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = e.currentTarget.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            initial={{ rotate: rotation, scale: 0.95, opacity: 0 }}
            animate={{ rotate: rotation, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative w-full aspect-square group cursor-pointer",
                className
            )}
        >
            {/* Paper Texture Overlay (Multiply) */}
            <div
                className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]"
                style={{ transform: "translateZ(20px)" }} // Parallax effect
            />

            {/* The Stamp Image */}
            <div
                className="relative w-full h-full drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-2xl"
                style={{ transform: "translateZ(10px)" }}
            >
                <Image
                    src={imageSrc}
                    alt={`Sumi stamp for ${city}`}
                    fill
                    className="object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    draggable={false}
                />
            </div>

            {/* Metadata Tooltip (On Hover) */}
            <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 bg-stone-900 border border-stone-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                style={{ transform: "translateZ(40px) translateX(-50%)" }}
            >
                <span className="font-mono text-stone-400 font-bold">{serialCode}</span> • <span className="text-stone-300">{date}</span>
            </div>
        </motion.div>
    );
}
