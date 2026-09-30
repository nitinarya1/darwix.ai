import React from 'react';
import { 
  PhoneCall, 
  Database, 
  Languages, 
  Zap, 
  FileText, 
  CheckCircle2, 
  Sun
} from 'lucide-react';

export type ActiveTab = 'q1_voice' | 'q2_kb' | 'q3_multilingual' | 'q4_nudges' | 'architecture';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'q1_voice' as ActiveTab, label: 'Q1: Grounded Voice Agent', icon: PhoneCall },
    { id: 'q2_kb' as ActiveTab, label: 'Q2: Production Knowledge Base', icon: Database },
    { id: 'q3_multilingual' as ActiveTab, label: 'Q3: Native SE Asia Bots', icon: Languages },
    { id: 'q4_nudges' as ActiveTab, label: 'Q4: Live Call Nudges & Latency', icon: Zap },
    { id: 'architecture' as ActiveTab, label: 'Architecture & Evaluation', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              AI
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">Apex AI Engineer Platform</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Voice Agent • Grounded RAG • SE Asia Localization • Real-Time Audio Nudges
              </p>
            </div>
          </div>

          {/* Light mode indicator & metadata */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-medium">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Light Mode</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
