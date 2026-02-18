import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageSquare, Plus, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function PromptsManager() {
    const [promptContent, setPromptContent] = useState('');
    const [description, setDescription] = useState('');
    const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('prompts_history') || '[]'));

    useEffect(() => {
        localStorage.setItem('prompts_history', JSON.stringify(history));
    }, [history]);

    const addToHistory = (did, content, desc) => {
        setHistory(prev => [{ did, content, description: desc, timestamp: Date.now() }, ...prev]);
    }

    const createMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                type: "LLM Prompt",
                content: promptContent,
                description: description,
                timestamp: new Date().toISOString()
            };
            const res = await api.post('/did/create', { payload });
            return { ...res.data, originalContent: payload };
        },
        onSuccess: (data) => {
            addToHistory(data.did, data.originalContent.content, data.originalContent.description);
            setPromptContent('');
            setDescription('');
        }
    });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!promptContent.trim()) return;
        createMutation.mutate();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Prompts Manager</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your LLM prompts by anchoring them as immutable DIDs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 dark:bg-[#242424] dark:border-white/10 shadow-sm dark:shadow-none">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="text-yellow-500" size={20} /> New Prompt
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g., Code Refactoring Prompt"
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt Content</label>
                                <textarea
                                    value={promptContent}
                                    onChange={(e) => setPromptContent(e.target.value)}
                                    rows={8}
                                    placeholder="Enter your system prompt or instruction here..."
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-black/20 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={createMutation.isPending || !promptContent.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 text-black shadow-sm"
                            >
                                {createMutation.isPending ? 'Anchoring...' : (
                                    <>
                                        <Plus size={20} /> Generate DID
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {createMutation.isError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-3 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                            <AlertCircle size={20} />
                            Failed to anchor prompt. Please try again.
                        </div>
                    )}

                    {createMutation.data && (
                        <div className="p-6 bg-green-50 border border-green-200 rounded-xl dark:bg-green-500/10 dark:border-green-500/20">
                            <h3 className="text-green-600 dark:text-green-400 font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle size={20} /> <a href={`https://oydid.ownyourdata.eu/${createMutation.data.did}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Prompt Anchored Successfully</a>
                            </h3>
                            <p className="font-mono text-sm break-all text-gray-900 bg-white border border-gray-200 p-3 rounded select-all dark:text-gray-300 dark:bg-black/20 dark:border-transparent">
                                {createMutation.data.did}
                            </p>
                        </div>
                    )}
                </div>

                {/* History List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="text-indigo-500" size={20} /> Recent Prompts
                    </h3>
                    <div className="space-y-3">
                        {history.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 italic text-sm">No prompts anchored yet.</p>
                        )}
                        {history.map((item, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors dark:bg-[#242424] dark:border-white/10 dark:hover:border-indigo-500/50 shadow-sm dark:shadow-none">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white truncate pr-2">
                                        {item.description || "Untitled Prompt"}
                                    </h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-3 line-clamp-3">
                                    {item.content}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">
                                        {item.did}
                                    </span>
                                    <Link
                                        to={`/dids?resolve=${item.did}`}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                                    >
                                        View DID
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
