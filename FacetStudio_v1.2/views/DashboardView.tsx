import React from 'react';
import { Sparkles, Gem, Heart } from 'lucide-react';
import { Button } from '../components/Button';

interface DashboardViewProps {
  onStartAnalysis: () => void;
  hasAnalysis: boolean;
  onViewResults: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartAnalysis, hasAnalysis, onViewResults }) => {
  return (
    <div className="px-6 py-12 flex flex-col h-full">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-aura-300 to-aura-500 text-white shadow-lg mb-6 transform rotate-3">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-bold text-aura-900 mb-1 tracking-tight">FacetStudio</h1>
        <p className="text-xs text-aura-500 font-medium mb-3 uppercase tracking-widest">By Di3s</p>
        <p className="text-aura-700 leading-relaxed text-lg">
          Your AI-powered makeup coach for personalized, skill-building education.
        </p>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        {!hasAnalysis ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-aura-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-aura-100 rounded-full flex items-center justify-center text-aura-600 mb-4">
              <Gem size={24} />
            </div>
            <h2 className="text-xl font-semibold text-aura-900 mb-2">Discover Your Unique Facets</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              We analyze your unique structure and skin characteristics to teach you techniques that celebrate your natural beauty—never to "fix" it.
            </p>
            <Button onClick={onStartAnalysis} className="w-full">
              Start Analysis
            </Button>
            <p className="mt-4 text-xs text-gray-400">
              Private & On-Device Processing
            </p>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-aura-100 text-center">
              <h2 className="text-2xl font-semibold text-aura-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600 mb-6">Your personalized guide is ready.</p>
              <div className="grid gap-3">
                 <Button onClick={onViewResults} variant="primary" className="w-full">
                  View My Guide
                </Button>
                <Button onClick={onStartAnalysis} variant="secondary" className="w-full">
                  New Analysis
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-8">
           <div className="flex items-center gap-4 bg-aura-100/50 p-4 rounded-xl">
             <Heart className="text-aura-500 shrink-0" size={20} />
             <p className="text-xs text-aura-800 font-medium">
               FacetStudio does not store your photos. All analysis is used solely to generate your educational plan.
             </p>
           </div>
        </div>
      </main>
    </div>
  );
};