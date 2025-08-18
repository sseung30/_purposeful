import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Task } from '../types/Goal';
import { Ionicons } from '@expo/vector-icons';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdateText: (taskId: string, newText: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onUpdateText,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== task.text) {
      onUpdateText(task.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dragHandle}>
        <Ionicons name="reorder-two" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onToggleComplete(task.id)}
        style={[
          styles.checkbox,
          task.completed && styles.checkboxCompleted,
        ]}
      >
        {task.completed && (
          <Ionicons name="checkmark" size={12} color="white" />
        )}
      </TouchableOpacity>

      <View style={styles.textContainer}>
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            onBlur={handleSaveEdit}
            onSubmitEditing={handleSaveEdit}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text
              style={[
                styles.taskText,
                task.completed && styles.taskTextCompleted,
              ]}
            >
              {task.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <Ionicons name="close" size={14} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  dragHandle: {
    padding: 2,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  textContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    color: '#111827',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  editInput: {
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  deleteButton: {
    padding: 4,
    opacity: 0.7,
  },
});