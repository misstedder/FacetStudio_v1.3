import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Heart, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { useToast } from './feedback/ToastProvider';
import { pb } from '../services/pocketbase';
import { getCurrentUser } from '../services/auth';
import { CameraView } from './CameraView';

interface AddLookFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const OCCASIONS = ['everyday', 'work', 'date', 'party', 'glam', 'natural'];

export const AddLookForm: React.FC<AddLookFormProps> = ({ onClose, onSuccess }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'choose' | 'camera' | 'form'>('choose');
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [occasion, setOccasion] = useState('everyday');
  const [productsUsed, setProductsUsed] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setStep('form');
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (imageSrc: string) => {
    setImage(imageSrc);
    setStep('form');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please add a title for this look', 'error');
      return;
    }

    setSaving(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        showToast('You must be logged in', 'error');
        return;
      }

      await pb.collection('saved_looks').create({
        user: user.id,
        title: title.trim(),
        description: description.trim() || null,
        image_src: image,
        occasion: occasion,
        products_used: productsUsed.trim() || null,
        is_favorite: isFavorite,
      });

      showToast('Look saved to your Style Board!', 'success');
      onSuccess();
    } catch (error) {
      console.error('Failed to save look:', error);
      showToast('Failed to save look. Try again?', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Camera Step
  if (step === 'camera') {
    return (
      <CameraView
        onCapture={handleCameraCapture}
        onCancel={() => setStep('choose')}
      />
    );
  }

  // Form Step
  if (step === 'form') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-aura-50 via-aura-100 to-aura-200 z-50 overflow-y-auto animate-fade-in">
        <div className="min-h-screen px-6 py-8 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-aura-900">Save This Look</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Image Preview */}
          {image && (
            <div className="mb-6 relative rounded-2xl overflow-hidden shadow-xl">
              <img src={image} alt="Preview" className="w-full h-64 object-cover" />
              <button
                onClick={() => {
                  setImage(null);
                  setStep('choose');
                }}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-aura-900 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Date Night Glam, Natural Everyday"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aura-300"
                maxLength={50}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-aura-900 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What do you love about this look? Any tips to remember?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aura-300 resize-none"
                rows={3}
                maxLength={200}
              />
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-sm font-medium text-aura-900 mb-2">
                Occasion
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setOccasion(occ)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      occasion === occ
                        ? 'bg-aura-600 text-white shadow-md'
                        : 'bg-aura-50 text-aura-700 hover:bg-aura-100'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Used */}
            <div>
              <label className="block text-sm font-medium text-aura-900 mb-2">
                Products Used (Optional)
              </label>
              <textarea
                value={productsUsed}
                onChange={(e) => setProductsUsed(e.target.value)}
                placeholder="List the products you used for this look"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aura-300 resize-none"
                rows={2}
                maxLength={300}
              />
            </div>

            {/* Favorite Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-all ${
                  isFavorite ? 'bg-red-100' : 'bg-gray-100'
                }`}
              >
                <Heart
                  size={24}
                  className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                />
              </button>
              <div>
                <p className="font-medium text-aura-900">Mark as Favorite</p>
                <p className="text-xs text-gray-600">Quick access to your go-to looks</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-white text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors shadow-md"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              variant="primary"
              isLoading={saving}
              className="flex-1"
            >
              Save Look
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Choose Source Step
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-aura-50 via-aura-100 to-aura-200 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Header */}
      <div className="w-full max-w-md mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-aura-300 to-aura-500 text-white shadow-lg mb-4">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-bold text-aura-900 mb-2">Add a Look</h2>
        <p className="text-aura-700">Capture or upload a photo of your makeup</p>
      </div>

      {/* Options */}
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => setStep('camera')}
          className="w-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border-2 border-aura-200 hover:border-aura-400 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-aura-400 to-aura-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Camera size={32} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-aura-900 mb-1">Take Photo</h3>
              <p className="text-sm text-gray-600">Capture your look right now</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border-2 border-aura-200 hover:border-aura-400 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-aura-300 to-aura-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Upload size={32} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-aura-900 mb-1">Upload Photo</h3>
              <p className="text-sm text-gray-600">Choose from your library</p>
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

      {/* Cancel */}
      <button
        onClick={onClose}
        className="mt-8 p-4 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-aura-600 transition-all shadow-lg"
      >
        <X size={24} />
      </button>
    </div>
  );
};
