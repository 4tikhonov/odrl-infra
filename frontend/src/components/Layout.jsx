import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, ScrollText, PlayCircle, Sun, Moon, LogOut, CheckCircle, Menu, X, FileText, Database, ShieldCheck, FileKey, Play, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';

const NavItem = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-500/40"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
            )}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

export default function Layout({ children }) {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-[#1a1a1a] dark:text-white overflow-hidden transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 dark:bg-[#242424] dark:border-white/10 flex flex-col transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            ODRL Infra
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">DID-based Access Control</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/dids" icon={FileKey} label="DID Manager" />
                    <NavItem to="/vcs" icon={Wallet} label="VC Wallet" />
                    <NavItem to="/policies" icon={ShieldCheck} label="Policy Builder" />
                    <NavItem to="/prompts" icon={MessageSquare} label="Prompts Manager" />
                    <NavItem to="/variables" icon={Database} label="Variables" />
                    <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />
                    <NavItem to="/demo" icon={Play} label="Live Demo" />
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Theme</span>
                        <ThemeToggle />
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 dark:text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span>System Online</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#121212] relative transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 pointer-events-none" />
                <div className="p-8 max-w-7xl mx-auto relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}


