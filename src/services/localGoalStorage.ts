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

    // Set target date based on timeframe and board's current date
    let targetDate: Date | undefined;
    
    if (timeframe !== 'lifelong' && board.currentDate) {
      targetDate = new Date(board.currentDate);
    }
      
    const newTask: Task = {
      id: uuidv4(),
      text: taskText,
      completed: false,
      order: board.tasks.length,
      createdDate: new Date(), // Actual creation time
      completedDate: undefined,
      targetDate: targetDate // The date/period this task is intended for
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

  // 실제 시간 기준으로 자동 롤오버 체크 및 실행
  async checkAndPerformDailyRollover(): Promise<void> {
    const board = await this.getBoardByTimeframe('daily');
    if (!board) return;

    const lastRolloverDate = await localforage.getItem<string>('lastRolloverDate');
    const today = new Date();
    const todayString = today.toDateString();

    // 이미 오늘 롤오버를 했다면 스킵
    if (lastRolloverDate === todayString) {
      return;
    }

    let hasChanges = false;
    today.setHours(0, 0, 0, 0);

    // 어제까지의 미완료 태스크를 오늘로 이동
    board.tasks.forEach(task => {
      if (task.targetDate && !task.completed) {
        const taskTargetDate = new Date(task.targetDate);
        taskTargetDate.setHours(0, 0, 0, 0);
        
        // 과거 태스크인 경우 오늘로 이동
        if (taskTargetDate.getTime() < today.getTime()) {
          task.targetDate = new Date(today);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      await this.saveBoard(board);
    }

    // 롤오버 완료 기록
    await localforage.setItem('lastRolloverDate', todayString);
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
    if (!board) {
      return [];
    }

    // For lifelong, show all tasks
    if (timeframe === 'lifelong') {
      return board.tasks;
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return board.tasks.filter(task => {
      if (!task.targetDate) {
        // For legacy tasks without targetDate, show them on all dates
        return true;
      }

      const taskTargetDate = new Date(task.targetDate);
      taskTargetDate.setHours(0, 0, 0, 0);

      switch (timeframe) {
        case 'daily':
          // Show tasks with exact date match
          return taskTargetDate.getTime() === targetDate.getTime();

        case 'weekly':
          // Show tasks within the same week
          const targetWeekStart = this.getWeekStart(targetDate);
          const taskWeekStart = this.getWeekStart(taskTargetDate);
          return targetWeekStart.getTime() === taskWeekStart.getTime();

        case 'monthly':
          // Show tasks within the same month and year
          return taskTargetDate.getMonth() === targetDate.getMonth() &&
                 taskTargetDate.getFullYear() === targetDate.getFullYear();

        case 'quarterly':
          // Show tasks within the same quarter and year
          const targetQuarter = Math.floor(targetDate.getMonth() / 3);
          const taskQuarter = Math.floor(taskTargetDate.getMonth() / 3);
          return targetQuarter === taskQuarter &&
                 taskTargetDate.getFullYear() === targetDate.getFullYear();

        case 'yearly':
          // Show tasks within the same year
          return taskTargetDate.getFullYear() === targetDate.getFullYear();

        default:
          return true;
      }
    });
  }

  private getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }
}

export const localGoalStorage = new LocalGoalStorage();