import React, { useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import { Task } from '../types/Goal';

interface TaskItemProps {
  task: Task;
  onToggleCompletion: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdateText: (taskId: string, newText: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
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

  const handleSave = () => {
    if (editText.trim() !== task.text) {
      onUpdateText(task.id, editText.trim());
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
      className="group flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
      
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleCompletion(task.id)}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
      />
      
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="w-full bg-transparent border-none outline-none text-gray-900"
            autoFocus
          />
        ) : (
          <span
            className={`cursor-pointer ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
            onClick={() => setIsEditing(true)}
          >
            {task.text}
          </span>
        )}
      </div>
      
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 text-gray-400 hover:text-red-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};