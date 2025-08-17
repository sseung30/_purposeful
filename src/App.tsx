import React from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { AuthModal } from './components/AuthModal';
import { CloudSyncBanner } from './components/CloudSyncBanner';
import { Header } from './components/Header';
import { GoalBoard } from './components/GoalBoard';
import { useSupabaseGoals } from './hooks/useSupabaseGoals';
import { useLocalGoals } from './hooks/useLocalGoals';
import { GoalBoard as GoalBoardType } from './types/Goal';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [useCloudStorage, setUseCloudStorage] = useState(false);

  // Local storage hooks
  const localGoals = useLocalGoals();
  
  // Cloud storage hooks
  const cloudGoals = useSupabaseGoals();

  return (
    <AuthWrapper>
      {(user) => {
        // Auto-switch to cloud storage when user is logged in
        const isCloudMode = user && useCloudStorage;
        const goals = isCloudMode ? cloudGoals : localGoals;

        const handleToggleMode = () => {
          if (!user) {
            setShowAuthModal(true);
          } else {
            setUseCloudStorage(!useCloudStorage);
          }
        };

        const handleAuthSuccess = () => {
          setShowAuthModal(false);
          setUseCloudStorage(true);
        };

        if (goals.loading) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="flex items-center gap-3 text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading your goals...</span>
              </div>
            </div>
          );
        }

        const dailyBoard = goals.getBoardByTimeframe('daily');
        const weeklyBoard = goals.getBoardByTimeframe('weekly');
        const monthlyBoard = goals.getBoardByTimeframe('monthly');
        const quarterlyBoard = goals.getBoardByTimeframe('quarterly');
        const yearlyBoard = goals.getBoardByTimeframe('yearly');
        const lifelongBoard = goals.getBoardByTimeframe('lifelong');

        const handleAddTask = (timeframe: GoalBoardType['timeframe']) => (taskText: string) => {
          goals.addTask(timeframe, taskText);
        };

        const handleUpdateTaskOrder = (timeframe: GoalBoardType['timeframe']) => (tasks: any[]) => {
          goals.updateTaskOrder(timeframe, tasks);
        };

        const handleToggleTaskCompletion = (timeframe: GoalBoardType['timeframe']) => (taskId: string) => {
          goals.toggleTaskCompletion(timeframe, taskId);
        };

        const handleDeleteTask = (timeframe: GoalBoardType['timeframe']) => (taskId: string) => {
          goals.deleteTask(timeframe, taskId);
        };

        const handleUpdateTaskText = (timeframe: GoalBoardType['timeframe']) => (taskId: string, newText: string) => {
          goals.updateTaskText(timeframe, taskId, newText);
        };

        const handleDateChange = (timeframe: GoalBoardType['timeframe']) => (newDate: Date) => {
          goals.updateBoardDate(timeframe, newDate);
        };

        return (
          <div className="min-h-screen bg-gray-50">
            <Header 
              user={user} 
              isCloudMode={isCloudMode} 
              onToggleMode={handleToggleMode}
            />
            
            <main className="p-6">
              {/* Cloud Sync Banner - only show when not logged in */}
              {!user && (
                <CloudSyncBanner onSignIn={() => setShowAuthModal(true)} />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
                {/* Daily Goals - 25% */}
                <div className="lg:col-span-1">
                  {dailyBoard && (
                    <GoalBoard
                      board={dailyBoard}
                      onUpdateTaskOrder={handleUpdateTaskOrder('daily')}
                      onToggleTaskCompletion={handleToggleTaskCompletion('daily')}
                      onDeleteTask={handleDeleteTask('daily')}
                      onUpdateTaskText={handleUpdateTaskText('daily')}
                      onAddTask={handleAddTask('daily')}
                      onDateChange={handleDateChange('daily')}
                      className="h-full"
                    />
                  )}
                </div>

                {/* Weekly Goals - 25% */}
                <div className="lg:col-span-1">
                  {weeklyBoard && (
                    <GoalBoard
                      board={weeklyBoard}
                      onUpdateTaskOrder={handleUpdateTaskOrder('weekly')}
                      onToggleTaskCompletion={handleToggleTaskCompletion('weekly')}
                      onDeleteTask={handleDeleteTask('weekly')}
                      onUpdateTaskText={handleUpdateTaskText('weekly')}
                      onAddTask={handleAddTask('weekly')}
                      onDateChange={handleDateChange('weekly')}
                      className="h-full"
                    />
                  )}
                </div>

                {/* Long-term Goals - 50% in 2x2 grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                    {/* Monthly Goals */}
                    <div className="h-full">
                      {monthlyBoard && (
                        <GoalBoard
                          board={monthlyBoard}
                          onUpdateTaskOrder={handleUpdateTaskOrder('monthly')}
                          onToggleTaskCompletion={handleToggleTaskCompletion('monthly')}
                          onDeleteTask={handleDeleteTask('monthly')}
                          onUpdateTaskText={handleUpdateTaskText('monthly')}
                          onAddTask={handleAddTask('monthly')}
                          onDateChange={handleDateChange('monthly')}
                          className="h-full"
                        />
                      )}
                    </div>
                    
                    {/* Quarterly Goals */}
                    <div className="h-full">
                      {quarterlyBoard && (
                        <GoalBoard
                          board={quarterlyBoard}
                          onUpdateTaskOrder={handleUpdateTaskOrder('quarterly')}
                          onToggleTaskCompletion={handleToggleTaskCompletion('quarterly')}
                          onDeleteTask={handleDeleteTask('quarterly')}
                          onUpdateTaskText={handleUpdateTaskText('quarterly')}
                          onAddTask={handleAddTask('quarterly')}
                          onDateChange={handleDateChange('quarterly')}
                          className="h-full"
                        />
                      )}
                    </div>
                    
                    {/* Yearly Goals */}
                    <div className="h-full">
                      {yearlyBoard && (
                        <GoalBoard
                          board={yearlyBoard}
                          onUpdateTaskOrder={handleUpdateTaskOrder('yearly')}
                          onToggleTaskCompletion={handleToggleTaskCompletion('yearly')}
                          onDeleteTask={handleDeleteTask('yearly')}
                          onUpdateTaskText={handleUpdateTaskText('yearly')}
                          onAddTask={handleAddTask('yearly')}
                          onDateChange={handleDateChange('yearly')}
                          className="h-full"
                        />
                      )}
                    </div>

                    {/* Life Goals */}
                    <div className="h-full">
                      {lifelongBoard && (
                        <GoalBoard
                          board={lifelongBoard}
                          onUpdateTaskOrder={handleUpdateTaskOrder('lifelong')}
                          onToggleTaskCompletion={handleToggleTaskCompletion('lifelong')}
                          onDeleteTask={handleDeleteTask('lifelong')}
                          onUpdateTaskText={handleUpdateTaskText('lifelong')}
                          onAddTask={handleAddTask('lifelong')}
                          onDateChange={handleDateChange('lifelong')}
                          className="h-full"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Auth Modal */}
            <AuthModal 
              isOpen={showAuthModal} 
              onClose={() => setShowAuthModal(false)}
              onSuccess={handleAuthSuccess}
            />
          </div>
        );
      }}
    </AuthWrapper>
  );
}

export default App;