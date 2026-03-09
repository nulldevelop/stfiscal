"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    toast.info("Redirecionando para a página de login da Microsoft...");
    authClient.signIn.social({
      provider: "microsoft",
      callbackURL: "/auth/callback",
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-transparent shadow-none">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-8 flex flex-col justify-center gap-8">
            <div className="flex flex-col gap-2 text-left w-full">
              <h1 className="font-bold text-2xl">Acesse a Plataforma</h1>
              <p className="text-balance text-muted-foreground">
                Use sua conta da prefeitura para entrar.
              </p>
            </div>

            <Button
              className="w-full h-12 text-base font-medium"
              variant="outline"
              type="button"
              onClick={handleMicrosoftSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" role="img" aria-labelledby="microsoft-logo-title">
                    <title id="microsoft-logo-title">Microsoft logo</title>
                    <rect x="1" y="1" width="10" height="10" fill="#F35325" />
                    <rect x="13" y="1" width="10" height="10" fill="#81BC06" />
                    <rect x="1" y="13" width="10" height="10" fill="#05A6F0" />
                    <rect x="13" y="13" width="10" height="10" fill="#FFBA08" />
                  </svg>
                  Entrar com Microsoft
                </>
              )}
            </Button>
          </div>

          <div className="hidden items-center justify-center p-6 md:flex md:p-8">
            <Image
              alt="Image"
              className="max-h-full max-w-full object-contain"
              height={200}
              src="/imgs/LogoVertical.png"
              width={200}
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-muted-foreground text-xs [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Ao clicar em Entrar, você concorda com o{" "}
        <a href="/">Termo de Serviço</a> e{" "}
        <a href="/">Politica de Privacidade</a>.
      </div>
    </div>
  );
}
