import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { GoalBoard, Task } from '../types/Goal';
import { getDateRangeForTimeframe } from '../utils/dateHelpers';

const BOARDS_KEY = 'goalBoards';

class LocalGoalStorage {
  constructor() {
    localforage.config({
      name: 'GoalDashboard',
      storeName: 'goals',
    });
  }

  async getAllBoards(): Promise<GoalBoard[]> {
    return (await localforage.getItem<GoalBoard[]>(BOARDS_KEY)) || [];
  }

  async saveAllBoards(boards: GoalBoard[]): Promise<void> {
    await localforage.setItem(BOARDS_KEY, boards);
  }

  async initializeDefaultBoards(): Promise<void> {
    let boards = await this.getAllBoards();
    if (boards.length > 0) {
       // Update titles for existing boards on initialization
       boards.forEach(board => {
           board.title = this.getTitleForTimeframe(board.timeframe, board.currentDate);
       });
       await this.saveAllBoards(boards);
       return;
    }

    const timeframes: GoalBoard['timeframe'][] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifelong'];
    const defaultBoards: GoalBoard[] = timeframes.map(tf => ({
      id: uuidv4(),
      timeframe: tf,
      title: this.getTitleForTimeframe(tf),
      currentDate: new Date(),
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await this.saveAllBoards(defaultBoards);
  }

  private getTitleForTimeframe(timeframe: GoalBoard['timeframe'], date: Date = new Date()): string {
    if (timeframe === 'lifelong') return 'Life Goals';
    if (timeframe === 'daily') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return getDateRangeForTimeframe(timeframe, date);
  }

  async addTaskToBoard(timeframe: GoalBoard['timeframe'], taskText: string): Promise<Task | null> {
    const boards = await this.getAllBoards();
    const boardIndex = boards.findIndex(b => b.timeframe === timeframe);
    if (boardIndex === -1) return null;

    const newTask: Task = {
      id: uuidv4(),
      text: taskText,
      completed: false,
      order: boards[boardIndex].tasks.length,
      createdDate: new Date(),
    };

    boards[boardIndex].tasks.push(newTask);
    await this.saveAllBoards(boards);
    return newTask;
  }

  async updateTaskOrder(timeframe: GoalBoard['timeframe'], tasks: Task[]): Promise<void> {
    const boards = await this.getAllBoards();
    const boardIndex = boards.findIndex(b => b.timeframe === timeframe);
    if (boardIndex !== -1) {
      // Re-assign order index based on new array order
      const updatedTasks = tasks.map((task, index) => ({ ...task, order: index }));
      boards[boardIndex].tasks = updatedTasks;
      await this.saveAllBoards(boards);
    }
  }

  async toggleTaskCompletion(timeframe: GoalBoard['timeframe'], taskId: string): Promise<void> {
    const boards = await this.getAllBoards();
    const board = boards.find(b => b.timeframe === timeframe);
    if (board) {
      const task = board.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        task.completedDate = task.completed ? new Date() : undefined;
        await this.saveAllBoards(boards);
      }
    }
  }

  async deleteTask(timeframe: GoalBoard['timeframe'], taskId: string): Promise<void> {
    const boards = await this.getAllBoards();
    const board = boards.find(b => b.timeframe === timeframe);
    if (board) {
      board.tasks = board.tasks.filter(t => t.id !== taskId);
      await this.saveAllBoards(boards);
    }
  }

  async updateTaskText(timeframe: GoalBoard['timeframe'], taskId: string, newText: string): Promise<void> {
    const boards = await this.getAllBoards();
    const board = boards.find(b => b.timeframe === timeframe);
    if (board) {
      const task = board.tasks.find(t => t.id === taskId);
      if (task) {
        task.text = newText;
        await this.saveAllBoards(boards);
      }
    }
  }
  
  async updateBoardDate(timeframe: GoalBoard['timeframe'], newDate: Date): Promise<void> {
      const boards = await this.getAllBoards();
      const board = boards.find(b => b.timeframe === timeframe);
      if (board) {
          board.currentDate = newDate;
          board.title = this.getTitleForTimeframe(timeframe, newDate);
          await this.saveAllBoards(boards);
      }
  }

  async exportData(): Promise<GoalBoard[]> {
      return this.getAllBoards();
  }

  async importData(data: GoalBoard[]): Promise<void> {
      await this.saveAllBoards(data);
  }
}

export const localGoalStorage = new LocalGoalStorage();