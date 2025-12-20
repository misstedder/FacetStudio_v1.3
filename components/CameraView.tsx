import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, X, Check, Camera } from 'lucide-react';
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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setTimeout(() => setIsReady(true), 500);
        };
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      capturePhoto();
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const capturePhoto = () => {
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

        const imageSrc = canvas.toDataURL('image/jpeg', 0.85);

        // Flash animation
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 200);

        // Show preview
        setCapturedImage(imageSrc);
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      stopCamera();
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCountdown(null);
  };

  const handleCapture = () => {
    if (countdown !== null) return; // Already capturing
    startCountdown();
  };

  return (
    <div className="fixed inset-0 bg-black z-40 flex flex-col">
      {/* Flash Effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-fade-out pointer-events-none" />
      )}

      {/* Main Camera/Preview Area */}
      <div className="relative flex-1 bg-gray-900 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center animate-scale-in">
            <Camera size={64} className="mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
            <p className="text-white/70">{error}</p>
          </div>
        ) : capturedImage ? (
          // Photo Preview
          <img
            src={capturedImage}
            alt="Captured preview"
            className="absolute inset-0 w-full h-full object-cover animate-scale-in"
          />
        ) : (
          // Live Camera Feed
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-opacity duration-500 ${
                isReady ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative">
                {/* Oval face guide with gradient border */}
                <div className="w-72 h-96 border-4 border-aura-300/40 rounded-[50%] shadow-[0_0_40px_rgba(225,29,72,0.3)]" />

                {/* Corner guides for better positioning */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12">
                  <div className="flex gap-2 items-center bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-white text-sm font-medium">
                      {isReady ? 'Ready to capture' : 'Loading camera...'}
                    </p>
                  </div>
                </div>

                {/* Helper text */}
                <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/70 text-xs text-center px-4">
                  Center your face within the oval
                </p>
              </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20">
                <div className="text-white text-9xl font-bold animate-scale-in">
                  {countdown}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-white p-6 pb-safe pt-8 rounded-t-3xl -mt-6 z-10 flex flex-col items-center shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <canvas ref={canvasRef} className="hidden" />

        {capturedImage ? (
          // Preview Controls
          <div className="w-full max-w-xs space-y-4 animate-slide-up">
            <p className="text-center text-aura-800 font-medium">How does this look?</p>
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-4 rounded-xl bg-aura-600 text-white hover:bg-aura-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Use Photo
              </button>
            </div>
          </div>
        ) : (
          // Capture Controls
          <div className="flex w-full justify-between items-center max-w-xs px-4">
            <button
              onClick={onCancel}
              className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
              aria-label="Cancel"
            >
              <X size={24} />
            </button>

            <button
              onClick={handleCapture}
              disabled={!isReady || countdown !== null}
              className={`relative w-20 h-20 rounded-full border-4 border-aura-200 bg-aura-600 hover:bg-aura-700 transition-all shadow-lg flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-aura-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isReady && countdown === null ? 'hover:scale-110 active:scale-95' : ''
              }`}
              aria-label="Capture Photo"
            >
              <div className="w-16 h-16 rounded-full bg-white/90" />
              {countdown === null && isReady && (
                <div className="absolute inset-0 rounded-full border-4 border-aura-400 animate-ping" />
              )}
            </button>

            <div className="w-16" />
          </div>
        )}

        {!capturedImage && (
          <p className="mt-4 text-aura-800 font-medium text-sm">
            {countdown !== null ? 'Get ready...' : isReady ? 'Tap to start countdown' : 'Preparing...'}
          </p>
        )}
      </div>
    </div>
  );
};
