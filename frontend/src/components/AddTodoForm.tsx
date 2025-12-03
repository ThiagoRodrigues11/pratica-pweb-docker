"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

interface AddTodoFormProps {
  onAddTask: (description: string) => void;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAddTask }) => {
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onAddTask(description.trim());
      setDescription("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-6">
      <Input
        type="text"
        placeholder="Adicionar nova tarefa..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-grow rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
      />
      <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2">
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
      </Button>
    </form>
  );
};

export default AddTodoForm;