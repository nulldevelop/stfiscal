"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteEmpresaAction } from "../_actions/delete-empresa";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  empresaId: string | null;
  empresaNome: string;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  empresaId,
  empresaNome,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!empresaId) return;

    setLoading(true);
    try {
      const result = await deleteEmpresaAction(empresaId);
      if (result.success) {
        toast.success("Empresa excluída com sucesso");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error || "Erro ao excluir empresa");
      }
    } catch {
      toast.error("Erro ao excluir empresa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a empresa{" "}
            <strong>{empresaNome}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
