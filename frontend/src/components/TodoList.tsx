"use client";

import React, { useState, useEffect, useCallback } from "react";
import AddTodoForm from "./AddTodoForm";
import TodoItem from "./TodoItem";
import EditTodoDialog from "./EditTodoDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTasks, createTask, updateTask, deleteTask, Task } from "@/api/tasks";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { tokens } = useAuth();

  const loadTasks = useCallback(async () => {
    if (!tokens?.accessToken) return;
    
    setIsLoading(true);
    const fetchedTasks = await fetchTasks(tokens.accessToken);
    setTasks(fetchedTasks);
    setIsLoading(false);
  }, [tokens?.accessToken]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (description: string) => {
    if (!tokens?.accessToken) return;
    
    const newTask = await createTask(description, tokens.accessToken);
    if (newTask) {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!tokens?.accessToken) return;
    
    const success = await deleteTask(id, tokens.accessToken);
    if (success) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    }
  };

  const handleToggleComplete = async (id: string) => {
    if (!tokens?.accessToken) return;
    
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (taskToUpdate) {
      const updatedTask = await updateTask(id, {
        completed: !taskToUpdate.completed,
      }, tokens.accessToken);
      if (updatedTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? updatedTask : task))
        );
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedTask = async (id: string, newDescription: string) => {
    if (!tokens?.accessToken) return;
    
    const updatedTask = await updateTask(id, { description: newDescription }, tokens.accessToken);
    if (updatedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task))
      );
      setEditingTask(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-50 rounded-xl shadow-lg border-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-4xl font-bold text-center text-gray-900">Minhas Tarefas</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <AddTodoForm onAddTask={handleAddTask} />
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-gray-500 text-lg">Carregando tarefas...</p>
          ) : tasks.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">Nenhuma tarefa ainda. Adicione uma!</p>
          ) : (
            tasks.map((task) => (
              <TodoItem
                key={task.id}
                task={task}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                onToggleComplete={handleToggleComplete}
              />
            ))
          )}
        </div>
        <EditTodoDialog
          task={editingTask}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSaveEdit={handleSaveEditedTask}
        />
      </CardContent>
    </Card>
  );
};

export default TodoList;