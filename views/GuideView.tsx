
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { AnalysisResult, AnalysisRecord, FaceShape, Undertone, SkinType, EyeColor } from '../types';
import { Button } from '../components/Button';
import { RefreshCw, Info, Download, Sparkles, Wand2, Edit2, ChevronDown, User, Palette, Droplet, Eye, Play, X, Check, MessageCircle, EyeOff, Search, ExternalLink, Globe } from 'lucide-react';
import { generateMakeupFaceChart, researchMakeupTrends, WebResearchResult } from '../services/geminiService';
import { deriveColorHarmony } from '../utils/colorHarmony';

interface GuideViewProps {
  analysis: AnalysisResult | null;
  record?: AnalysisRecord | null;
  isLoading: boolean;
  onRetry: () => void;
  onUpdateRecord?: (record: AnalysisRecord) => void;
  onAskCoach?: (query: string) => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ analysis, record, isLoading, onRetry, onUpdateRecord, onAskCoach }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeZone, setActiveZone] = useState<{title: string, content: string, topic?: string} | null>(null);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showZones, setShowZones] = useState(true);
  
  const [editValues, setEditValues] = useState<{
    faceShape: FaceShape;
    undertone: Undertone;
    skinType: SkinType;
    eyeColor: EyeColor;
  } | null>(null);

  const toggleRec = (index: number) => {
    setExpandedRecs(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleExport = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        useCORS: true,
        scale: 2, 
        backgroundColor: '#fff1f2',
        logging: false
      });
      const link = document.createElement('a');
      link.download = `FacetStudio-Guide-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Export failed", error);
      alert("Could not export image.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateChart = async () => {
    if (!analysis || !record || !onUpdateRecord) return;
    setIsGeneratingChart(true);
    try {
      const chartBase64 = await generateMakeupFaceChart(
        analysis.faceShape,
        analysis.contourPlacement,
        analysis.blushPlacement
      );
      const updatedRecord = { ...record, visualGuideSrc: chartBase64 };
      onUpdateRecord(updatedRecord);
    } catch (error) {
      alert("Could not generate visual guide right now.");
    } finally {
      setIsGeneratingChart(false);
    }
  };

  const startEditing = () => {
    if (analysis) {
      setEditValues({
        faceShape: analysis.faceShape,
        undertone: analysis.undertone,
        skinType: analysis.skinType,
        eyeColor: analysis.eyeColor || EyeColor.UNKNOWN
      });
      setIsEditing(true);
    }
  };

  const saveEdits = () => {
    if (editValues && record && analysis && onUpdateRecord) {
      const updatedRecord: AnalysisRecord = {
        ...record,
        result: { ...analysis, ...editValues },
        visualGuideSrc: editValues.faceShape !== analysis.faceShape ? undefined : record.visualGuideSrc
      };
      onUpdateRecord(updatedRecord);
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-8 text-center animate-pulse">
        <div className="w-20 h-20 bg-aura-200 rounded-full mb-6"></div>
        <h2 className="text-xl font-semibold text-aura-900 mb-2">Analyzing your features...</h2>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-8 text-center">
        <Button onClick={onRetry}>Start Analysis</Button>
      </div>
    );
  }

  const currentUndertone = (isEditing && editValues) ? editValues.undertone : analysis.undertone;
  const currentEyeColor = (isEditing && editValues) ? editValues.eyeColor : (analysis.eyeColor || EyeColor.UNKNOWN);
  const currentSkinType = (isEditing && editValues) ? editValues.skinType : analysis.skinType;
  
  const colorHarmony = deriveColorHarmony(currentUndertone, currentEyeColor, currentSkinType);

  return (
    <div className="px-6 py-10 animate-fade-in relative">
      {activeZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => setActiveZone(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-aura-100 pb-2">
              <h3 className="text-lg font-bold text-aura-900 flex items-center gap-2">
                <Sparkles size={18} className="text-aura-500"/>
                {activeZone.title}
              </h3>
              <button onClick={() => setActiveZone(null)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-6">
                <p className="text-gray-700 leading-relaxed text-sm">{activeZone.content}</p>
            </div>
            <div className="flex flex-col gap-3">
              {onAskCoach && activeZone.topic && (
                <button 
                  onClick={() => onAskCoach(`Can you explain more about ${activeZone.topic} for my ${analysis.faceShape} face shape?`)}
                  className="w-full py-3 bg-aura-100 text-aura-800 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-aura-200 transition-colors"
                >
                  <MessageCircle size={18} />
                  Ask Coach for Details
                </button>
              )}
              <button onClick={() => setActiveZone(null)} className="w-full py-3 bg-aura-600 text-white rounded-xl text-sm font-semibold hover:bg-aura-700">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
           <h1 className="text-2xl font-bold text-aura-900">Facet Profile</h1>
        </div>
        <div className="flex gap-2">
           {!isEditing && (
             <button onClick={startEditing} className="p-2 bg-white border border-aura-200 rounded-full text-aura-600 shadow-sm hover:bg-aura-50">
               <Edit2 size={20} />
             </button>
           )}
           <button onClick={handleExport} disabled={isExporting} className="p-2 bg-white border border-aura-200 rounded-full text-aura-600 shadow-sm hover:bg-aura-50 disabled:opacity-50">
             {isExporting ? <span className="animate-spin">⌛</span> : <Download size={20} />}
           </button>
        </div>
      </div>

      <div ref={contentRef} className="bg-aura-50 p-1 -m-1"> 
        {record?.imageSrc && (
          <div className="mb-8 flex justify-center">
             <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-aura-300 to-aura-500 shadow-lg">
                <img src={record.imageSrc} alt="User" className="w-full h-full object-cover rounded-full border-2 border-white" />
             </div>
          </div>
        )}

        {isEditing && editValues ? (
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-aura-200 mb-8 z-10 relative">
             <div className="space-y-4">
               <div>
                 <select value={editValues.faceShape} onChange={(e) => setEditValues({...editValues, faceShape: e.target.value as FaceShape})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none text-aura-900">
                   {Object.values(FaceShape).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
               <div>
                  <select value={editValues.undertone} onChange={(e) => setEditValues({...editValues, undertone: e.target.value as Undertone})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none text-aura-900">
                    {Object.values(Undertone).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
               <div>
                  <select value={editValues.skinType} onChange={(e) => setEditValues({...editValues, skinType: e.target.value as SkinType})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none text-aura-900">
                    {Object.values(SkinType).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
               <div>
                  <select value={editValues.eyeColor} onChange={(e) => setEditValues({...editValues, eyeColor: e.target.value as EyeColor})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none text-aura-900">
                    {Object.values(EyeColor).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
             </div>
             <div className="flex gap-2 mt-6">
               <button onClick={() => setIsEditing(false)} className="flex-1 py-3 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
               <button onClick={saveEdits} className="flex-1 py-3 text-sm font-medium text-white bg-aura-600 rounded-xl hover:bg-aura-700">Save</button>
             </div>
          </div>
        ) : (
          <div className="mb-8 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FeatureCard label="Shape" value={analysis.faceShape} icon={<User size={16} />} />
              <FeatureCard label="Undertone" value={analysis.undertone} icon={<Palette size={16} />} />
              <FeatureCard label="Skin" value={analysis.skinType} icon={<Droplet size={16} />} />
              <FeatureCard label="Eyes" value={analysis.eyeColor || "Unknown"} icon={<Eye size={16} />} />
            </div>
            <button onClick={() => setIsDetailsExpanded(!isDetailsExpanded)} className="w-full bg-white p-3 rounded-2xl shadow-sm border border-aura-100 flex items-center justify-between group transition-all">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-aura-50 flex items-center justify-center text-aura-500"><Sparkles size={14} /></div>
                   <div className="text-left">
                     <span className="block text-sm font-semibold text-aura-900">Insights</span>
                   </div>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDetailsExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isDetailsExpanded && (
               <div className="bg-white rounded-2xl p-5 shadow-sm border border-aura-100 animate-fade-in">
                   <div className="mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed pl-2 border-l-2 border-aura-200">{analysis.structuralAnalysis}</p>
                   </div>
                   <div>
                      <p className="text-sm text-gray-600 leading-relaxed pl-2 border-l-2 border-aura-200">{analysis.skinAnalysis}</p>
                   </div>
               </div>
            )}
          </div>
        )}

        <div className="space-y-8">
           <section>
             <div className="flex items-center justify-end mb-3">
                {record?.visualGuideSrc && (
                  <button onClick={() => setShowZones(!showZones)} className={`flex items-center gap-1 text-[10px] font-medium px-3 py-1.5 rounded-full border transition-all ${showZones ? 'bg-aura-100 text-aura-700 border-aura-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                    {showZones ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                )}
             </div>
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-aura-100 flex flex-col items-center text-center">
               {record?.visualGuideSrc ? (
                 <>
                   <div className="relative w-full aspect-[3/4] mb-4">
                     <div className="absolute inset-0 rounded-xl overflow-hidden border border-aura-50 bg-gray-50">
                        <img src={record.visualGuideSrc} alt="Face Chart" className="w-full h-full object-contain mix-blend-multiply" />
                     </div>
                     {(() => {
                        const style = showZones ? { backgroundColor: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(136, 19, 55, 0.4)' } : {};
                        return (
                          <>
                             {/* Contour: Forehead */}
                             <div className="absolute top-[8%] left-[20%] w-[60%] h-[15%] cursor-pointer hover:bg-white/30 transition-all rounded-[50%]" style={style} onClick={() => setActiveZone({ title: "Contour: Forehead", content: analysis.contourPlacement, topic: "seint contour forehead" })} />
                             
                             {/* Brightening Highlight */}
                             <div className="absolute top-[25%] left-[45%] w-[10%] h-[25%] cursor-pointer hover:bg-white/30 transition-all rounded-full" style={style} onClick={() => setActiveZone({ title: "Brightening Highlight", content: "Apply in a slim line down the bridge of your nose and center of forehead.", topic: "seint brightening highlight" })} />
                             <div className="absolute top-[40%] left-[18%] w-[25%] h-[12%] cursor-pointer hover:bg-white/30 transition-all rounded-full" style={style} onClick={() => setActiveZone({ title: "Brightening Highlight", content: "Place in the inner and outer corners of the eyes for a natural lift.", topic: "seint brightening highlight eyes" })} />
                             <div className="absolute top-[40%] right-[18%] w-[25%] h-[12%] cursor-pointer hover:bg-white/30 transition-all rounded-full" style={style} onClick={() => setActiveZone({ title: "Brightening Highlight", content: "Place in the inner and outer corners of the eyes for a natural lift.", topic: "seint brightening highlight eyes" })} />
                             
                             {/* Lip + Cheek */}
                             <div className="absolute top-[52%] left-[20%] w-[25%] h-[10%] cursor-pointer hover:bg-white/30 transition-all rounded-full" style={style} onClick={() => setActiveZone({ title: "Lip + Cheek", content: analysis.blushPlacement, topic: "seint lip and cheek" })} />
                             <div className="absolute top-[52%] right-[20%] w-[25%] h-[10%] cursor-pointer hover:bg-white/30 transition-all rounded-full" style={style} onClick={() => setActiveZone({ title: "Lip + Cheek", content: analysis.blushPlacement, topic: "seint lip and cheek" })} />
                             
                             {/* Contour: Cheekbones */}
                             <div className="absolute top-[58%] left-[12%] w-[25%] h-[12%] cursor-pointer hover:bg-white/30 transition-all rounded-full" style={style} onClick={() => setActiveZone({ title: "Contour: Cheekbones", content: analysis.contourPlacement, topic: "seint contour cheekbones" })} />
                             <div className="absolute top-[58%] right-[12%] w-[25%] h-[12%] cursor-pointer hover:bg-white/30 transition-all rounded-full" style={style} onClick={() => setActiveZone({ title: "Contour: Cheekbones", content: analysis.contourPlacement, topic: "seint contour cheekbones" })} />
                             
                             {/* Contour: Jawline */}
                             <div className="absolute bottom-[8%] left-[25%] w-[50%] h-[10%] cursor-pointer hover:bg-white/30 transition-all rounded-b-3xl" style={style} onClick={() => setActiveZone({ title: "Contour: Jawline", content: "Follow the shadow of your jaw for soft definition.", topic: "seint contour jawline" })} />
                             
                             {/* Main Highlight */}
                             <div className="absolute top-[70%] left-[40%] w-[20%] h-[10%] cursor-pointer hover:bg-white/30 transition-all rounded-full" style={style} onClick={() => setActiveZone({ title: "Main Highlight", content: "Your foundation shade shade. Use sparingly.", topic: "seint main highlight" })} />
                          </>
                        );
                     })()}
                   </div>
                 </>
               ) : (
                 <div className="py-8 px-4 flex flex-col items-center">
                   <div className="w-16 h-16 bg-aura-50 rounded-full flex items-center justify-center text-aura-400 mb-4"><Wand2 size={32} /></div>
                   <Button onClick={handleGenerateChart} isLoading={isGeneratingChart} className="w-full"><Sparkles size={18} /> Generate Guide</Button>
                 </div>
               )}
             </div>
           </section>

           <section>
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-aura-100 space-y-8">
                  <div>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed italic border-l-2 border-aura-200 pl-3">{colorHarmony.explanation}</p>
                    <div className="space-y-6">
                       <PaletteRow colors={colorHarmony.lips} skinType={currentSkinType} />
                       <PaletteRow colors={colorHarmony.eyes} skinType={currentSkinType} />
                       <PaletteRow colors={colorHarmony.cheeks} skinType={currentSkinType} />
                    </div>
                  </div>
               </div>
             </section>

          <section>
            <div className="grid gap-6">
              {analysis.recommendations.map((rec, index) => {
                const isExpanded = expandedRecs.has(index);
                return (
                <div key={index} className={`bg-white rounded-xl overflow-hidden shadow-sm border border-aura-100 transition-all cursor-pointer hover:shadow-md ${isExpanded ? 'ring-2 ring-aura-100' : ''}`} onClick={() => toggleRec(index)}>
                  <VideoSimulation label={rec.category} visualFocus={rec.visualFocus} expanded={isExpanded} />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-aura-900 text-lg">{rec.category}</h3>
                      <ChevronDown size={16} className={`text-aura-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    <p className="text-sm text-gray-700 mb-4">{rec.reasoning}</p>
                    <div className="bg-aura-50 rounded-lg p-3 border border-aura-100">
                      <p className="text-sm text-aura-800 leading-snug">{rec.applicationTip}</p>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps { label: string; value: string; icon?: React.ReactNode; }
const FeatureCard: React.FC<FeatureCardProps> = ({ label, value, icon }) => (
  <div className="bg-white p-3 rounded-2xl text-center shadow-sm border border-aura-100 flex flex-col items-center justify-center aspect-square gap-1">
    {icon && <div className="text-aura-300 mb-1">{icon}</div>}
    <span className="text-aura-800 font-bold text-sm leading-tight">{value}</span>
  </div>
);

const TONE_LABELS = ["Soft", "Everyday", "Bold"];

interface PaletteRowProps { colors: string[]; skinType: SkinType; }
const PaletteRow: React.FC<PaletteRowProps> = ({ colors, skinType }) => (
  <div className="flex items-center justify-between">
    <div className="flex gap-4 flex-1 justify-center">
      {colors && colors.map((color, idx) => (
        <div key={idx} className="flex flex-col items-center gap-1.5">
          <ColorSwatch color={color} skinType={skinType} />
          <span className="text-[10px] text-gray-400 font-bold tracking-tight uppercase">{TONE_LABELS[idx]}</span>
        </div>
      ))}
    </div>
  </div>
);

interface ColorSwatchProps { color: string; skinType: SkinType; }
const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, skinType }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const getFinishClass = () => {
    switch(skinType) {
      case SkinType.OILY: return "brightness-105 saturate-110 ring-2 ring-white/50"; 
      case SkinType.DRY: return "opacity-90 saturate-90";
      default: return "";
    }
  };
  return (
    <div className="group relative cursor-pointer" onClick={handleCopy}>
      <div className={`w-10 h-10 rounded-full border-2 border-white shadow-md transition-all ${getFinishClass()} ${copied ? 'ring-2 ring-aura-500 scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: color }}>
        {copied && <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full"><Check size={14} className="text-white" /></div>}
      </div>
    </div>
  );
};

const VideoSimulation: React.FC<{ label: string, visualFocus: string, expanded: boolean }> = ({ label, visualFocus, expanded }) => {
  const [playing, setPlaying] = useState(false);
  const placeholderUrl = `https://placehold.co/600x400/ffe4e6/881337?text=${encodeURIComponent(visualFocus || label)}`;
  return (
    <div className="relative h-48 bg-gray-100 group overflow-hidden">
       <img src={placeholderUrl} className={`w-full h-full object-cover transition-all duration-1000 ${playing ? 'scale-110 opacity-60 blur-sm' : ''}`} />
       {playing && (
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/70 px-6 py-3 rounded-2xl flex flex-col items-center animate-fade-in">
               <div className="flex gap-1.5 mb-2">
                 <span className="w-1.5 h-6 bg-aura-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-6 bg-aura-400 rounded-full animate-bounce delay-75"></span>
               </div>
            </div>
         </div>
       )}
       <div className="absolute inset-0 flex items-center justify-center">
         <button onClick={(e) => { e.stopPropagation(); setPlaying(!playing); }} className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-aura-600 shadow-lg">
           {playing ? <div className="w-4 h-4 bg-aura-600 rounded-sm" /> : <Play size={20} fill="currentColor" />}
         </button>
       </div>
    </div>
  );
};
