import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const MAX_SIZE = 1024;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round(width * (MAX_SIZE / height));
          height = MAX_SIZE;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); 
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-40 flex flex-col">
      <div className="relative flex-1 bg-gray-900 overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full text-white p-6 text-center">
            {error}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
          />
        )}
        
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <div className="w-64 h-80 border-2 border-white/30 rounded-[50%] border-dashed"></div>
           <p className="absolute top-10 text-white/80 text-sm font-medium bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm">
             Position your face within the frame
           </p>
        </div>
      </div>

      <div className="bg-white p-6 pb-safe pt-8 rounded-t-3xl -mt-6 z-10 flex flex-col items-center shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="flex w-full justify-between items-center max-w-xs px-4">
           <button 
            onClick={onCancel}
            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
           >
             <RotateCcw size={24} />
           </button>

           <button 
             onClick={handleCapture}
             className="w-20 h-20 rounded-full border-4 border-aura-200 bg-aura-600 hover:bg-aura-700 transition-colors shadow-lg flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-aura-200"
             aria-label="Capture Photo"
           >
             <div className="w-16 h-16 rounded-full border-2 border-white/20"></div>
           </button>
           
           <div className="w-12"></div> 
        </div>
        <p className="mt-4 text-aura-800 font-medium text-sm">Tap to Analyze</p>
      </div>
    </div>
  );
};
