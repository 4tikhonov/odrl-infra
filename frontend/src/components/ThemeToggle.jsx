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
                "p-2 rounded-lg transition-colors border border-transparent",
                theme === 'dark'
                    ? "bg-white/10 text-yellow-300 hover:bg-white/20 hover:border-white/10"
                    : "bg-gray-100 text-indigo-600 hover:bg-gray-200 hover:border-gray-300",
                className
            )}
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
