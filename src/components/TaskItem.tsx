import React, { useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import { Task } from '../types/Goal';

interface TaskItemProps {
  task: Task;
  onToggleCompletion: () => void;
  onDelete: () => void;
  onUpdateText: (newText: string) => void;
  onDragStart: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleCompletion,
  onDelete,
  onUpdateText,
  onDragStart
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== task.text) {
      onUpdateText(editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <div className="group flex items-center gap-3 p-2 rounded-md transition-colors">
      {/* Drag Handle */}
      <div
        className="cursor-grab active:cursor-grabbing text-gray-400"
        draggable
        onDragStart={onDragStart}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggleCompletion}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
      />

      {/* Task Text */}
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyPress}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span
            className={`text-sm cursor-pointer ${
              task.completed
                ? 'line-through text-gray-500'
                : 'text-gray-800'
            }`}
            onClick={() => setIsEditing(true)}
          >
            {task.text}
          </span>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};