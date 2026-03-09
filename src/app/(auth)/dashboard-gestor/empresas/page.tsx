"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Building2, Users, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AddEmpresaDialog } from "./_components/add-empresa-dialog";
import { EmpresasTable } from "./_components/empresas-table";
import { SearchEmpresasForm } from "./_components/search-empresas-form";
import { EmpresasSkeleton } from "./_components/empresas-skeleton";
import type { EmpresasResponse } from "./_data-access/get-empresas";

function EmpresasPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<EmpresasResponse['stats']>({
    total: 0,
    comRepresentante: 0,
    semRepresentante: 0
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="px-4">
          <h1 className="font-semibold text-2xl text-foreground">Empresas</h1>
          <p className="text-muted-foreground text-sm">Gerencie o cadastro de fornecedores e seus representantes</p>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4 px-4">
          <SearchEmpresasForm />
          <AddEmpresaDialog onSuccess={triggerRefresh} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 px-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Empresas</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-2 text-green-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Com Representante</p>
              <p className="text-2xl font-bold">{stats.comRepresentante}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-orange-500/10 p-2 text-orange-500">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sem Representante</p>
              <p className="text-2xl font-bold">{stats.semRepresentante}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mx-4">
        <EmpresasTable
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

export default function EmpresasPage() {
  return (
    <Suspense fallback={<EmpresasSkeleton />}>
      <EmpresasPageContent />
    </Suspense>
  );
}
