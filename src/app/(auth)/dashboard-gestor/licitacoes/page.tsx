"use client";

import { CheckCircle2, FileText, ListFilter, PlayCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LicitacoesSkeleton } from "./_components/licitacoes-skeleton";
import { LicitacoesTable } from "./_components/licitacoes-table";
import { SearchLicitacoesForm } from "./_components/search-licitacoes-form";
import { AddLicitacaoDialog } from "./_components/add-licitacao-dialog";
import { LicitacoesPageActions } from "./_components/licitacoes-page-actions";
import type { LicitacoesResponse } from "./_data-access/get-licitacoes";

function LicitacoesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<LicitacoesResponse['stats']>({
    total: 0,
    emAndamento: 0,
    concluidas: 0,
    outras: 0
  });

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  const triggerRefresh = () => {
    router.refresh();
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4">
        <div>
          <h1 className="font-semibold text-2xl text-foreground">Licitações</h1>
          <p className="text-muted-foreground text-sm">Acompanhe e gerencie os processos licitatórios</p>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <SearchLicitacoesForm />
          <div className="flex items-center gap-2">
            <AddLicitacaoDialog onSuccess={triggerRefresh} />
            <LicitacoesPageActions onSuccess={triggerRefresh} />
          </div>
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Geral</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
              <PlayCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{stats.emAndamento}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold">{stats.concluidas}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-orange-500/10 p-2 text-orange-500">
              <ListFilter className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Outras Situações</p>
              <p className="text-2xl font-bold">{stats.outras}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mx-4">
        <LicitacoesTable
          search={search}
          page={page}
          pageSize={pageSize}
          refreshKey={refreshKey}
          triggerRefresh={triggerRefresh}
          onDataLoaded={setStats}
        />
      </div>
    </div>
  );
}

export default function LicitacoesPage() {
  return (
    <Suspense fallback={<LicitacoesSkeleton />}>
      <LicitacoesPageContent />
    </Suspense>
  );
}
