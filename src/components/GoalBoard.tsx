import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GoalBoard as GoalBoardType, Task } from '../types/Goal';
import { TaskItem } from './TaskItem';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getNextDate, getPreviousDate } from '../utils/dateHelpers';

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
  className = '',
}) => {
  const [newTaskText, setNewTaskText] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = board.tasks.findIndex((task) => task.id === active.id);
      const newIndex = board.tasks.findIndex((task) => task.id === over.id);

      const newTasks = arrayMove(board.tasks, oldIndex, newIndex);
      onUpdateTaskOrder(newTasks);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handlePreviousDate = () => {
    if (onDateChange && board.currentDate) {
      const prevDate = getPreviousDate(board.timeframe, board.currentDate);
      onDateChange(prevDate);
    }
  };

  const handleNextDate = () => {
    if (onDateChange && board.currentDate) {
      const nextDate = getNextDate(board.timeframe, board.currentDate);
      onDateChange(nextDate);
    }
  };

  const canNavigate = board.timeframe !== 'lifelong';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {canNavigate && (
            <button
              onClick={handlePreviousDate}
              className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {board.timeframe}
            </h2>
            <p className="text-sm text-gray-600">{board.title}</p>
          </div>

          {canNavigate && (
            <button
              onClick={handleNextDate}
              className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-4 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={board.tasks} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {board.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleTaskCompletion}
                  onDelete={onDeleteTask}
                  onUpdateText={onUpdateTaskText}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};