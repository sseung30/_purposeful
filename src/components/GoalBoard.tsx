import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { GoalBoard as GoalBoardType, Task } from '../types/Goal';

interface GoalBoardProps {
  board: GoalBoardType;
  onUpdateTaskOrder: (tasks: Task[]) => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskText: (taskId: string, newText: string) => void;
  onAddTask: (taskText: string) => void;
  onDateChange?: (newDate: Date) => void;
  className?: string;
}

export const GoalBoard: React.FC<GoalBoardProps> = ({
  board,
  onUpdateTaskOrder,
  onToggleTaskCompletion,
  onDeleteTask,
  onUpdateTaskText,
  onAddTask,
  onDateChange,
  className = ''
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

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      return;
    }

    const draggedIndex = board.tasks.findIndex(task => task.id === draggedTaskId);
    const targetIndex = board.tasks.findIndex(task => task.id === targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTaskId(null);
      return;
    }

    const newTasks = [...board.tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);

    onUpdateTaskOrder(newTasks);
    setDraggedTaskId(null);
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    if (!onDateChange) return;

    const currentDate = board.currentDate || new Date();
    const newDate = new Date(currentDate);

    switch (board.timeframe) {
      case 'daily':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarterly':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'yearly':
        newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
      default:
        return;
    }

    onDateChange(newDate);
  };

  const canNavigateDate = board.timeframe !== 'lifelong' && onDateChange;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {board.timeframe}
          </h2>
          {canNavigateDate && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateNavigation('prev')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => handleDateNavigation('next')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{board.title}</p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {board.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleCompletion={() => onToggleTaskCompletion(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onUpdateText={(newText) => onUpdateTaskText(task.id, newText)}
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, task.id)}
              isDragging={draggedTaskId === task.id}
            />
          ))}
        </div>
      </div>

      {/* Add Task Form */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};