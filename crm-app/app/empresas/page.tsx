// Página /empresas: cadastro e lista de empresas.

import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { BotaoExcluir } from "@/app/ui/botao-excluir";
import { BarraBusca, parametro } from "@/app/ui/barra-busca";
import { excluirEmpresa } from "./actions";
import { FormularioEmpresa } from "./formulario-empresa";

export const metadata = {
  title: "Empresas | CRM",
};

type ParametrosBusca = Promise<Record<string, string | string[] | undefined>>;

export default function PaginaEmpresas({ searchParams }: { searchParams: ParametrosBusca }) {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Empresas</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Organizações clientes ou potenciais clientes.
        </p>
      </header>

      <FormularioEmpresa />

      <Suspense fallback={<p className="text-sm">Carregando empresas...</p>}>
        <ListaEmpresas searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ListaEmpresas({ searchParams }: { searchParams: ParametrosBusca }) {
  await exigirUsuario();

  const busca = parametro((await searchParams).q);
  const texto = { contains: busca, mode: "insensitive" as const };

  const empresas = await prisma.empresa.findMany({
    where: busca
      ? {
          OR: [
            { nome: texto },
            { cnpj: texto },
            { telefone: texto },
            { site: texto },
            { endereco: texto },
          ],
        }
      : {},
    orderBy: { nome: "asc" },
    // _count traz quantos contatos cada empresa tem, sem carregar todos eles.
    include: { _count: { select: { contatos: true } } },
  });

  return (
    <div className="grid gap-4">
      <BarraBusca
        caminho="/empresas"
        busca={busca}
        placeholder="Buscar por nome, CNPJ, telefone, site ou endereço"
        filtroAtivo={Boolean(busca)}
      />
      {empresas.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {busca ? "Nenhuma empresa encontrada para essa busca." : "Nenhuma empresa cadastrada ainda."}
        </p>
      ) : (
        <TabelaEmpresas empresas={empresas} />
      )}
    </div>
  );
}

function TabelaEmpresas({
  empresas,
}: {
  empresas: {
    id: string;
    nome: string;
    cnpj: string | null;
    telefone: string | null;
    site: string | null;
    _count: { contatos: number };
  }[];
}) {
  return (
    <section className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-2 font-medium">Nome</th>
            <th className="px-4 py-2 font-medium">CNPJ</th>
            <th className="px-4 py-2 font-medium">Telefone</th>
            <th className="px-4 py-2 font-medium">Site</th>
            <th className="px-4 py-2 font-medium">Contatos</th>
            <th className="px-4 py-2 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((empresa) => (
            <tr
              key={empresa.id}
              className="border-t border-zinc-200 dark:border-zinc-800"
            >
              <td className="px-4 py-2">{empresa.nome}</td>
              <td className="px-4 py-2 whitespace-nowrap">{empresa.cnpj ?? "—"}</td>
              <td className="px-4 py-2">{empresa.telefone ?? "—"}</td>
              <td className="px-4 py-2">
                {empresa.site ? (
                  <a
                    href={empresa.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {empresa.site.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-2">{empresa._count.contatos}</td>
              <td className="px-4 py-2">
                <div className="flex gap-3">
                  <Link
                    href={`/empresas/${empresa.id}/editar`}
                    className="hover:underline"
                  >
                    Editar
                  </Link>
                  <BotaoExcluir
                    acao={excluirEmpresa.bind(null, empresa.id)}
                    mensagem={`Excluir a empresa "${empresa.nome}"? Os contatos dela continuam cadastrados, mas ficam sem empresa. Esta ação não pode ser desfeita.`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-zinc-200 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800">
        {empresas.length} empresa(s)
      </p>
    </section>
  );
}
