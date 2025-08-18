import React, { useState } from 'react';
import { Task } from '../types/Goal';
import { Trash2, GripVertical } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggleCompletion: () => void;
  onDelete: () => void;
  onUpdateText: (newText: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleCompletion,
  onDelete,
  onUpdateText,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    if (editText.trim() && editText !== task.text) {
      onUpdateText(editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Drag Handle */}
      <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Checkbox */}
      <button
        onClick={onToggleCompletion}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Task Text */}
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`text-sm cursor-pointer hover:text-blue-600 transition-colors ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-800'
            }`}
          >
            {task.text}
          </span>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};