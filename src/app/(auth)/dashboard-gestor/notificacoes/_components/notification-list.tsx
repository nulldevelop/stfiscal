"use client";

import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatData } from "@/utils/formatData";

export type Notification = {
  id: string;
  createdAt: Date;
  title: string;
  message: string;
  filePath: string;
  user: {
    name: string | null;
  } | null;
  [key: string]: unknown;
};

interface NotificationListProps {
  notifications: Notification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const renderNotificationDetails = (notification: Notification) => {
    if (!notification) {
      return null;
    }

    const filteredEntries = Object.entries(notification).filter(
      ([key]) =>
        key !== "id" &&
        key !== "organizationId" &&
        key !== "userId" &&
        key !== "createdAt" &&
        key !== "updatedAt" &&
        key !== "user" &&
        key !== "filePath"
    );

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2 border-b pb-2 text-sm md:grid-cols-2">
          <strong className="font-medium text-muted-foreground capitalize">
            Criado por:
          </strong>
          <span className="wrap-break-word">
            {notification.user?.name ?? "Desconhecido"}
          </span>
        </div>
        {filteredEntries.map(([key, value]) => (
          <div
            className="grid grid-cols-1 gap-2 border-b pb-2 text-sm md:grid-cols-2"
            key={key}
          >
            <strong className="font-medium text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}:
            </strong>
            <span className="wrap-break-word">
              {value instanceof Date
                ? formatData(value)
                : String(value ?? "Não Respondida")}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedNotification(null)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Mensagem</TableHead>
            <TableHead>Criado por</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhuma notificação encontrada.
              </TableCell>
            </TableRow>
          ) : (
            notifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell>{notification.title}</TableCell>
                <TableCell>{notification.message}</TableCell>
                <TableCell>{notification.user?.name ?? "Desconhecido"}</TableCell>
                <TableCell>{formatData(notification.createdAt)}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <DialogTrigger
                    asChild
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                  </DialogTrigger>
                  {notification.filePath && (
                    <Button size="sm" asChild>
                      <a href={notification.filePath} download>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        PDF
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedNotification && (
        <DialogContent className="w-[80vw] min-w-5xl">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Notificação: {selectedNotification.title}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Criado por:{" "}
              {selectedNotification.user?.name ?? "Desconhecido"} | Criado em:{" "}
              {formatData(selectedNotification.createdAt)}
            </p>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] p-1">
            <div className="p-4">{renderNotificationDetails(selectedNotification)}</div>
          </ScrollArea>
          <DialogFooter className="sm:justify-end">
            {selectedNotification.filePath && (
              <Button asChild>
                <a href={selectedNotification.filePath} download>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Baixar PDF
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
