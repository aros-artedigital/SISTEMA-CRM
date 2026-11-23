// Página /negocios/[id]: ficha do negócio, histórico e tarefas.

import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { formatarReais } from "@/lib/dinheiro";
import { formatarData } from "@/lib/datas";
import { ETAPAS } from "@/lib/etapas";
import { Dado, Secao } from "@/app/ui/secao";
import { FormularioAtividade } from "@/app/atividades/formulario-atividade";
import { ListaAtividades } from "@/app/atividades/lista-atividades";
import { FormularioTarefa } from "@/app/tarefas/formulario-tarefa";
import { ListaTarefas } from "@/app/tarefas/lista-tarefas";

export const metadata = {
  title: "Negócio | CRM",
};

export default function PaginaNegocio({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10">
      <Suspense fallback={<p className="text-sm">Carregando negócio...</p>}>
        <DetalheNegocio params={params} />
      </Suspense>
    </main>
  );
}

async function DetalheNegocio({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();
  const { id } = await params;

  const negocio = await prisma.negocio.findUnique({
    where: { id },
    include: {
      contato: { select: { id: true, nome: true } },
      empresa: { select: { nome: true } },
      responsavel: { select: { nome: true } },
    },
  });
  if (!negocio) notFound();

  const etapa = ETAPAS.find((e) => e.valor === negocio.etapa);

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/negocios" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            ← Funil
          </Link>
          <h1 className="text-2xl font-semibold">{negocio.titulo}</h1>
        </div>
        <Link
          href={`/negocios/${negocio.id}/editar`}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Editar
        </Link>
      </header>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Dado rotulo="Valor">{formatarReais(negocio.valor.toNumber())}</Dado>
        <Dado rotulo="Etapa">{etapa?.nome}</Dado>
        <Dado rotulo="Responsável">{negocio.responsavel.nome}</Dado>
        <Dado rotulo="Contato">
          {negocio.contato && (
            <Link href={`/contatos/${negocio.contato.id}`} className="hover:underline">
              {negocio.contato.nome}
            </Link>
          )}
        </Dado>
        <Dado rotulo="Empresa">{negocio.empresa?.nome}</Dado>
        <Dado rotulo={negocio.fechadoEm ? "Fechado em" : "Criado em"}>
          {formatarData(negocio.fechadoEm ?? negocio.criadoEm)}
        </Dado>
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <Secao titulo="Histórico">
          <FormularioAtividade negocioId={negocio.id} />
          <ListaAtividades negocioId={negocio.id} />
        </Secao>
        <Secao titulo="Tarefas">
          <FormularioTarefa negocioId={negocio.id} />
          <ListaTarefas negocioId={negocio.id} />
        </Secao>
      </div>
    </>
  );
}
