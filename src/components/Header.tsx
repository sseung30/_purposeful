import React from 'react';
import { Target, Calendar, TrendingUp, LogOut, Cloud, HardDrive, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { ExportButton } from './ExportButton';

interface HeaderProps {
  user?: SupabaseUser | null;
  isCloudMode?: boolean;
  onToggleMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, isCloudMode = false, onToggleMode }) => {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(today);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goal Dashboard</h1>
              <p className="text-sm text-gray-600">Track your progress across all timeframes</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span>Keep going!</span>
          </div>
          
          {/* Export Button */}
          <ExportButton />
          
          {/* Storage Mode Toggle */}
          {onToggleMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMode}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                  isCloudMode 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isCloudMode ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
                <span>{isCloudMode ? 'Cloud' : 'Local'}</span>
              </button>
            </div>
          )}
          
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Guest mode</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};