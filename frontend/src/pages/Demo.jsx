import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Play, CheckCircle, Circle, ArrowRight, FileJson, Loader2, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { cn } from '../lib/utils';

const SCENARIO_STEPS = [
    { id: 'assigner', label: 'Create Assigner DID', description: 'Creating identity for the content owner (Alice)' },
    { id: 'assignee', label: 'Create Assignee DID', description: 'Creating identity for the consumer (Bob)' },
    { id: 'policy', label: 'Create ODRL Offer', description: 'Alice offers Bob permission to "play" the movie' },
    { id: 'verify', label: 'Verify Policy', description: 'Retrieve and validate the created policy' },
];

const ResolverLink = ({ did }) => {
    if (!did) return null;
    return (
        <a
            href={`https://dev.uniresolver.io/1.0/identifiers/${did}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300"
            title="View on Universal Resolver"
        >
            {did} <ExternalLink size={12} />
        </a>
    );
};

export default function Demo() {
    const [activeStep, setActiveStep] = useState(-1);
    const [logs, setLogs] = useState([]);
    const [results, setResults] = useState({});

    const addLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const runScenario = async () => {
        setActiveStep(0);
        setLogs([]);
        setResults({});

        try {
            // Step 1: Create Assigner
            addLog("Creating Assigner Identity...");
            const assignerRes = await api.post('/did/create', { payload: { name: "Alice", role: "Content Creator" } });
            const assignerDid = assignerRes.data.did;
            setResults(prev => ({ ...prev, assigner: assignerRes.data }));
            addLog(`Assigner Created: ${assignerDid}`);
            console.log("Assigner Result:", assignerRes.data);
            setActiveStep(1);

            // Step 2: Create Assignee
            await new Promise(r => setTimeout(r, 800)); // Visual delay
            addLog("Creating Assignee Identity...");
            const assigneeRes = await api.post('/did/create', { payload: { name: "Bob", role: "Consumer" } });
            const assigneeDid = assigneeRes.data.did;
            setResults(prev => ({ ...prev, assignee: assigneeRes.data }));
            addLog(`Assignee Created: ${assigneeDid}`);
            setActiveStep(2);

            // Step 3: Create Policy
            await new Promise(r => setTimeout(r, 800));
            addLog("Drafting ODRL Offer...");
            const policyPayload = {
                "@context": "https://www.w3.org/ns/odrl.jsonld",
                "type": "Offer",
                "uid": `did:oyd:${crypto.randomUUID()}`,
                "profile": "http://example.com/odrl:profile:01",
                "permission": [{
                    "target": "http://example.com/movie/123",
                    "action": "play",
                    "assigner": assignerDid,
                    "assignee": assigneeDid
                }]
            };
            const policyRes = await api.post('/oac/policy', policyPayload);
            setResults(prev => ({ ...prev, policy: policyRes.data }));
            console.log("Policy Result:", policyRes.data);
            addLog(`Policy Created! UID: ${policyRes.data.uid}`);
            setActiveStep(3);

            // Step 4: Verify
            await new Promise(r => setTimeout(r, 800));
            addLog("Verifying Policy Integrity...");
            const verifyRes = await api.get(`/oac/policy/${encodeURIComponent(policyRes.data.uid)}`);
            setResults(prev => ({ ...prev, verify: verifyRes.data }));
            addLog("Verification Successful. Scenario Complete.");
            setActiveStep(4); // Done

        } catch (error) {
            addLog(`ERROR: ${error.message}`);
            console.error(error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Live Demo Scenario</h2>
                <p className="text-gray-500 dark:text-gray-400">Automated end-to-end ODRL workflow verification.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                {/* Left: Controls & Timeline */}
                <div className="lg:col-span-1 flex flex-col bg-white border border-gray-200 rounded-xl p-6 dark:bg-[#242424] dark:border-white/10 shadow-sm dark:shadow-none">
                    <button
                        onClick={runScenario}
                        disabled={activeStep >= 0 && activeStep < 4}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 transition-all flex justify-center items-center gap-2 mb-8 text-white"
                    >
                        {activeStep >= 0 && activeStep < 4 ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                        {activeStep === 4 ? 'Run Again' : 'Start Scenario'}
                    </button>

                    <div className="space-y-6 relative ml-2">
                        {/* Connecting Line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-white/10 -z-0"></div>

                        {SCENARIO_STEPS.map((step, idx) => {
                            const isActive = activeStep === idx;
                            const isCompleted = activeStep > idx;

                            return (
                                <div key={step.id} className="relative z-10 flex gap-4">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors bg-white dark:bg-[#242424]",
                                        isActive ? "border-green-500 text-green-500" :
                                            isCompleted ? "border-green-500 bg-green-500 text-white" :
                                                "border-gray-200 text-gray-400 dark:border-white/20 dark:text-gray-500"
                                    )}>
                                        {isCompleted ? <CheckCircle size={14} /> : <Circle size={10} fill={isActive ? "currentColor" : "none"} />}
                                    </div>
                                    <div>
                                        <h4 className={cn("font-medium transition-colors", isActive || isCompleted ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500")}>
                                            {step.label}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 leading-tight mt-1">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-200 dark:border-white/10">
                        <h4 className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-2">Execution Logs</h4>
                        <div className="bg-gray-50 rounded-lg p-3 h-32 overflow-y-auto font-mono text-xs text-green-700 space-y-1 dark:bg-black/40 dark:text-green-300">
                            {logs.length === 0 ? <span className="text-gray-400 dark:text-gray-600 italic">Ready to start...</span> : logs.map((l, i) => <div key={i}>{l}</div>)}
                        </div>
                    </div>
                </div>

                {/* Right: Results Display */}
                <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl flex flex-col overflow-hidden dark:bg-[#1e1e1e] dark:border-white/10 shadow-sm dark:shadow-none">
                    <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center dark:bg-[#2a2a2a] dark:border-white/10">
                        <span className="font-semibold text-gray-600 flex items-center gap-2 dark:text-gray-300">
                            <FileJson size={18} /> Live Data Output
                        </span>
                    </div>

                    <div className="flex-1 overflow-auto p-6 space-y-6 custom-scrollbar bg-gray-50 dark:bg-[#1e1e1e]">
                        {!results.assigner && !results.assignee && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                <Play size={48} className="mb-4 opacity-20" />
                                <p>Run the scenario to see live API data.</p>
                            </div>
                        )}

                        {/* Assigner & Assignee Cards */}
                        {(results.assigner || results.assignee) && (
                            <div className="grid grid-cols-2 gap-4">
                                {results.assigner && (
                                    <div className="bg-white p-4 rounded-lg border border-indigo-200 animate-in fade-in slide-in-from-bottom-4 dark:bg-[#242424] dark:border-indigo-500/30">
                                        <h5 className="text-xs text-indigo-600 font-bold uppercase mb-2 dark:text-indigo-400">Assigner (Alice)</h5>
                                        <p className="font-mono text-xs break-all text-gray-700 dark:text-gray-300"><ResolverLink did={results.assigner.did} /></p>
                                    </div>
                                )}
                                {results.assignee && (
                                    <div className="bg-white p-4 rounded-lg border border-cyan-200 animate-in fade-in slide-in-from-bottom-4 dark:bg-[#242424] dark:border-cyan-500/30">
                                        <h5 className="text-xs text-cyan-600 font-bold uppercase mb-2 dark:text-cyan-400">Assignee (Bob)</h5>
                                        <p className="font-mono text-xs break-all text-gray-700 dark:text-gray-300"><ResolverLink did={results.assignee.did} /></p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Policy Result */}
                        {results.policy && (
                            <div className="bg-white p-4 rounded-lg border border-purple-200 animate-in fade-in slide-in-from-bottom-4 dark:bg-[#242424] dark:border-purple-500/30">
                                <h5 className="text-xs text-purple-600 font-bold uppercase mb-2 flex items-center justify-between dark:text-purple-400">
                                    <span>Generated Policy</span>
                                    <span className="text-[10px] bg-purple-100 px-2 py-0.5 rounded text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">Offer</span>
                                </h5>
                                <div className="mb-2">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">UID: </span>
                                    {(results.policy.uid || results.policy['odrl:uid']) ? (
                                        <ResolverLink did={results.policy.uid || results.policy['odrl:uid']} />
                                    ) : (
                                        <span className="text-red-500 text-xs">UID missing</span>
                                    )}
                                </div>
                                <pre className="font-mono text-xs text-gray-700 overflow-x-auto dark:text-gray-300">
                                    {JSON.stringify(results.policy, null, 2)}
                                </pre>
                            </div>
                        )}

                        {/* Verification Result */}
                        {results.verify && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200 animate-in fade-in slide-in-from-bottom-4 dark:bg-green-900/10 dark:border-green-500/30">
                                <h5 className="text-xs text-green-600 font-bold uppercase mb-2 flex items-center gap-2 dark:text-green-400">
                                    <CheckCircle size={14} /> Verification Check
                                </h5>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Successfully retrieved policy
                                    {(results.verify['odrl:uid'] || results.verify.uid) ? (
                                        <ResolverLink did={results.verify['odrl:uid'] || results.verify.uid} />
                                    ) : (
                                        <code>UNKNOWN_UID</code>
                                    )}
                                    from the ODRL store. The policy is valid and active.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
