import React from 'react';
import { Heart, BookOpen, MessageCircle, Home, Image as ImageIcon } from 'lucide-react';
import { ViewState } from '../types';

interface NavBarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  hasAnalysis: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ currentView, setView, hasAnalysis }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, icon: Home, label: 'Home' },
    { id: ViewState.GALLERY, icon: ImageIcon, label: 'Gallery' },
    { id: ViewState.STYLE_BOARD, icon: Heart, label: 'Looks' },
    { id: ViewState.GUIDE, icon: BookOpen, label: 'Profile', disabled: !hasAnalysis },
    { id: ViewState.CHAT, icon: MessageCircle, label: 'Coach', disabled: !hasAnalysis },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-aura-200 pb-safe pt-2 px-4 shadow-lg z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setView(item.id)}
            disabled={item.disabled}
            className={`flex flex-col items-center justify-center w-14 transition-colors ${
              currentView === item.id 
                ? 'text-aura-600' 
                : item.disabled 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-aura-500'
            }`}
          >
            <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
