import { supabase } from '../lib/supabase';
import { GoalBoard, Task } from '../types/Goal';
import { getDateRangeForTimeframe } from '../utils/dateHelpers';

class SupabaseGoalStorage {
  async getAllBoards(): Promise<GoalBoard[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data: boardsData, error } = await supabase
      .from('goal_boards')
      .select(`
        *,
        tasks (*)
      `)
      .eq('user_id', user.user.id)
          id: task.id,
          text: task.text,
          completed: task.completed,
          order: task.order_index,
          createdDate: new Date(task.created_at),
          completedDate: task.completed_at ? new Date(task.completed_at) : undefined
        }))
        .sort((a, b) => a.order - b.order),
      createdAt: new Date(board.created_at),
      updatedAt: new Date(board.updated_at)
    }));
  }

  async getBoardByTimeframe(timeframe: GoalBoard['timeframe']): Promise<GoalBoard | null> {
    const boards = await this.getAllBoards();
    return boards.find(board => board.timeframe === timeframe) || null;
  }

  async saveBoard(board: GoalBoard): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { error } = await supabase
      .from('goal_boards')
      .upsert({
        id: board.id,
        user_id: user.user.id,
        timeframe: board.timeframe,
        title: board.title,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving board:', error);
    }
  }

  async updateBoardTasks(timeframe: GoalBoard['timeframe'], tasks: Task[]): Promise<void> {
    const board = await this.getBoardByTimeframe(timeframe);
    if (!board) return;

    // Update all task orders in a single transaction
    const updates = tasks.map((task, index) => ({
      id: task.id,
      order_index: index,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('tasks')
      .upsert(updates);

    if (error) {
      console.error('Error updating task order:', error);
    }
  }

  async addTaskToBoard(timeframe: GoalBoard['timeframe'], taskText: string): Promise<Task | null> {
    const board = await this.getBoardByTimeframe(timeframe);
    if (!board) return null;

    const newTask = {
      board_id: board.id,
      text: taskText,
      completed: false,
      order_index: board.tasks.length
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return null;
    }

    return {
      id: data.id,
      text: data.text,
      completed: data.completed,
      order: data.order_index,
      createdDate: new Date(data.created_at),
      completedDate: undefined
    };
  }

  async toggleTaskCompletion(timeframe: GoalBoard['timeframe'], taskId: string): Promise<void> {
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', taskId)
      .single();

    if (currentTask) {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: !currentTask.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error toggling task completion:', error);
      }
    }
  }

  async deleteTask(timeframe: GoalBoard['timeframe'], taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
    }
  }

  async updateTaskText(timeframe: GoalBoard['timeframe'], taskId: string, newText: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        text: newText,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task text:', error);
    }
  }

  async initializeDefaultBoards(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const timeframes: GoalBoard['timeframe'][] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifelong'];
    
    // Update existing board titles first
    await this.updateExistingBoardTitles();
    
    for (const timeframe of timeframes) {
      const existing = await this.getBoardByTimeframe(timeframe);
      if (!existing) {
        const board: Omit<GoalBoard, 'tasks'> = {
          id: crypto.randomUUID(),
          timeframe,
          title: this.getTitleForTimeframe(timeframe),
          currentDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const { error } = await supabase
          .from('goal_boards')
          .insert({
            id: board.id,
            user_id: user.user.id,
            timeframe: board.timeframe,
            title: board.title
          });

        if (error) {
          console.error('Error creating board:', error);
        }
      }
    }
  }

    // For daily boards, handle task migration
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      const targetDate = new Date(newDate);
      targetDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      // The filtering will be handled in getAllBoards method
      // No need to modify tasks here, just update the board title
    }
    
    let newTitle: string;
    if (timeframe === 'daily') {
      newTitle = newDate.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short'
      });
    } else {
      newTitle = this.getTitleForTimeframe(timeframe, newDate);
    }
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { error } = await supabase
      .from('goal_boards')
      .update({ 
        title: newTitle,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.user.id)
      .eq('timeframe', timeframe);

    if (error) {
      console.error('Error updating board date:', error);
    }
  }

  async updateExistingBoardTitles(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const timeframes: GoalBoard['timeframe'][] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifelong'];
    
    for (const timeframe of timeframes) {
      const newTitle = this.getTitleForTimeframe(timeframe);
      
      const { error } = await supabase
        .from('goal_boards')
        .update({ 
          title: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .eq('timeframe', timeframe);

      if (error) {
        console.error('Error updating board title:', error);
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
}

export const supabaseGoalStorage = new SupabaseGoalStorage();