"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  description: string;
  completed: boolean;
}

interface TodoItemProps {
  task: Task;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  task,
  onDeleteTask,
  onEditTask,
  onToggleComplete,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-3 border border-gray-200">
      <div className="flex items-center flex-grow">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mr-3 h-5 w-5 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
        />
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            "text-lg text-gray-800 cursor-pointer flex-grow",
            task.completed && "line-through text-gray-500"
          )}
          onClick={() => onEditTask(task)}
        >
          {task.description}
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDeleteTask(task.id)}
        className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default TodoItem;