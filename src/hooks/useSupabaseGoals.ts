import { useState, useEffect } from 'react';
import { GoalBoard, Task } from '../types/Goal';
import { supabaseGoalStorage } from '../services/supabaseGoalStorage';
import { supabase } from '../lib/supabase';

export const useSupabaseGoals = () => {
  const [boards, setBoards] = useState<GoalBoard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBoards = async () => {
    try {
      await supabaseGoalStorage.initializeDefaultBoards();
      const allBoards = await supabaseGoalStorage.getAllBoards();
      setBoards(allBoards);
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load boards when component mounts
    loadBoards();

    // Set up real-time subscriptions for boards
    const boardsSubscription = supabase
      .channel('goal_boards_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'goal_boards' },
        () => {
          loadBoards();
        }
      )
      .subscribe();

    // Set up real-time subscriptions for tasks
    const tasksSubscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          loadBoards();
        }
      )
      .subscribe();

    return () => {
      boardsSubscription.unsubscribe();
      tasksSubscription.unsubscribe();
    };
  }, []);

  const getBoardByTimeframe = (timeframe: GoalBoard['timeframe']) => {
    return boards.find(board => board.timeframe === timeframe);
  };

  const addTask = async (timeframe: GoalBoard['timeframe'], taskText: string) => {
    const newTask = await supabaseGoalStorage.addTaskToBoard(timeframe, taskText);
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
    await supabaseGoalStorage.updateTaskOrder(timeframe, tasks);
    setBoards(prev => prev.map(board => 
      board.timeframe === timeframe 
        ? { ...board, tasks }
        : board
    ));
  };

  const toggleTaskCompletion = async (timeframe: GoalBoard['timeframe'], taskId: string) => {
    await supabaseGoalStorage.toggleTaskCompletion(timeframe, taskId);
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
    await supabaseGoalStorage.deleteTask(timeframe, taskId);
    setBoards(prev => prev.map(board => 
      board.timeframe === timeframe 
        ? { ...board, tasks: board.tasks.filter(task => task.id !== taskId) }
        : board
    ));
  };

  const updateTaskText = async (timeframe: GoalBoard['timeframe'], taskId: string, newText: string) => {
    await supabaseGoalStorage.updateTaskText(timeframe, taskId, newText);
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
    await supabaseGoalStorage.updateBoardDate(timeframe, newDate);
    setBoards(prev => prev.map(board => 
      board.timeframe === timeframe 
        ? { 
            ...board, 
            currentDate: newDate,
            title: board.timeframe === 'daily' ? 'Today' : 
                   board.timeframe === 'lifelong' ? 'Life Goals' :
                   getDateRangeForTimeframe(board.timeframe, newDate)
          }
        : board
    ));
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
    refreshBoards: loadBoards
  };
};