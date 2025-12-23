import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Plus, User, ChefHat } from 'lucide-react';

interface ProfileSelectorProps {
  profiles: UserProfile[];
  currentProfileId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, currentProfileId, onSelect, onCreateNew }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-stone-200/60 py-3 md:py-4 px-4 md:px-6 flex justify-between items-center sticky top-0 z-40 shadow-sm transition-all">
      <div className="flex items-center gap-3 shrink-0">
        <div className="bg-chef-900 text-white p-2 rounded-xl shadow-lg">
          <ChefHat size={20} />
        </div>
        <span className="font-serif font-bold text-xl text-chef-950 tracking-tight hidden sm:block">ChefAI</span>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end min-w-0">
        {profiles.length > 0 && (
          <div className="relative group max-w-[140px] sm:max-w-[200px] w-full">
            <select
              value={currentProfileId || ''}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full appearance-none text-sm font-medium border border-stone-200 rounded-xl focus:ring-chef-500 focus:border-chef-500 py-2 pl-3 pr-8 bg-white text-stone-700 shadow-sm hover:border-stone-300 transition-colors cursor-pointer truncate"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-stone-400">
                <User size={14} />
            </div>
          </div>
        )}
        
        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 text-sm font-bold text-chef-700 hover:text-chef-900 hover:bg-chef-50 px-3 py-2 rounded-lg transition-colors shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSelector;