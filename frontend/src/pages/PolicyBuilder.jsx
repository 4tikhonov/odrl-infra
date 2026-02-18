import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileCode, Save, RefreshCw, CheckCircle, Code } from 'lucide-react';
import api from '../services/api';
import { cn } from '../lib/utils';

export default function PolicyBuilder() {
    const [formData, setFormData] = useState({
        type: 'Offer',
        uid: `did:oyd:${crypto.randomUUID()}`,
        assigner: '',
        assignee: '',
        target: '',
        action: 'use',
        constraintName: '',
        constraintOperator: 'eq',
        constraintValue: ''
    });

    const [jsonView, setJsonView] = useState(false);

    const generateJson = () => {
        const policy = {
            "@context": "https://www.w3.org/ns/odrl.jsonld",
            "type": formData.type,
            "uid": formData.uid,
            "profile": "http://example.com/odrl:profile:01",
            "permission": [{
                "target": formData.target,
                "action": formData.action,
                "assigner": formData.assigner || undefined,
                "assignee": formData.assignee || undefined
            }]
        };

        if (formData.constraintName) {
            policy.permission[0].constraint = [{
                "leftOperand": formData.constraintName,
                "operator": formData.constraintOperator,
                "rightOperand": formData.constraintValue
            }];
        }

        return policy;
    };

    const createMutation = useMutation({
        mutationFn: async (policy) => {
            const res = await api.post('/oac/policy', policy);
            return res.data;
        },
        onSuccess: () => alert("Policy Created!")
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(generateJson());
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const refreshUid = () => {
        setFormData(prev => ({ ...prev, uid: `did:oyd:${crypto.randomUUID()}` }));
    };

    const policyJson = generateJson();

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">

            {/* Form Side */}
            <div className="flex flex-col h-full overflow-y-auto pr-2">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Policy Builder</h2>
                    <p className="text-gray-500 dark:text-gray-400">Design ODRL Access Policies.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 dark:bg-[#242424] dark:border-white/10 shadow-sm dark:shadow-none">
                        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Core Properties</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors dark:bg-black/20 dark:border-white/10 dark:text-white"
                                >
                                    <option value="Offer">Offer</option>
                                    <option value="Agreement">Agreement</option>
                                    <option value="Request">Request</option>
                                    <option value="Privacy">Privacy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">UID</label>
                                <div className="relative">
                                    <input
                                        name="uid"
                                        value={formData.uid}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors pr-10 font-mono dark:bg-black/20 dark:border-white/10 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={refreshUid}
                                        className="absolute right-2 top-2 p-1.5 hover:bg-gray-200 rounded text-gray-500 dark:text-gray-400 dark:hover:bg-white/10"
                                        title="Generate New UUID"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assigner DID</label>
                            <input
                                name="assigner"
                                placeholder="did:oyd:..."
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors font-mono dark:bg-black/20 dark:border-white/10 dark:text-white"
                                value={formData.assigner}
                                onChange={handleChange}
                            />
                        </div>
                        {formData.type === 'Agreement' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assignee DID</label>
                                <input
                                    name="assignee"
                                    placeholder="did:oyd:..."
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors font-mono dark:bg-black/20 dark:border-white/10 dark:text-white"
                                    value={formData.assignee}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 dark:bg-[#242424] dark:border-white/10 shadow-sm dark:shadow-none">
                        <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 mb-4">Permissions</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Asset Target</label>
                                <input
                                    name="target"
                                    placeholder="http://example.com/asset"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors dark:bg-black/20 dark:border-white/10 dark:text-white"
                                    value={formData.target}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Action</label>
                                <select
                                    name="action"
                                    value={formData.action}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors dark:bg-black/20 dark:border-white/10 dark:text-white"
                                >
                                    <option value="use">use</option>
                                    <option value="read">read</option>
                                    <option value="play">play</option>
                                    <option value="distribute">distribute</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">Constraint (Optional)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    name="constraintName"
                                    placeholder="spatial"
                                    className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-black/20 dark:border-white/10 dark:text-white"
                                    value={formData.constraintName}
                                    onChange={handleChange}
                                />
                                <select
                                    name="constraintOperator"
                                    value={formData.constraintOperator}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-black/20 dark:border-white/10 dark:text-white"
                                >
                                    <option value="eq">eq</option>
                                    <option value="gt">gt</option>
                                    <option value="lt">lt</option>
                                </select>
                                <input
                                    name="constraintValue"
                                    placeholder="https://..."
                                    className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-black/20 dark:border-white/10 dark:text-white"
                                    value={formData.constraintValue}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 px-6 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all flex justify-center items-center gap-2 text-white"
                    >
                        {createMutation.isPending ? <RefreshCw className="animate-spin" /> : <Save />}
                        Create Policy
                    </button>
                </form>
            </div>

            {/* Preview Side */}
            <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-2xl dark:bg-[#1e1e1e] dark:border-white/10">
                <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center dark:bg-[#2a2a2a] dark:border-white/10">
                    <div className="flex items-center gap-2 text-gray-300">
                        <FileCode size={18} />
                        <span className="font-mono text-sm">policy-preview.jsonld</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle size={12} /> Valid JSON-LD
                        </span>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#1e1e1e]">
                    <pre className="font-mono text-sm text-blue-300 leading-relaxed">
                        {JSON.stringify(policyJson, null, 2)}
                    </pre>
                </div>
                {createMutation.data && (
                    <div className="bg-green-900/20 border-t border-green-500/20 p-4">
                        <p className="text-green-400 text-sm font-semibold flex items-center gap-2">
                            <CheckCircle size={16} /> Submitted Successfully
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-1">UID: {createMutation.data.uid}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
