import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Q1VoiceAgentView } from './components/Q1VoiceAgentView';
import { Q2KnowledgeBaseView } from './components/Q2KnowledgeBaseView';
import { Q3MultilingualView } from './components/Q3MultilingualView';
import { Q4LiveNudgesView } from './components/Q4LiveNudgesView';
import { SystemOverviewView } from './components/SystemOverviewView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('q1_voice');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Enterprise Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'q1_voice' && <Q1VoiceAgentView />}
        {activeTab === 'q2_kb' && <Q2KnowledgeBaseView />}
        {activeTab === 'q3_multilingual' && <Q3MultilingualView />}
        {activeTab === 'q4_nudges' && <Q4LiveNudgesView />}
        {activeTab === 'architecture' && <SystemOverviewView />}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Apex Commercial Lending AI Platform • Production Telephony & Intelligence System
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-slate-700">Light Mode Design</span>
            <span>•</span>
            <span>Full Pipeline Operational</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">Sub-500ms P95 Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
