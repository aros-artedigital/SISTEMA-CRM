// Página /contatos/[id]: ficha do contato, negócios, histórico e tarefas.

import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { formatarReais } from "@/lib/dinheiro";
import { ETAPAS } from "@/lib/etapas";
import { Dado, Secao } from "@/app/ui/secao";
import { LinkWhatsApp } from "@/app/ui/whatsapp";
import { FormularioAtividade } from "@/app/atividades/formulario-atividade";
import { ListaAtividades } from "@/app/atividades/lista-atividades";
import { FormularioTarefa } from "@/app/tarefas/formulario-tarefa";
import { ListaTarefas } from "@/app/tarefas/lista-tarefas";

export const metadata = {
  title: "Contato | CRM",
};

export default function PaginaContato({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10">
      <Suspense fallback={<p className="text-sm">Carregando contato...</p>}>
        <DetalheContato params={params} />
      </Suspense>
    </main>
  );
}

async function DetalheContato({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();
  const { id } = await params;

  const contato = await prisma.contato.findUnique({
    where: { id },
    include: {
      empresa: { select: { nome: true } },
      negocios: {
        select: { id: true, titulo: true, valor: true, etapa: true },
        orderBy: { criadoEm: "desc" },
      },
    },
  });
  if (!contato) notFound();

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/contatos" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            ← Contatos
          </Link>
          <h1 className="text-2xl font-semibold">{contato.nome}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Abre a conversa; depois registre o que foi falado no Histórico,
              escolhendo o tipo "WhatsApp". */}
          <LinkWhatsApp telefone={contato.telefone} nome={contato.nome} variante="botao" />
          <Link
            href={`/contatos/${contato.id}/editar`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Editar
          </Link>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Dado rotulo="Empresa">{contato.empresa?.nome}</Dado>
        <Dado rotulo="Cargo">{contato.cargo}</Dado>
        <Dado rotulo="E-mail">
          {contato.email && (
            <a href={`mailto:${contato.email}`} className="hover:underline">
              {contato.email}
            </a>
          )}
        </Dado>
        <Dado rotulo="Telefone">
          {contato.telefone && (
            <a href={`tel:${contato.telefone}`} className="hover:underline">
              {contato.telefone}
            </a>
          )}
        </Dado>
      </dl>

      <Secao titulo="Negócios">
        {contato.negocios.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum negócio com este contato.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {contato.negocios.map((negocio) => (
              <li key={negocio.id} className="flex flex-wrap justify-between gap-2">
                <Link href={`/negocios/${negocio.id}`} className="hover:underline">
                  {negocio.titulo}
                </Link>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {ETAPAS.find((e) => e.valor === negocio.etapa)?.nome} ·{" "}
                  {formatarReais(negocio.valor.toNumber())}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Secao>

      <div className="grid gap-6 lg:grid-cols-2">
        <Secao titulo="Histórico">
          <FormularioAtividade contatoId={contato.id} />
          <ListaAtividades contatoId={contato.id} />
        </Secao>
        <Secao titulo="Tarefas">
          <FormularioTarefa contatoId={contato.id} />
          <ListaTarefas contatoId={contato.id} />
        </Secao>
      </div>
    </>
  );
}
