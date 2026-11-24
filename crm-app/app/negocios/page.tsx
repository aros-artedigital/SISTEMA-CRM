// Página /negocios: funil de vendas em formato Kanban.

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { formatarReais } from "@/lib/dinheiro";
import { BarraBusca, SelecaoFiltro, parametro } from "@/app/ui/barra-busca";
import { buscarOpcoes } from "./dados";
import { FormularioNegocio } from "./formulario-negocio";
import { QuadroKanban } from "./quadro-kanban";

export const metadata = {
  title: "Funil de negócios | CRM",
};

type ParametrosBusca = Promise<Record<string, string | string[] | undefined>>;

export default function PaginaNegocios({ searchParams }: { searchParams: ParametrosBusca }) {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Funil de negócios</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Arraste os cartões entre as colunas para mudar a etapa.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm">Carregando formulário...</p>}>
        <NovoNegocio />
      </Suspense>

      <Suspense fallback={<p className="text-sm">Carregando funil...</p>}>
        <Funil searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function NovoNegocio() {
  await exigirUsuario();
  const { contatos, empresas } = await buscarOpcoes();
  return <FormularioNegocio contatos={contatos} empresas={empresas} />;
}

async function Funil({ searchParams }: { searchParams: ParametrosBusca }) {
  await exigirUsuario();

  const parametros = await searchParams;
  const busca = parametro(parametros.q);
  const empresaId = parametro(parametros.empresa);
  const texto = { contains: busca, mode: "insensitive" as const };
  const filtrando = Boolean(busca || empresaId);

  const [negocios, empresas] = await Promise.all([
    prisma.negocio.findMany({
      where: {
        ...(busca && {
          OR: [
            { titulo: texto },
            { contato: { nome: texto } },
            { empresa: { nome: texto } },
          ],
        }),
        ...(empresaId ? { empresaId } : {}),
      },
      orderBy: { criadoEm: "desc" },
      include: {
        contato: { select: { nome: true } },
        empresa: { select: { nome: true } },
      },
    }),
    prisma.empresa.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  // O valor vem do banco como Decimal, um tipo que não pode ser enviado
  // ao navegador. Convertemos para número comum (e enviamos só o necessário).
  const cartoes = negocios.map((n) => ({
    id: n.id,
    titulo: n.titulo,
    valor: n.valor.toNumber(),
    etapa: n.etapa,
    contatoNome: n.contato?.nome ?? null,
    empresaNome: n.empresa?.nome ?? null,
  }));

  // Resumo: quanto está em aberto e quanto já foi ganho.
  const emAberto = cartoes
    .filter((c) => c.etapa !== "GANHO" && c.etapa !== "PERDIDO")
    .reduce((soma, c) => soma + c.valor, 0);
  const ganho = cartoes
    .filter((c) => c.etapa === "GANHO")
    .reduce((soma, c) => soma + c.valor, 0);

  return (
    <div className="grid gap-4">
      <BarraBusca
        caminho="/negocios"
        busca={busca}
        placeholder="Buscar por título, contato ou empresa"
        filtroAtivo={filtrando}
      >
        <SelecaoFiltro nome="empresa" valor={empresaId} rotulo="Filtrar por empresa">
          <option value="">Todas as empresas</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </SelecaoFiltro>
      </BarraBusca>
      {filtrando && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Mostrando {negocios.length} negócio(s) que atendem aos filtros. Os totais abaixo
          consideram só eles.
        </p>
      )}
      <dl className="flex flex-wrap gap-6 text-sm">
        <div>
          <dt className="text-zinc-600 dark:text-zinc-400">Em aberto</dt>
          <dd className="text-lg font-semibold">{formatarReais(emAberto)}</dd>
        </div>
        <div>
          <dt className="text-zinc-600 dark:text-zinc-400">Ganho</dt>
          <dd className="text-lg font-semibold text-green-700 dark:text-green-400">
            {formatarReais(ganho)}
          </dd>
        </div>
      </dl>
      <QuadroKanban negocios={cartoes} />
    </div>
  );
}
