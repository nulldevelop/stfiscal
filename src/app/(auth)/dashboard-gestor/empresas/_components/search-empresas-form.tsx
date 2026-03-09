"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";

export function SearchEmpresasForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div>
      <Input
        className="w-64"
        defaultValue={searchParams.get("search") || ""}
        placeholder="Buscar por nome ou CNPJ..."
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
