import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { Task, GoalBoard as GoalBoardType } from '../types/Goal';

interface GoalBoardProps {
  board: GoalBoardType;
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, text: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
}

export const GoalBoard: React.FC<GoalBoardProps> = ({
  board,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onReorderTasks
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const draggedIndex = board.tasks.findIndex(task => task.id === draggedTaskId);
    const targetIndex = board.tasks.findIndex(task => task.id === targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...board.tasks];
    const draggedTask = newTasks[draggedIndex];
    
    // Remove dragged task and insert at target position
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);

    onReorderTasks(newTasks);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
        {board.timeframe} Goals - {board.title}
      </h2>
      
      <form onSubmit={handleAddTask} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="space-y-1">
        {board.tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onUpdate={(text) => onUpdateTask(task.id, text)}
            onDragStart={() => handleDragStart(task.id)}
            onDragOver={(e) => handleDragOver(e, task.id)}
            onDragEnd={handleDragEnd}
            isDragging={draggedTaskId === task.id}
          />
        ))}
      </div>

      {board.tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No tasks yet. Add one above to get started!
        </div>
      )}
    </div>
  );
};