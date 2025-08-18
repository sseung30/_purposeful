import { useState, useEffect } from 'react';
import { GoalBoard, Task } from '../types/Goal';
import { localGoalStorage } from '../services/localGoalStorage';
import { getDateRangeForTimeframe } from '../utils/dateHelpers';

export const useLocalGoals = () => {
  const [boards, setBoards] = useState<GoalBoard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBoards = async () => {
    try {
      await localGoalStorage.initializeDefaultBoards();
      const allBoards = await localGoalStorage.getAllBoards();
      setBoards(allBoards);
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const getBoardByTimeframe = (timeframe: GoalBoard['timeframe']) => {
    return boards.find(board => board.timeframe === timeframe);
  };

  const addTask = async (timeframe: GoalBoard['timeframe'], taskText: string) => {
    const newTask = await localGoalStorage.addTaskToBoard(timeframe, taskText);
    if (newTask) {
      setBoards(prev => prev.map(board => 
        board.timeframe === timeframe 
          ? { ...board, tasks: [...board.tasks, newTask] }
          : board
      ));
    }
    return newTask;
  };

  const updateTaskOrder = async (timeframe: GoalBoard['timeframe'], tasks: Task[]) => {
    await localGoalStorage.updateTaskOrder(timeframe, tasks);
    setBoards(prev => prev.map(board => 
      board.timeframe === timeframe 
        ? { ...board, tasks }
        : board
    ));
  };

  const toggleTaskCompletion = async (timeframe: GoalBoard['timeframe'], taskId: string) => {
    await localGoalStorage.toggleTaskCompletion(timeframe, taskId);
    setBoards(prev => prev.map(board => {
      if (board.timeframe === timeframe) {
        const updatedTasks = board.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        return { ...board, tasks: updatedTasks };
      }
      return board;
    }));
  };

  const deleteTask = async (timeframe: GoalBoard['timeframe'], taskId: string) => {
    await localGoalStorage.deleteTask(timeframe, taskId);
    setBoards(prev => prev.map(board => 
      board.timeframe === timeframe 
        ? { ...board, tasks: board.tasks.filter(task => task.id !== taskId) }
        : board
    ));
  };

  const updateTaskText = async (timeframe: GoalBoard['timeframe'], taskId: string, newText: string) => {
    await localGoalStorage.updateTaskText(timeframe, taskId, newText);
    setBoards(prev => prev.map(board => 
      board.timeframe === timeframe 
        ? {
            ...board,
            tasks: board.tasks.map(task =>
              task.id === taskId ? { ...task, text: newText } : task
            )
          }
        : board
    ));
  };

  const updateBoardDate = async (timeframe: GoalBoardType['timeframe'], newDate: Date) => {
    await localGoalStorage.updateBoardDate(timeframe, newDate);
    setBoards(prev => prev.map(board => 
      board.timeframe === timeframe 
        ? { 
            ...board, 
            currentDate: newDate,
            title: board.timeframe === 'daily' ? newDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 
                   board.timeframe === 'lifelong' ? 'Life Goals' :
                   getDateRangeForTimeframe(board.timeframe, newDate)
          }
        : board
    ));
  };

  const exportData = async () => {
    return await localGoalStorage.exportData();
  };

  const importData = async (data: GoalBoard[]) => {
    await localGoalStorage.importData(data);
    await loadBoards();
  };

  return {
    boards,
    loading,
    getBoardByTimeframe,
    addTask,
    updateTaskOrder,
    toggleTaskCompletion,
    deleteTask,
    updateTaskText,
    updateBoardDate,
    refreshBoards: loadBoards,
    exportData,
    importData
  };
};