import React, { useState, useEffect } from 'react';
import { ViewState, AnalysisResult, AnalysisRecord } from './types';
import { NavBar } from './components/NavBar';
import { CameraView } from './components/CameraView';
import { DashboardView } from './views/DashboardView';
import { GuideView } from './views/GuideView';
import { ChatView } from './views/ChatView';
import { GalleryView } from './views/GalleryView';
import { analyzeFace } from './services/geminiService';
import { saveAnalysis, updateRecord } from './services/storage';
import { isAuthenticated } from './services/auth';
import { AuthContainer } from './components/auth/AuthContainer';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { ToastProvider, useToast } from './components/feedback/ToastProvider';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

const MainApp: React.FC = () => {
  const { showToast } = useToast();
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [activeRecord, setActiveRecord] = useState<AnalysisRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [initialChatQuery, setInitialChatQuery] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check onboarding on mount
  useEffect(() => {
    const completed = localStorage.getItem('facetStudioOnboardingComplete');
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCapture = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setView(ViewState.GUIDE);

    try {
      const result = await analyzeFace(imageSrc);
      const newRecord = await saveAnalysis(imageSrc, result);
      setActiveRecord(newRecord);
      setView(ViewState.GUIDE);
      showToast('Analysis complete!', 'success');
    } catch (error) {
      console.error('Analysis Error:', error);
      showToast("We couldn't analyze the image. Please try again with better lighting.", 'error');
      setView(ViewState.DASHBOARD);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectRecord = (record: AnalysisRecord) => {
    setActiveRecord(record);
    setView(ViewState.GUIDE);
  };

  const handleUpdateRecord = async (updatedRecord: AnalysisRecord) => {
    await updateRecord(updatedRecord);
    setActiveRecord(updatedRecord);
    showToast('Profile updated', 'success');
  };

  const handleAskCoach = (query: string) => {
    setInitialChatQuery(query);
    setView(ViewState.CHAT);
  };

  const renderContent = () => {
    if (view === ViewState.CAMERA) {
      return (
        <div className="animate-fade-in">
          <CameraView
            onCapture={handleCapture}
            onCancel={() => setView(ViewState.DASHBOARD)}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen pb-24 max-w-md mx-auto bg-aura-50 shadow-2xl relative overflow-hidden">
        <div className="animate-fade-in">
          {view === ViewState.DASHBOARD && (
            <DashboardView
              onStartAnalysis={() => setView(ViewState.CAMERA)}
              hasAnalysis={!!activeRecord}
              onViewResults={() => setView(ViewState.GUIDE)}
            />
          )}

          {view === ViewState.GALLERY && (
            <GalleryView
              onSelectRecord={handleSelectRecord}
              onNewAnalysis={() => setView(ViewState.CAMERA)}
            />
          )}

          {view === ViewState.GUIDE && (
            <GuideView
              analysis={activeRecord?.result || null}
              record={activeRecord}
              isLoading={isAnalyzing}
              onRetry={() => setView(ViewState.CAMERA)}
              onUpdateRecord={handleUpdateRecord}
              onAskCoach={handleAskCoach}
            />
          )}

          {view === ViewState.CHAT && activeRecord && (
            <ChatView
              analysis={activeRecord.result}
              initialQuery={initialChatQuery}
              onClearInitialQuery={() => setInitialChatQuery(null)}
            />
          )}
        </div>

        <NavBar currentView={view} setView={setView} hasAnalysis={!!activeRecord} />
      </div>
    );
  };

  return (
    <>
      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
      {renderContent()}
    </>
  );
};

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  // Poll auth state every second (PocketBase updates authStore automatically)
  useEffect(() => {
    const interval = setInterval(() => {
      setAuthenticated(isAuthenticated());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {authenticated ? <MainApp /> : <AuthContainer />}
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;