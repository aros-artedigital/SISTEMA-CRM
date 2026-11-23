// Página /login

import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { sistemaConfigurado } from "@/lib/autenticacao";
import { FormularioLogin } from "./formulario-login";

export const metadata = {
  title: "Entrar | CRM",
};

export default function PaginaLogin() {
  return (
    <main className="mx-auto grid w-full max-w-sm gap-6 px-4 py-16">
      <Suspense fallback={<p className="text-sm">Carregando...</p>}>
        <ConteudoLogin />
      </Suspense>
    </main>
  );
}

async function ConteudoLogin() {
  await connection();
  // Ninguém definiu senha ainda? Então é o primeiro acesso.
  if (!(await sistemaConfigurado())) redirect("/primeiro-acesso");
  return <FormularioLogin />;
}
