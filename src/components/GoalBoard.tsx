import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { GoalBoard as GoalBoardType, Task } from '../types/Goal';
import { TaskItem } from './TaskItem';

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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const canNavigate = board.timeframe !== 'lifelong';

  const handlePreviousDate = () => {
    if (!canNavigate || !onDateChange) return;
    
    const currentDate = board.currentDate || new Date();
    let newDate = new Date(currentDate);
    
    switch (board.timeframe) {
      case 'daily':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() - 3);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    
    onDateChange(newDate);
  };

  const handleNextDate = () => {
    if (!canNavigate || !onDateChange) return;
    
    const currentDate = board.currentDate || new Date();
    let newDate = new Date(currentDate);
    
    switch (board.timeframe) {
      case 'daily':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    
    onDateChange(newDate);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.id === targetTask.id) {
      setDraggedTask(null);
      return;
    }

    const tasks = [...board.tasks];
    const draggedIndex = tasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = tasks.findIndex(t => t.id === targetTask.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      tasks.splice(draggedIndex, 1);
      tasks.splice(targetIndex, 0, draggedTask);
      onUpdateTaskOrder(tasks);
    }

    setDraggedTask(null);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${className}`}>
      {/* Header with centered date and side chevrons */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {/* Left chevron */}
        {canNavigate ? (
          <button
            onClick={handlePreviousDate}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <div className="w-7 h-7" /> // Placeholder for spacing
        )}

        {/* Centered title */}
        <h2 className="text-lg font-semibold text-gray-800 text-center flex-1">
          {board.title}
        </h2>

        {/* Right chevron */}
        {canNavigate ? (
          <button
            onClick={handleNextDate}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <div className="w-7 h-7" /> // Placeholder for spacing
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {board.tasks.map((task) => (
          <div
            key={task.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, task)}
          >
            <TaskItem
              task={task}
              onToggleCompletion={() => onToggleTaskCompletion(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onUpdateText={(newText) => onUpdateTaskText(task.id, newText)}
              onDragStart={() => handleDragStart(task)}
            />
          </div>
        ))}
      </div>

      {/* Add Task Form */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};