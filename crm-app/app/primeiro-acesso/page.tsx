// Página /primeiro-acesso
//
// Só funciona enquanto ninguém tiver definido uma senha.
// Depois disso, quem abrir esta página é mandado para o login.

import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { exigenciaCodigoPrimeiroAcesso, sistemaConfigurado } from "@/lib/autenticacao";
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

  const exigencia = exigenciaCodigoPrimeiroAcesso();
  if (exigencia === "faltando") {
    return (
      <div className="grid gap-2 rounded-lg border border-zinc-200 p-6 text-sm dark:border-zinc-800">
        <h1 className="text-xl font-semibold">Configuração pendente</h1>
        <p>
          Para criar o primeiro usuário, defina a variável{" "}
          <code className="font-mono">CODIGO_PRIMEIRO_ACESSO</code> no servidor e
          recarregue esta página.
        </p>
      </div>
    );
  }
  return <FormularioPrimeiroAcesso pedirCodigo={exigencia === "sim"} />;
}
