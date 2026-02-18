'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface TypewriterTextProps {
    /** The full markdown string to animate. */
    text: string;
    /** Called when the typewriter finishes animating. */
    onComplete?: () => void;
    /** Characters per tick. Default 1. */
    charsPerTick?: number;
    /** Milliseconds between ticks. Default 18. */
    speed?: number;
}

// Miru-branded markdown component map
const markdownComponents: Components = {
    // Bold → teal accent
    strong: ({ children, ...props }) => (
        <span className="font-bold text-teal-700" {...props}>
            {children}
        </span>
    ),
    // Emphasis → italics (unchanged)
    em: ({ children, ...props }) => (
        <em className="italic" {...props}>
            {children}
        </em>
    ),
    // Unordered list — tight spacing suits the 60-word limit
    ul: ({ children, ...props }) => (
        <ul className="list-disc pl-4 space-y-0.5 my-1" {...props}>
            {children}
        </ul>
    ),
    // Ordered list
    ol: ({ children, ...props }) => (
        <ol className="list-decimal pl-4 space-y-0.5 my-1" {...props}>
            {children}
        </ol>
    ),
    li: ({ children, ...props }) => (
        <li className="leading-snug" {...props}>
            {children}
        </li>
    ),
    // Paragraphs — collapse extra top margin between bullet groups
    p: ({ children, ...props }) => (
        <p className="mb-1 last:mb-0 leading-relaxed" {...props}>
            {children}
        </p>
    ),
    // Inline code (rare but handled)
    code: ({ children, ...props }) => (
        <code
            className="bg-teal-50 text-teal-800 rounded px-1 py-0.5 text-[11px] font-mono"
            {...props}
        >
            {children}
        </code>
    ),
};

/**
 * TypewriterText — reveals markdown text character-by-character.
 * A blinking bar cursor `|` is shown while typing and removed when done.
 * After `onComplete` is called the component renders identical output
 * but without the cursor, making it safe to keep in the DOM forever.
 */
export default function TypewriterText({
    text,
    onComplete,
    charsPerTick = 1,
    speed = 18,
}: TypewriterTextProps) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const indexRef = useRef(0);
    const callbackRef = useRef(onComplete);

    callbackRef.current = onComplete;

    useEffect(() => {
        indexRef.current = 0;
        setDisplayed('');
        setDone(false);

        if (!text) {
            setDone(true);
            return;
        }

        const id = setInterval(() => {
            const next = indexRef.current + charsPerTick;
            if (next >= text.length) {
                setDisplayed(text);
                indexRef.current = text.length;
                setDone(true);
                clearInterval(id);
                callbackRef.current?.();
            } else {
                indexRef.current = next;
                setDisplayed(text.slice(0, next));
            }
        }, speed);

        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text]);

    return (
        <div className="text-sm text-slate-700 leading-relaxed">
            <ReactMarkdown components={markdownComponents}>
                {displayed}
            </ReactMarkdown>

            {/* Blinking bar cursor — visible only while typing */}
            {!done && (
                <span
                    aria-hidden
                    className="inline-block w-[2px] h-[1em] bg-teal-500 ml-[1px] align-text-bottom animate-pulse"
                />
            )}
        </div>
    );
}
