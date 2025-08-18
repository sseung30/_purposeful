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

    const newTask: Task = {
      id: uuidv4(),
      text: taskText,
      completed: false,
      order: board.tasks.length,
      createdDate: new Date(),
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
        task.completedDate = task.completed ? new Date() : undefined;
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
        return 'Life Goals';
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
        const isMovingToToday = newDate.toDateString() === today.toDateString();
        
        // Filter tasks based on the target date
        if (isMovingToToday) {
          // When viewing "today", show all incomplete tasks regardless of when they were created
          // and only show completed tasks that were completed today
          board.tasks = board.tasks.filter(task => {
            if (!task.completed) {
              return true; // Show all incomplete tasks
            }
            // For completed tasks, only show if completed today
            return task.completedDate && 
                   task.completedDate.toDateString() === today.toDateString();
          });
        } else {
          // When viewing a specific past/future date, show:
          // 1. Tasks completed on that specific date
          // 2. Incomplete tasks that were created on or before that date
          board.tasks = board.tasks.filter(task => {
            if (task.completed && task.completedDate) {
              return task.completedDate.toDateString() === newDate.toDateString();
            }
            if (!task.completed && task.createdDate) {
              return task.createdDate <= newDate;
            }
            return false;
          });
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