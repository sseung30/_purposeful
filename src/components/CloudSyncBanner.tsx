import React from 'react';
import { Cloud, Smartphone, Monitor, Shield } from 'lucide-react';

interface CloudSyncBannerProps {
  onSignIn: () => void;
}

export const CloudSyncBanner: React.FC<CloudSyncBannerProps> = ({ onSignIn }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
          <Cloud className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Unlock Cloud Sync</h3>
          <p className="text-sm text-gray-600 mb-3">
            Sign in to sync your goals across all devices and never lose your progress.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              <span>Desktop</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
          </div>
          <button
            onClick={onSignIn}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Sign in for free
          </button>
        </div>
      </div>
    </div>
  );
};