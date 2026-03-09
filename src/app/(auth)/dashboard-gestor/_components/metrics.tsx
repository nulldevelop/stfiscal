"use client";
import { Briefcase, Building2, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDashboardMetrics } from "../_data-access/get-dashboard-metrics";

export function Metrics() {
  const [stats, setStats] = useState<{
    empresas: number;
    licitacoes: number;
    contratos: number;
  }>({ empresas: 0, licitacoes: 0, contratos: 0 });

  useEffect(() => {
    async function load() {
      const data = await getDashboardMetrics();
      if (data) {
        setStats(data);
      }
    }
    load().catch(() => {
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <Card className="transition-colors hover:bg-accent/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg text-foreground">Empresas</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/60">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-3xl">{stats.empresas}</div>
            <p className="text-muted-foreground text-sm">Registradas</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="transition-colors hover:bg-accent/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg text-foreground">Licitações</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/60">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-3xl">{stats.licitacoes}</div>
            <p className="text-muted-foreground text-sm">Cadastradas</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="transition-colors hover:bg-accent/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Contratos</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/60">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-3xl">{stats.contratos}</div>
            <p className="text-muted-foreground text-sm">Ativos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
