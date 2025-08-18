import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { GoalBoard as GoalBoardType, Task } from '../types/Goal';
import { TaskItem } from './TaskItem';
import { Ionicons } from '@expo/vector-icons';

interface GoalBoardProps {
  board: GoalBoardType;
  onUpdateTaskOrder: (tasks: Task[]) => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskText: (taskId: string, newText: string) => void;
  onAddTask: (taskText: string) => void;
  onDateChange?: (newDate: Date) => void;
}

export const GoalBoard: React.FC<GoalBoardProps> = ({
  board,
  onUpdateTaskOrder,
  onToggleTaskCompletion,
  onDeleteTask,
  onUpdateTaskText,
  onAddTask,
  onDateChange,
}) => {
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handlePreviousDate = () => {
    if (board.timeframe === 'lifelong' || !onDateChange) return;
    // Date navigation logic here
  };

  const handleNextDate = () => {
    if (board.timeframe === 'lifelong' || !onDateChange) return;
    // Date navigation logic here
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {board.timeframe === 'lifelong' ? (
          <Text style={styles.title}>{board.title}</Text>
        ) : (
          <View style={styles.dateNavigation}>
            <TouchableOpacity onPress={handlePreviousDate} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.title}>{board.title}</Text>
            <TouchableOpacity onPress={handleNextDate} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tasks */}
      <ScrollView style={styles.tasksContainer} showsVerticalScrollIndicator={false}>
        {board.tasks
          .sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return a.order - b.order;
          })
          .map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleTaskCompletion}
              onDelete={onDeleteTask}
              onUpdateText={onUpdateTaskText}
            />
          ))}
      </ScrollView>

      {/* Add Task */}
      <View style={styles.addTaskContainer}>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={16} color="#9CA3AF" />
        </TouchableOpacity>
        <TextInput
          style={styles.addTaskInput}
          value={newTaskText}
          onChangeText={setNewTaskText}
          placeholder="Add a task..."
          placeholderTextColor="#9CA3AF"
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    margin: 8,
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    flex: 1,
  },
  tasksContainer: {
    flex: 1,
    padding: 16,
  },
  addTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  addButton: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTaskInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});