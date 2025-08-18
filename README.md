# Goal Dashboard

A beautiful, responsive goal tracking application built with React, TypeScript, and Tailwind CSS. Track your goals across multiple timeframes - daily, weekly, monthly, quarterly, yearly, and lifelong.

## Features

- 📅 **Multi-timeframe tracking** - Daily, weekly, monthly, quarterly, yearly, and lifelong goals
- 🔄 **Drag & drop** - Reorder tasks with intuitive drag and drop
- ☁️ **Cloud sync** - Optional Supabase integration for cross-device synchronization
- 💾 **Local storage** - Works offline with local browser storage
- 📱 **Responsive design** - Beautiful on desktop, tablet, and mobile
- 🎯 **Smart task management** - Tasks persist on completion dates
- 🔐 **Authentication** - Secure user accounts with Supabase Auth

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Local Storage**: LocalForage
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/goal-dashboard.git
   cd goal-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up Supabase for cloud sync:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env` file:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Run the database migrations (see Database Setup below)

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 Vercel Deployment

### Quick Deploy
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL` (optional)
   - `VITE_SUPABASE_ANON_KEY` (optional)
4. Deploy automatically!

### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Database Setup (for cloud sync)

If you want to use cloud sync, you'll need to set up the database schema in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migration file located in `supabase/migrations/`

The schema includes:
- `goal_boards` table for storing goal boards
- `tasks` table for storing individual tasks
- Row Level Security (RLS) policies for user data isolation
- Proper indexes for performance

## Usage

### Local Mode
- Works immediately without any setup
- Data is stored in your browser's local storage
- Perfect for personal use on a single device

### Cloud Mode
- Sign up/sign in to enable cloud sync
- Your goals sync across all your devices
- Data is securely stored in Supabase

### Goal Management
- **Daily Goals**: Track today's tasks, navigate to previous/future dates
- **Weekly Goals**: Plan and track weekly objectives
- **Monthly Goals**: Set and achieve monthly targets
- **Quarterly Goals**: Long-term planning for 3-month periods
- **Yearly Goals**: Annual objectives and resolutions
- **Lifelong Goals**: Your biggest dreams and aspirations

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthForm.tsx    # Authentication form
│   ├── AuthModal.tsx   # Authentication modal
│   ├── AuthWrapper.tsx # Authentication wrapper
│   ├── CloudSyncBanner.tsx # Cloud sync promotion
│   ├── GoalBoard.tsx   # Main goal board component
│   ├── Header.tsx      # Application header
│   └── TaskItem.tsx    # Individual task component
├── hooks/              # Custom React hooks
│   ├── useLocalGoals.ts    # Local storage goals hook
│   └── useSupabaseGoals.ts # Supabase goals hook
├── lib/                # External service configurations
│   ├── database.types.ts   # TypeScript types for database
│   └── supabase.ts         # Supabase client configuration
├── services/           # Business logic services
│   ├── localGoalStorage.ts    # Local storage service
│   └── supabaseGoalStorage.ts # Supabase storage service
├── types/              # TypeScript type definitions
│   └── Goal.ts         # Goal and task type definitions
├── utils/              # Utility functions
│   └── dateHelpers.ts  # Date manipulation helpers
├── App.tsx             # Main application component
├── index.css           # Global styles
└── main.tsx            # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/) for lightning-fast development
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons provided by [Lucide React](https://lucide.dev/)
- Database and authentication powered by [Supabase](https://supabase.com/)