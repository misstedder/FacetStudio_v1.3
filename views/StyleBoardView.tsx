import React, { useState, useEffect } from 'react';
import { Heart, Plus, Camera, Upload, Sparkles, Trash2, Edit3 } from 'lucide-react';
import { SavedLook } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/feedback/Modal';
import { useToast } from '../components/feedback/ToastProvider';
import { pb } from '../services/pocketbase';
import { getCurrentUser } from '../services/auth';

interface StyleBoardViewProps {
  onAddLook: () => void;
}

export const StyleBoardView: React.FC<StyleBoardViewProps> = ({ onAddLook }) => {
  const { showToast } = useToast();
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

  useEffect(() => {
    loadLooks();
  }, []);

  const loadLooks = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const records = await pb.collection('saved_looks').getFullList({
        filter: `user = "${user.id}"`,
        sort: '-created',
      });

      setLooks(records as any);
    } catch (error) {
      console.error('Failed to load looks:', error);
      // If collection doesn't exist yet, just show empty state
      setLooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('saved_looks').delete(id);
      setLooks(looks.filter(look => look.id !== id));
      showToast('Look deleted', 'success');
    } catch (error) {
      showToast('Failed to delete look', 'error');
    }
  };

  const handleToggleFavorite = async (look: SavedLook) => {
    try {
      const updated = await pb.collection('saved_looks').update(look.id!, {
        is_favorite: !look.is_favorite,
      });
      setLooks(looks.map(l => l.id === look.id ? { ...l, is_favorite: !l.is_favorite } : l));
    } catch (error) {
      showToast('Failed to update favorite', 'error');
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-12 flex items-center justify-center h-full">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-aura-400 mx-auto mb-4 animate-pulse" />
          <p className="text-aura-700">Loading your style board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 flex flex-col h-full animate-fade-in">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-aura-300 to-aura-500 text-white shadow-lg mb-4">
          <Heart size={32} />
        </div>
        <h1 className="text-3xl font-bold text-aura-900 mb-2">Style Board</h1>
        <p className="text-aura-700 leading-relaxed">
          Save your favorite looks, daily makeup, and inspiration
        </p>
      </header>

      {/* Add Button */}
      <button
        onClick={onAddLook}
        className="w-full mb-6 bg-gradient-to-r from-aura-500 to-aura-600 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 font-medium"
      >
        <Plus size={24} />
        Save New Look
      </button>

      {/* Empty State */}
      {looks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-24 h-24 bg-aura-100 rounded-full flex items-center justify-center mb-6">
            <Heart size={48} className="text-aura-400" />
          </div>
          <h2 className="text-xl font-semibold text-aura-900 mb-2">No Saved Looks Yet</h2>
          <p className="text-gray-600 mb-6 max-w-xs">
            Start building your style board by saving your favorite makeup looks and daily inspiration!
          </p>
          <div className="space-y-3 text-left text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <Camera className="text-aura-500 shrink-0 mt-0.5" size={18} />
              <p>Snap photos of your makeup each day</p>
            </div>
            <div className="flex items-start gap-3">
              <Upload className="text-aura-500 shrink-0 mt-0.5" size={18} />
              <p>Save inspiration from anywhere</p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="text-aura-500 shrink-0 mt-0.5" size={18} />
              <p>Track what works for you</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="grid grid-cols-2 gap-4 pb-6">
            {looks.map((look) => (
              <div
                key={look.id}
                className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all animate-scale-in"
              >
                {/* Image */}
                {look.image_src ? (
                  <img
                    src={look.image_src}
                    alt={look.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-aura-100 to-aura-200 flex items-center justify-center">
                    <Sparkles size={48} className="text-aura-400" />
                  </div>
                )}

                {/* Favorite Badge */}
                <button
                  onClick={() => handleToggleFavorite(look)}
                  className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Heart
                    size={18}
                    className={look.is_favorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                  />
                </button>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-aura-900 mb-1 truncate">{look.title}</h3>
                  {look.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{look.description}</p>
                  )}
                  {look.occasion && (
                    <span className="inline-block text-xs bg-aura-100 text-aura-700 px-2 py-1 rounded-full">
                      {look.occasion}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setDeleteModal({ show: true, id: look.id! });
                      }}
                      className="flex-1 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <Modal
          title="Delete Look?"
          message="This will permanently remove this saved look from your style board."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => {
            if (deleteModal.id) handleDelete(deleteModal.id);
            setDeleteModal({ show: false, id: null });
          }}
          onCancel={() => setDeleteModal({ show: false, id: null })}
        />
      )}
    </div>
  );
};
