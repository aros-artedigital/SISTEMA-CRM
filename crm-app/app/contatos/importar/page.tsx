// Página /contatos/importar

import Link from "next/link";
import { Suspense } from "react";
import { exigirUsuario } from "@/lib/autenticacao";
import { FormularioImportacao } from "./formulario-importacao";

export const metadata = {
  title: "Importar contatos | CRM",
};

export default function PaginaImportar() {
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-10">
      <header>
        <Link href="/contatos" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          ← Contatos
        </Link>
        <h1 className="text-2xl font-semibold">Importar contatos</h1>
      </header>

      <section className="grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <p>A primeira linha da planilha deve ter os nomes das colunas. Reconheço:</p>
        <ul className="list-inside list-disc">
          <li>
            <strong>Nome</strong> (obrigatório)
          </li>
          <li>E-mail</li>
          <li>Telefone (ou Celular, WhatsApp)</li>
          <li>Cargo</li>
          <li>Empresa: se ainda não existir, é criada automaticamente</li>
        </ul>
        <p>
          Contatos com e-mail que já existe no sistema são ignorados, para não duplicar.
          Outras colunas são ignoradas.
        </p>
        <p>
          <a href="/modelo-contatos.csv" download className="underline">
            Baixar planilha de exemplo
          </a>{" "}
          (abre no Excel).
        </p>
      </section>

      {/* Confere o login antes de mostrar o formulário. */}
      <Suspense fallback={<p className="text-sm">Carregando...</p>}>
        <Conteudo />
      </Suspense>
    </main>
  );
}

async function Conteudo() {
  await exigirUsuario();
  return <FormularioImportacao />;
}
