const fs = require('fs');
const path = require('path');

// Create a simple script to copy all project files
console.log('Goal Dashboard Project Files');
console.log('============================');
console.log('');
console.log('Copy the following files to your local project:');
console.log('');

const files = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'tailwind.config.js',
  'postcss.config.js',
  'eslint.config.js',
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
  'src/vite-env.d.ts',
  'src/types/Goal.ts',
  'src/lib/supabase.ts',
  'src/lib/database.types.ts',
  'src/utils/dateHelpers.ts',
  'src/components/Header.tsx',
  'src/components/GoalBoard.tsx',
  'src/components/TaskItem.tsx',
  'src/components/AuthWrapper.tsx',
  'src/components/AuthForm.tsx',
  'src/components/AuthModal.tsx',
  'src/components/CloudSyncBanner.tsx',
  'src/hooks/useLocalGoals.ts',
  'src/hooks/useSupabaseGoals.ts',
  'src/services/localGoalStorage.ts',
  'src/services/supabaseGoalStorage.ts'
];

files.forEach(file => {
  console.log(`- ${file}`);
});