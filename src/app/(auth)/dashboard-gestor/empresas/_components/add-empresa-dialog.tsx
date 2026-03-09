"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateEmpresaForm } from "./create-empresa-form";

interface AddEmpresaDialogProps {
  onSuccess: () => void;
}

export function AddEmpresaDialog({ onSuccess }: AddEmpresaDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Empresa</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Adicionar Nova Empresa</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <CreateEmpresaForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>

    </Dialog>
  );
}
