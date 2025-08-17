import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ProjectFile {
  path: string;
  content: string;
}

export const exportProject = async () => {
  const zip = new JSZip();
  
  // Project files with their content
  const files: ProjectFile[] = [
    {
      path: 'package.json',
      content: `{
  "name": "goal-dashboard",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@supabase/supabase-js": "^2.55.0",
    "localforage": "^1.10.0",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}`
    },
    {
      path: 'index.html',
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Goal Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});`
    },
    {
      path: '.gitignore',
      content: `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local`
    },
    {
      path: 'README.md',
      content: `# Goal Dashboard

A beautiful, responsive goal tracking application built with React, TypeScript, and Tailwind CSS.

## Features

- 📅 Multi-timeframe tracking (daily, weekly, monthly, quarterly, yearly, lifelong)
- 🔄 Drag & drop task reordering
- ☁️ Optional cloud sync with Supabase
- 💾 Local storage fallback
- 📱 Fully responsive design

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start development server: \`npm run dev\`

## Optional: Cloud Sync Setup

1. Create a Supabase project
2. Copy \`.env.example\` to \`.env\`
3. Add your Supabase credentials
4. Run the database migrations

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Vite
- Supabase (optional)
- @dnd-kit for drag & drop`
    }
  ];

  // Add all files to zip
  files.forEach(file => {
    zip.file(file.path, file.content);
  });

  // Generate and download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'goal-dashboard-project.zip');
};