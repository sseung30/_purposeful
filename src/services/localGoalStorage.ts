import localforage from 'localforage';
import { GoalBoard, Task } from '../types/Goal';
import { getDateRangeForTimeframe } from '../utils/dateHelpers';
import { v4 as uuidv4 } from 'uuid';

class LocalGoalStorage {
  private storageKey = 'goalBoards';

  async getAllBoards(): Promise<GoalBoard[]> {
    try {
      const boards = await localforage.getItem<GoalBoard[]>(this.storageKey);
      return boards || [];
    } catch (error) {
      console.error('Failed to load boards from local storage:', error);
      return [];
    }
  }

  async getBoardByTimeframe(timeframe: GoalBoard['timeframe']): Promise<GoalBoard | null> {
    const boards = await this.getAllBoards();
    return boards.find(board => board.timeframe === timeframe) || null;
  }

  async saveBoard(board: GoalBoard): Promise<void> {
    try {
      const boards = await this.getAllBoards();
      const existingIndex = boards.findIndex(b => b.id === board.id);
      
      if (existingIndex >= 0) {
        boards[existingIndex] = { ...board, updatedAt: new Date() };
      } else {
        boards.push(board);
      }
      
      await localforage.setItem(this.storageKey, boards);
    } catch (error) {
      console.error('Failed to save board to local storage:', error);
    }
  }

  async updateBoardTasks(timeframe: GoalBoard['timeframe'], tasks: Task[]): Promise<void> {
    const board = await this.getBoardByTimeframe(timeframe);
    if (board) {
      board.tasks = tasks;
      await this.saveBoard(board);
    }
  }

  async addTaskToBoard(timeframe: GoalBoard['timeframe'], taskText: string): Promise<Task | null> {
    const board = await this.getBoardByTimeframe(timeframe);
    if (!board) return null;

    const currentDate = board.currentDate || new Date();

    const newTask: Task = {
      id: uuidv4(),
      text: taskText,
      completed: false,
      order: board.tasks.length,
      createdDate: new Date(currentDate), // Use the board's current date
      completedDate: undefined
    };

    board.tasks.push(newTask);
    await this.saveBoard(board);
    return newTask;
  }

  async toggleTaskCompletion(timeframe: GoalBoard['timeframe'], taskId: string): Promise<void> {
    const board = await this.getBoardByTimeframe(timeframe);
    if (board) {
      const task = board.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        // Set completion date to the board's current date (not necessarily today)
        task.completedDate = task.completed ? new Date(board.currentDate || new Date()) : undefined;
        await this.saveBoard(board);
      }
    }
  }

  async deleteTask(timeframe: GoalBoard['timeframe'], taskId: string): Promise<void> {
    const board = await this.getBoardByTimeframe(timeframe);
    if (board) {
      board.tasks = board.tasks.filter(task => task.id !== taskId);
      await this.saveBoard(board);
    }
  }

  async updateTaskText(timeframe: GoalBoard['timeframe'], taskId: string, newText: string): Promise<void> {
    const board = await this.getBoardByTimeframe(timeframe);
    if (board) {
      const task = board.tasks.find(t => t.id === taskId);
      if (task) {
        task.text = newText;
        await this.saveBoard(board);
      }
    }
  }

  async initializeDefaultBoards(): Promise<void> {
    const timeframes: GoalBoard['timeframe'][] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifelong'];
    
    for (const timeframe of timeframes) {
      const existing = await this.getBoardByTimeframe(timeframe);
      if (!existing) {
        const board: GoalBoard = {
          id: uuidv4(),
          timeframe,
          title: this.getTitleForTimeframe(timeframe),
          currentDate: new Date(),
          tasks: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await this.saveBoard(board);
      } else {
        // Update existing board title
        if (!existing.currentDate) {
          existing.currentDate = new Date();
        }
        existing.title = this.getTitleForTimeframe(timeframe);
        await this.saveBoard(existing);
      }
    }
  }

  private getTitleForTimeframe(timeframe: GoalBoard['timeframe'], date?: Date): string {
    switch (timeframe) {
      case 'daily':
        const targetDate = date || new Date();
        return targetDate.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short'
        });
      case 'weekly':
        return getDateRangeForTimeframe('weekly', date);
      case 'monthly':
        return getDateRangeForTimeframe('monthly', date);
      case 'quarterly':
        return getDateRangeForTimeframe('quarterly', date);
      case 'yearly':
        return getDateRangeForTimeframe('yearly', date);
      case 'lifelong':
        return 'Life';
      default:
        return '';
    }
  }

  async exportData(): Promise<GoalBoard[]> {
    return await this.getAllBoards();
  }

  async importData(boards: GoalBoard[]): Promise<void> {
    await localforage.setItem(this.storageKey, boards);
  }

  async updateBoardDate(timeframe: GoalBoard['timeframe'], newDate: Date): Promise<void> {
    const board = await this.getBoardByTimeframe(timeframe);
    if (board) {
      // For daily boards, handle task migration
      if (timeframe === 'daily') {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        const targetDate = new Date(newDate);
        targetDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        
        const isMovingToToday = targetDate.getTime() === today.getTime();
        const isFutureDate = targetDate.getTime() > today.getTime();
        const isPastDate = targetDate.getTime() < today.getTime();
        
        if (isMovingToToday) {
          // When viewing "today", show:
          // 1. All incomplete tasks (they migrate to today)
          // 2. Tasks completed today
          board.tasks = board.tasks.filter(task => {
            if (!task.completed) {
              // Update incomplete tasks to have today as their created date (migration)
              task.createdDate = today;
              return true;
            }
            // For completed tasks, only show if completed today
            if (task.completedDate) {
              const completedDate = new Date(task.completedDate);
              completedDate.setHours(0, 0, 0, 0);
              return completedDate.getTime() === today.getTime();
            }
            return false;
          // Future dates: Only show tasks created specifically for this date
          board.tasks = board.tasks.filter(task => {
            if (task.createdDate) {
              const createdDate = new Date(task.createdDate);
              createdDate.setHours(0, 0, 0, 0);
              return createdDate.getTime() === targetDate.getTime();
            }
            return false;
          });
          // When viewing future dates, show no tasks (empty board)
          board.tasks = [];
        } else if (isPastDate) {
          // When viewing past dates, show tasks completed on that specific date
          board.tasks = board.tasks.filter(task => {
            if (task.completed && task.completedDate) {
              const completedDate = new Date(task.completedDate);
              completedDate.setHours(0, 0, 0, 0);
              return completedDate.getTime() === targetDate.getTime();
            }
            return false;
          });
        } else {
          // Fallback case
          board.tasks = [];
        }
      }
      
      board.currentDate = newDate;
      if (timeframe === 'daily') {
        board.title = newDate.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short'
        });
      } else {
        board.title = this.getTitleForTimeframe(timeframe, newDate);
      }
      await this.saveBoard(board);
    }
  }
}

export const localGoalStorage = new LocalGoalStorage();