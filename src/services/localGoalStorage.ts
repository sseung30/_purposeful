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

  // New method to get filtered tasks for display
  async getFilteredTasksForDate(timeframe: GoalBoard['timeframe'], date: Date): Promise<Task[]> {
    const board = await this.getBoardByTimeframe(timeframe);
    if (!board || timeframe !== 'daily') {
      return board?.tasks || [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // For daily boards, filter tasks by target date
    return board.tasks.filter(task => {
      if (task.targetDate) {
        const taskTargetDate = new Date(task.targetDate);
        taskTargetDate.setHours(0, 0, 0, 0);
        
        // 완료된 태스크는 원래 날짜에만 표시
        if (task.completed) {
          return taskTargetDate.getTime() === targetDate.getTime();
        }
        
        // 미완료 태스크의 경우
        if (targetDate.getTime() === today.getTime()) {
          // 오늘을 보고 있을 때: 오늘 태스크 + 과거의 미완료 태스크
          return taskTargetDate.getTime() <= today.getTime();
        } else {
          // 다른 날짜를 보고 있을 때: 해당 날짜의 태스크만 (미래 날짜 포함)
          return taskTargetDate.getTime() === targetDate.getTime();
        }
      }
      // For legacy tasks without targetDate, show them on all dates
      return true;
    });
  }
}

export const localGoalStorage = new LocalGoalStorage();