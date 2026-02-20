import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export function ThemeToggle({ className }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "p-2 rounded-xl transition-all duration-500 border border-white/10 shadow-lg",
                theme === 'dark'
                    ? "bg-indigo-500/20 text-yellow-400 hover:bg-indigo-500/30 hover:scale-110 active:scale-95"
                    : "bg-white/80 text-indigo-600 hover:bg-white hover:scale-110 active:scale-95 shadow-indigo-200/50",
                className
            )}
            aria-label="Toggle Theme"
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                {theme === 'dark' ? (
                    <Sun size={20} className="animate-in zoom-in spin-in-90 duration-500" />
                ) : (
                    <Moon size={20} className="animate-in zoom-in spin-in-180 duration-500" />
                )}
            </div>
        </button>
    );
}
