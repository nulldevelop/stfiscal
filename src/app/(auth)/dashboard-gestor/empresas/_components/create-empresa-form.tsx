"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCnpj } from "@/utils/formatCNPJ";
import { formatCpf } from "@/utils/formatCpf";
import { formatPhone } from "@/utils/formatPhone";
import { createEmpresaAction } from "../_actions/create-empresa";

// Definições de comprimento mínimo
const MIN_NAME_LENGTH = 2;
// O CNPJ formatado tem 18 caracteres (00.000.000/0000-00)
const CNPJ_FORMATTED_LENGTH = 18;
const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

const formSchema = z.object({
  name: z
    .string()
    .min(MIN_NAME_LENGTH, {
      message: "O nome deve ter pelo menos 2 caracteres.",
    })
    .trim(),
  cnpj: z
    .string()
    .length(CNPJ_FORMATTED_LENGTH, {
      message: "O CNPJ deve ter 14 dígitos (18 com a formatação).",
    })
    .regex(CNPJ_REGEX, {
      message: "Formato de CNPJ inválido (ex: 00.000.000/0000-00).",
    }),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  representanteNome: z.string().optional(),
  representanteRg: z.string().optional(),
  representanteCpf: z.string().optional(),
  representanteTelefone: z.string().optional(),
});

interface CreateEmpresaFormProps {
  onSuccess?: () => void;
}

export function CreateEmpresaForm({ onSuccess }: CreateEmpresaFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      name: "", 
      cnpj: "",
      endereco: "",
      telefone: "",
      representanteNome: "",
      representanteRg: "",
      representanteCpf: "",
      representanteTelefone: ""
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await startTransition(async () => {
      try {
        const rawCnpj = values.cnpj.replace(/[^\d]/g, "");
        const res = await createEmpresaAction(values as any); // Type cast due to transform in action

        if (res?.success) {
          toast.success("Empresa criada com sucesso! 🎉");
          form.reset();
          onSuccess?.();
        } else {
          toast.error(res?.error || "Erro ao criar empresa. Tente novamente.");
        }
      } catch (error) {
        console.error("Erro na submissão do formulário:", error);
        toast.error("Ocorreu um erro inesperado ao salvar a empresa.");
      }
    });
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {/* Campo Nome */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nome da Empresa / Razão Social</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: ACME Ltda"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo CNPJ */}
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    maxLength={CNPJ_FORMATTED_LENGTH}
                    onChange={(e) => {
                      field.onChange(formatCnpj(e.target.value));
                    }} 
                    placeholder="00.000.000/0000-00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Telefone */}
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone da Empresa</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    onChange={(e) => {
                      field.onChange(formatPhone(e.target.value));
                    }}
                    placeholder="(00) 00000-0000"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Endereço */}
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Endereço completo"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2 border-t pt-2 mt-2">
            <h4 className="font-medium text-sm text-primary">Dados do Representante</h4>
          </div>

          {/* Campo Representante Nome */}
          <FormField
            control={form.control}
            name="representanteNome"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nome do Representante</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome completo"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Representante CPF */}
          <FormField
            control={form.control}
            name="representanteCpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    maxLength={14}
                    onChange={(e) => {
                      field.onChange(formatCpf(e.target.value));
                    }}
                    placeholder="000.000.000-00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Representante Telefone */}
          <FormField
            control={form.control}
            name="representanteTelefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone do Representante</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    onChange={(e) => {
                      field.onChange(formatPhone(e.target.value));
                    }}
                    placeholder="(00) 00000-0000"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Representante RG */}
          <FormField
            control={form.control}
            name="representanteRg"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>RG</FormLabel>
                <FormControl>
                  <Input
                    placeholder="RG"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button className="w-full md:w-auto min-w-[150px]" disabled={isPending} type="submit">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Empresa"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
