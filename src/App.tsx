import React, { useState } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { GoalBoard } from './components/GoalBoard';
import { useSupabaseGoals } from './hooks/useSupabaseGoals';
import { useLocalGoals } from './hooks/useLocalGoals';
import { GoalBoard as GoalBoardType, Task } from './types/Goal';
import { Loader2 } from 'lucide-react';

/**
 * 두 날짜가 연, 월, 일이 모두 같은지 비교하는 헬퍼 함수
 * @param date1 비교할 첫 번째 날짜
 * @param date2 비교할 두 번째 날짜
 * @returns 두 날짜가 같으면 true, 다르면 false
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  // 유효하지 않은 날짜 객체에 대한 방어 코드
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * '일일 목표' 보드에 표시될 태스크를 동적으로 필터링하는 함수
 * @param board 필터링할 '일일 목표' 보드 객체
 * @param allTasks 모든 '일일 목표' 태스크 배열
 * @param today 현재 '오늘' 날짜
 * @returns 필터링된 태스크 배열
 */
const filterDailyTasks = (board: GoalBoardType | undefined, allTasks: Task[], today: Date): Task[] => {
    if (!board) return [];

    const viewingDate = board.currentDate ? new Date(board.currentDate) : new Date();
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    viewingDate.setHours(0, 0, 0, 0);

    // 1. '오늘' 날짜를 보고 있을 때
    // 오늘 할 일 + 이전에 완료하지 못한 모든 태스크 표시
    if (isSameDay(viewingDate, todayDate)) {
        return allTasks.filter(task => {
            const taskCreationDate = task.createdDate ? new Date(task.createdDate) : new Date(0);
            taskCreationDate.setHours(0, 0, 0, 0);
            // 완료되지 않았고, (오늘 또는 이전에 생성된) 태스크
            return !task.completed && taskCreationDate <= todayDate;
        });
    }

    // 2. '과거' 날짜를 보고 있을 때
    // 해당 날짜에 '완료'된 태스크만 표시
    if (viewingDate < todayDate) {
        return allTasks.filter(task => {
            return task.completed && task.completedDate && isSameDay(new Date(task.completedDate), viewingDate);
        });
    }

    // 3. '미래' 날짜를 보고 있을 때
    // 해당 날짜에 '생성'될 태스크만 표시 (미완료 상태)
    if (viewingDate > todayDate) {
        return allTasks.filter(task => {
            const taskCreationDate = task.createdDate ? new Date(task.createdDate) : new Date(0);
            taskCreationDate.setHours(0, 0, 0, 0);
            return isSameDay(taskCreationDate, viewingDate) && !task.completed;
        });
    }

    // 기본적으로 모든 태스크 반환
    return allTasks;
};


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
        // 사용자가 로그인하면 자동으로 클라우드 저장소로 전환
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

        // --- 새로운 필터링 로직 적용 ---
        const today = new Date();
        const allDailyTasks = dailyBoard ? dailyBoard.tasks : [];
        const filteredDailyTasks = filterDailyTasks(dailyBoard, allDailyTasks, today);
        const displayDailyBoard = dailyBoard ? { ...dailyBoard, tasks: filteredDailyTasks } : undefined;
        // --- 로직 적용 끝 ---

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
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
                {/* Daily Goals - 필터링된 보드 사용 */}
                <div className="lg:col-span-1">
                  {displayDailyBoard && (
                    <GoalBoard
                      board={displayDailyBoard}
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

                {/* Weekly Goals */}
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

                {/* Long-term Goals */}
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
