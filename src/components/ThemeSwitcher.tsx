"use client"

import {useTheme} from "next-themes"
import {Button} from "@/components/ui/button"
import {Paintbrush} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
    const {setTheme, theme} = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                    <Paintbrush className="h-[1.2rem] w-[1.2rem] transition-all"/>
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600 border border-slate-200"></div>
                    <span>Professional Blue</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("teal")} className="gap-2">
                    <div className="w-4 h-4 rounded-full bg-teal-600 border border-slate-200"></div>
                    <span>Modern Explorer</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("violet")} className="gap-2">
                    <div className="w-4 h-4 rounded-full bg-violet-600 border border-slate-200"></div>
                    <span>Tech Future</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}