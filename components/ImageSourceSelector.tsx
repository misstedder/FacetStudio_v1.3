import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ImageSourceSelectorProps {
  onCamera: () => void;
  onUpload: (imageSrc: string) => void;
  onCancel: () => void;
}

export const ImageSourceSelector: React.FC<ImageSourceSelectorProps> = ({
  onCamera,
  onUpload,
  onCancel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageSrc = event.target?.result as string;
      onUpload(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-aura-50 via-aura-100 to-aura-200 z-40 flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Header */}
      <div className="w-full max-w-md mb-8 text-center">
        <h2 className="text-3xl font-bold text-aura-900 mb-2">Choose Your Photo</h2>
        <p className="text-aura-700">Take a fresh selfie or upload an existing photo</p>
      </div>

      {/* Options */}
      <div className="w-full max-w-md space-y-4">
        {/* Camera Option */}
        <button
          onClick={onCamera}
          className="w-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border-2 border-aura-200 hover:border-aura-400 group animate-scale-in"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-aura-400 to-aura-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Camera size={32} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-aura-900 mb-1">Take Photo</h3>
              <p className="text-sm text-gray-600">Use your camera for a fresh selfie</p>
            </div>
          </div>
        </button>

        {/* Upload Option */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border-2 border-aura-200 hover:border-aura-400 group animate-scale-in"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-aura-300 to-aura-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Upload size={32} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-aura-900 mb-1">Upload Photo</h3>
              <p className="text-sm text-gray-600">Choose from your photo library</p>
            </div>
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        className="mt-8 p-4 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-aura-600 transition-all shadow-lg hover:shadow-xl"
        aria-label="Cancel"
      >
        <X size={24} />
      </button>

      {/* Info */}
      <p className="mt-6 text-xs text-aura-700 text-center max-w-xs">
        Your photos are processed privately and never stored on our servers
      </p>
    </div>
  );
};
