export interface Task {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  completedDate?: Date;
  createdDate?: Date;
  targetDate?: Date;
}

export interface GoalBoard {
  id: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'lifelong';
  title: string;
  currentDate?: Date;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}