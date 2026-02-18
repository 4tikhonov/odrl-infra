import React from 'react';

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to ODRL Infrastructure</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your Decentralized Identifiers, Verifiable Credentials, and Access Policies.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-[#242424] dark:border-white/10 hover:border-indigo-500/50 transition-colors shadow-sm dark:shadow-none">
                    <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">DID Manager</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Create, resolve, and manage your decentralized identifiers.</p>
                </div>
                <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-[#242424] dark:border-white/10 hover:border-cyan-500/50 transition-colors shadow-sm dark:shadow-none">
                    <h3 className="text-xl font-semibold mb-2 text-cyan-600 dark:text-cyan-400">VC Wallet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Issue and store Verifiable Credentials for Google, GitHub, and more.</p>
                </div>
                <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-[#242424] dark:border-white/10 hover:border-purple-500/50 transition-colors shadow-sm dark:shadow-none">
                    <h3 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-400">Policy Builder</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Design and deploy ODRL access control policies using your DIDs.</p>
                </div>
            </div>
        </div>
    );
}
