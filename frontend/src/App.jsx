import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DidManager from './pages/DidManager';
import VcWallet from './pages/VcWallet';
import PolicyBuilder from './pages/PolicyBuilder';
import Demo from './pages/Demo';
import PromptsManager from './pages/PromptsManager';
import VariablesManager from './pages/VariablesManager';
import CroissantsManager from './pages/CroissantsManager';
import GroupsManager from './pages/GroupsManager';

import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dids" element={<DidManager />} />
              <Route path="/vcs" element={<VcWallet />} />
              <Route path="/policies" element={<PolicyBuilder />} />
              <Route path="/prompts" element={<PromptsManager />} />
              <Route path="/variables" element={<VariablesManager />} />
              <Route path="/croissants" element={<CroissantsManager />} />
              <Route path="/groups" element={<GroupsManager />} />
              <Route path="/demo" element={<Demo />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
