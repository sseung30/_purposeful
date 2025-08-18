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

    // For daily boards, set the target date to the board's current date
    const targetDate = timeframe === 'daily' && board.currentDate 
      ? new Date(board.currentDate) 
      : undefined;
      
    const newTask: Task = {
      id: uuidv4(),
      text: taskText,
      completed: false,
      order: board.tasks.length,
      createdDate: new Date(), // Actual creation time
      completedDate: undefined,
      targetDate: targetDate // The date this task is intended for
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
        // For daily boards, only show tasks that have the target date matching the selected date
        board.tasks = board.tasks.filter(task => {
          if (task.targetDate) {
            return task.targetDate.toDateString() === newDate.toDateString();
          }
          // For legacy tasks without targetDate, show them on all dates
          return true;
        });
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