import React, { useState } from 'react';
import { ViewState, AnalysisResult, AnalysisRecord } from './types';
import { NavBar } from './components/NavBar';
import { CameraView } from './components/CameraView';
import { DashboardView } from './views/DashboardView';
import { GuideView } from './views/GuideView';
import { ChatView } from './views/ChatView';
import { GalleryView } from './views/GalleryView';
import { analyzeFace } from './services/geminiService';
import { saveAnalysis, updateRecord } from './services/storage';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  // We track the currently "active" analysis record for the Guide/Chat views
  const [activeRecord, setActiveRecord] = useState<AnalysisRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [initialChatQuery, setInitialChatQuery] = useState<string | null>(null);

  const handleCapture = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setView(ViewState.GUIDE); 
    
    try {
      const result = await analyzeFace(imageSrc);
      
      // Save to history immediately
      const newRecord = await saveAnalysis(imageSrc, result);
      setActiveRecord(newRecord);
      
      setView(ViewState.GUIDE);
    } catch (error) {
      console.error("Analysis Error:", error);
      alert("We couldn't analyze the image. Please try again with better lighting.");
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
  };

  const handleAskCoach = (query: string) => {
    setInitialChatQuery(query);
    setView(ViewState.CHAT);
  };

  const renderContent = () => {
    if (view === ViewState.CAMERA) {
      return (
        <CameraView 
          onCapture={handleCapture} 
          onCancel={() => setView(ViewState.DASHBOARD)} 
        />
      );
    }

    // Main layout with padding for navbar
    return (
      <div className="min-h-screen pb-24 max-w-md mx-auto bg-aura-50 shadow-2xl relative overflow-hidden">
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
        
        <NavBar 
          currentView={view} 
          setView={setView} 
          hasAnalysis={!!activeRecord} 
        />
      </div>
    );
  };

  return (
    <>
      {renderContent()}
    </>
  );
};

export default App;