// Página /primeiro-acesso
//
// Só funciona enquanto ninguém tiver definido uma senha.
// Depois disso, quem abrir esta página é mandado para o login.

import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { sistemaConfigurado } from "@/lib/autenticacao";
import { FormularioPrimeiroAcesso } from "./formulario-primeiro-acesso";

export const metadata = {
  title: "Primeiro acesso | CRM",
};

export default function PaginaPrimeiroAcesso() {
  return (
    <main className="mx-auto grid w-full max-w-sm gap-6 px-4 py-16">
      <Suspense fallback={<p className="text-sm">Carregando...</p>}>
        <Conteudo />
      </Suspense>
    </main>
  );
}

async function Conteudo() {
  await connection();
  if (await sistemaConfigurado()) redirect("/login");
  return <FormularioPrimeiroAcesso />;
}
