export interface EmpresaDTO {
  id: string;
  name: string;
  cnpj: string;
  representanteNome?: string | null;
  representanteCpf?: string | null;
}
