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
import { deleteLicitacaoAction } from "../_actions/delete-licitacao";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  licitacaoId: string | null;
  licitacaoNumero: string;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  licitacaoId,
  licitacaoNumero,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!licitacaoId) return;

    setLoading(true);
    try {
      const result = await deleteLicitacaoAction(licitacaoId);
      if (result.success) {
        toast.success("Licitação excluída com sucesso");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error || "Erro ao excluir licitação");
      }
    } catch {
      toast.error("Erro ao excluir licitação");
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
            Tem certeza que deseja excluir a licitação{" "}
            <strong>{licitacaoNumero}</strong>? Esta ação não pode ser desfeita.
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
