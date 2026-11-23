// Página /tarefas: todas as tarefas, de todos os contatos e negócios.

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { estiloCartao } from "@/app/ui/campos";
import { FormularioTarefa } from "./formulario-tarefa";
import { ListaTarefas } from "./lista-tarefas";

export const metadata = {
  title: "Tarefas | CRM",
};

export default function PaginaTarefas() {
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Tarefas</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          O que precisa ser feito, por prazo.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm">Carregando...</p>}>
        <Conteudo />
      </Suspense>
    </main>
  );
}

async function Conteudo() {
  await exigirUsuario();

  const [contatos, negocios] = await Promise.all([
    prisma.contato.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
    prisma.negocio.findMany({
      where: { etapa: { notIn: ["GANHO", "PERDIDO"] } }, // só negócios em aberto
      select: { id: true, titulo: true },
      orderBy: { titulo: "asc" },
    }),
  ]);

  return (
    <>
      <section className={estiloCartao}>
        <h2 className="text-lg font-semibold">Nova tarefa</h2>
        <FormularioTarefa
          opcoes={{
            contatos,
            negocios: negocios.map((n) => ({ id: n.id, nome: n.titulo })),
          }}
        />
      </section>
      <ListaTarefas />
    </>
  );
}
