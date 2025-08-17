import React from 'react';
import { Download } from 'lucide-react';
import { exportProject } from '../utils/projectExporter';

export const ExportButton: React.FC = () => {
  const handleExport = async () => {
    try {
      await exportProject();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
    >
      <Download className="w-4 h-4" />
      Export Project
    </button>
  );
};