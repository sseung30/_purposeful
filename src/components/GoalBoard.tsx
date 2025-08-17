import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { GoalBoard as GoalBoardType, Task } from '../types/Goal';
import { TaskItem } from './TaskItem';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
  className
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

  const handlePrevDate = () => {
    if (onDateChange) {
      onDateChange(getPreviousDate(board.timeframe, board.currentDate));
    }
  };

  const handleNextDate = () => {
    if (onDateChange) {
      onDateChange(getNextDate(board.timeframe, board.currentDate));
    }
  };


  const completedTasksCount = board.tasks.filter(t => t.completed).length;
  const totalTasksCount = board.tasks.length;
  const progress = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-800 capitalize">{board.timeframe}</h2>
            {onDateChange && board.timeframe !== 'lifelong' && (
                <div className="flex items-center gap-1">
                    <button onClick={handlePrevDate} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium text-gray-600 w-24 text-center">{board.title}</span>
                    <button onClick={handleNextDate} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
            {board.timeframe === 'lifelong' && (
                 <span className="text-sm font-medium text-gray-600">{board.title}</span>
            )}
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-right text-gray-500 mt-1">{completedTasksCount} / {totalTasksCount} completed</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={board.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {board.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={() => onToggleTaskCompletion(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onUpdateText={(newText) => onUpdateTaskText(task.id, newText)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleAddTask} className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};