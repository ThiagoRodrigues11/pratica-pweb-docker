"use client";

import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

export const fetchTasks = async (accessToken: string): Promise<Task[]> => {
  const loadingToastId = showLoading("Carregando tarefas...");
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Falha ao buscar tarefas.");
    }
    const data: Task[] = await response.json();
    dismissToast(loadingToastId);
    return data;
  } catch (error) {
    dismissToast(loadingToastId);
    showError("Erro ao carregar tarefas.");
    console.error("Erro ao buscar tarefas:", error);
    return [];
  }
};

export const createTask = async (description: string, accessToken: string): Promise<Task | null> => {
  const loadingToastId = showLoading("Adicionando tarefa...");
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ description, completed: false }),
    });
    if (!response.ok) {
      throw new Error("Falha ao criar tarefa.");
    }
    const newTask: Task = await response.json();
    dismissToast(loadingToastId);
    showSuccess("Tarefa adicionada com sucesso!");
    return newTask;
  } catch (error) {
    dismissToast(loadingToastId);
    showError("Erro ao adicionar tarefa.");
    console.error("Erro ao criar tarefa:", error);
    return null;
  }
};

export const updateTask = async (
  id: string,
  updatedFields: Partial<Task>,
  accessToken: string
): Promise<Task | null> => {
  const loadingToastId = showLoading("Atualizando tarefa...");
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updatedFields),
    });
    if (!response.ok) {
      throw new Error("Falha ao atualizar tarefa.");
    }
    const updatedTask: Task = await response.json();
    dismissToast(loadingToastId);
    showSuccess("Tarefa atualizada com sucesso!");
    return updatedTask;
  } catch (error) {
    dismissToast(loadingToastId);
    showError("Erro ao atualizar tarefa.");
    console.error("Erro ao atualizar tarefa:", error);
    return null;
  }
};

export const deleteTask = async (id: string, accessToken: string): Promise<boolean> => {
  const loadingToastId = showLoading("Excluindo tarefa...");
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Falha ao excluir tarefa.");
    }
    dismissToast(loadingToastId);
    showSuccess("Tarefa excluída com sucesso!");
    return true;
  } catch (error) {
    dismissToast(loadingToastId);
    showError("Erro ao excluir tarefa.");
    console.error("Erro ao excluir tarefa:", error);
    return false;
  }
};