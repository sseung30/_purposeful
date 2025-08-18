import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GoalBoard as GoalBoardType, Task } from '../types/Goal';
import { TaskItem } from './TaskItem';
import { getDateRangeForTimeframe, getNextDate, getPreviousDate } from '../utils/dateHelpers';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

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
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = board.tasks.findIndex(task => task.id === active.id);
      const newIndex = board.tasks.findIndex(task => task.id === over.id);
      
      const reorderedTasks = arrayMove(board.tasks, oldIndex, newIndex).map((task, index) => ({
        ...task,
        order: index
      }));
      
      onUpdateTaskOrder(reorderedTasks);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const completedCount = board.tasks.filter(task => task.completed).length;
  const totalCount = board.tasks.length;

  const handlePreviousDate = () => {
    if (board.timeframe === 'lifelong') return;
    const newDate = getPreviousDate(board.timeframe, board.currentDate || new Date());
    onDateChange?.(newDate);
  };

  const handleNextDate = () => {
    if (board.timeframe === 'lifelong') return;
    const newDate = getNextDate(board.timeframe, board.currentDate || new Date());
    onDateChange?.(newDate);
  };

  const isToday = () => {
    if (!board.currentDate) return true;
    const today = new Date();
    const current = board.currentDate;
    
    switch (board.timeframe) {
      case 'daily':
        return current.toDateString() === today.toDateString();
      case 'weekly':
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return current >= startOfWeek && current <= endOfWeek;
      case 'monthly':
        return current.getMonth() === today.getMonth() && current.getFullYear() === today.getFullYear();
      case 'quarterly':
        const currentQuarter = Math.floor(current.getMonth() / 3);
        const todayQuarter = Math.floor(today.getMonth() / 3);
        return currentQuarter === todayQuarter && current.getFullYear() === today.getFullYear();
      case 'yearly':
        return current.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {board.timeframe === 'lifelong' ? (
              <h2 className="text-lg font-semibold text-gray-900 text-center flex-1">{board.title}</h2>
            ) : (
              <>
                <button
                  onClick={handlePreviousDate}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <h2 className={`text-lg font-semibold flex-1 text-center ${
                  isToday() ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {board.title}
                </h2>
                
                <button
                  onClick={handleNextDate}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={handlePreviousDate}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <h2 className={`text-lg font-semibold flex-1 text-center ${
                isToday() ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {board.title}
              </h2>
              
              <button
                onClick={handleNextDate}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={board.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 mb-4">
              {board.tasks
                .sort((a, b) => {
                  // Completed tasks go to bottom
                  if (a.completed && !b.completed) return 1;
                  if (!a.completed && b.completed) return -1;
                  // Within same completion status, sort by order
                  return a.order - b.order;
                })
                .map(task => (
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

        {/* Add New Task */}
        <form onSubmit={handleAddTask} className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center justify-center w-4 h-4 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors duration-200"
          >
            <Plus size={10} className="text-gray-400" />
          </button>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 px-2 py-1 text-sm border-none outline-none placeholder-gray-400 focus:placeholder-gray-300"
          />
        </form>
      </div>
    </div>
  );
};