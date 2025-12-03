"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Task {
  id: string;
  description: string;
  completed: boolean;
}

interface EditTodoDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveEdit: (id: string, newDescription: string) => void;
}

const EditTodoDialog: React.FC<EditTodoDialogProps> = ({
  task,
  isOpen,
  onClose,
  onSaveEdit,
}) => {
  const [editedDescription, setEditedDescription] = useState(task?.description || "");

  useEffect(() => {
    if (task) {
      setEditedDescription(task.description);
    }
  }, [task]);

  const handleSave = () => {
    if (task && editedDescription.trim()) {
      onSaveEdit(task.id, editedDescription.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-800">Editar Tarefa</DialogTitle>
          <DialogDescription className="text-gray-600">
            Faça as alterações na sua tarefa aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-gray-700">
              Descrição
            </Label>
            <Input
              id="description"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="col-span-3 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTodoDialog;