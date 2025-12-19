import React, { useEffect, useState } from 'react';
import { Trash2, Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { AnalysisRecord } from '../types';
import { getHistory, deleteRecord } from '../services/storage';
import { Button } from '../components/Button';

interface GalleryViewProps {
  onSelectRecord: (record: AnalysisRecord) => void;
  onNewAnalysis: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onSelectRecord, onNewAnalysis }) => {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const records = await getHistory();
      setHistory(records);
    };
    loadHistory();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this analysis?")) {
      const updated = await deleteRecord(id);
      setHistory(updated);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-8 text-center">
        <div className="w-16 h-16 bg-aura-100 rounded-full flex items-center justify-center text-aura-500 mb-6">
          <ImageIcon size={32} />
        </div>
        <h2 className="text-xl font-semibold text-aura-900 mb-2">No Past Analyses</h2>
        <p className="text-gray-600 mb-8">Start your first analysis to build your personalized gallery.</p>
        <Button onClick={onNewAnalysis}>Start Analysis</Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-aura-900">History</h1>
        <p className="text-sm text-aura-600">Your past consultations and looks.</p>
      </header>

      <div className="grid gap-4">
        {history.map((record) => (
          <div 
            key={record.id}
            onClick={() => onSelectRecord(record)}
            className="bg-white rounded-2xl p-3 shadow-sm border border-aura-100 flex items-center gap-4 cursor-pointer hover:border-aura-300 transition-colors group"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
              <img src={record.imageSrc} alt="Analysis" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                 <span className="font-semibold text-aura-900 text-sm truncate">
                    {record.result.faceShape} &bull; {record.result.undertone}
                 </span>
              </div>
              <div className="flex items-center text-xs text-gray-400 gap-1">
                <Calendar size={12} />
                {formatDate(record.timestamp)}
              </div>
            </div>

            <button 
              onClick={(e) => handleDelete(e, record.id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
            <div className="p-2 text-aura-300 group-hover:text-aura-600">
               <ArrowRight size={18} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
