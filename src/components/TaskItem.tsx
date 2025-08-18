import React, { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
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
    <div
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
      draggable
      onDragStart={onDragStart}
    >
      {/* Drag Handle */}
      <div className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-gray-400" />
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
            className="w-full px-2 py-1 text-sm bg-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};