import React, { useState } from 'react';
import { TaskItem } from './TaskItem';
import { GoalBoard as GoalBoardType, Task } from '../types/Goal';
import { Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const draggedIndex = board.tasks.findIndex(task => task.id === draggedTaskId);
    const targetIndex = board.tasks.findIndex(task => task.id === targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...board.tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);

    onUpdateTaskOrder(newTasks);
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    setDraggedTaskId(null);
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    if (!onDateChange) return;
    
    const currentDate = board.currentDate || new Date();
    const newDate = new Date(currentDate);
    
    switch (board.timeframe) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    onDateChange(newDate);
  };

  const showDateNavigation = board.timeframe !== 'lifelong';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {board.timeframe} Goals
          </h2>
          {showDateNavigation && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateNavigation('prev')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{board.title}</span>
              </div>
              <button
                onClick={() => handleDateNavigation('next')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
          {!showDateNavigation && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{board.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {board.tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1">Add your first {board.timeframe} goal below</p>
          </div>
        ) : (
          board.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleCompletion={() => onToggleTaskCompletion(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onUpdateText={(newText) => onUpdateTaskText(task.id, newText)}
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={(e) => handleDragOver(e, task.id)}
              onDrop={(e) => handleDrop(e, task.id)}
              isDragging={draggedTaskId === task.id}
            />
          ))
        )}
      </div>

      {/* Add Task Form */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder={`Add ${board.timeframe} goal...`}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};