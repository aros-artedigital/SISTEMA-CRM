// Página /contatos
//
// Este arquivo é um Server Component: roda no servidor, então pode
// consultar o banco diretamente, sem expor a senha do banco ao navegador.

import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { BotaoExcluir } from "@/app/ui/botao-excluir";
import { BarraBusca, SelecaoFiltro, parametro } from "@/app/ui/barra-busca";
import { LinkWhatsApp } from "@/app/ui/whatsapp";
import { excluirContato } from "./actions";
import { FormularioContato } from "./formulario-contato";

export const metadata = {
  title: "Contatos | CRM",
};

type ParametrosBusca = Promise<Record<string, string | string[] | undefined>>;

export default function PaginaContatos({ searchParams }: { searchParams: ParametrosBusca }) {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contatos</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Pessoas com quem você se relaciona.
          </p>
        </div>
        <Link
          href="/contatos/importar"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Importar planilha
        </Link>
      </header>

      {/* Os dados vêm do banco a cada acesso. O Suspense mostra um aviso
          enquanto carregam. */}
      <Suspense fallback={<p className="text-sm">Carregando formulário...</p>}>
        <NovoContato />
      </Suspense>

      <Suspense fallback={<p className="text-sm">Carregando contatos...</p>}>
        <ListaContatos searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// O formulário precisa da lista de empresas para o campo "Empresa".
async function NovoContato() {
  await exigirUsuario();
  const empresas = await prisma.empresa.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
  return <FormularioContato empresas={empresas} />;
}

async function ListaContatos({ searchParams }: { searchParams: ParametrosBusca }) {
  // Confere o login antes de ler os dados. Como isso lê o cookie, também
  // indica ao Next.js que esta parte é gerada a cada acesso.
  await exigirUsuario();

  const parametros = await searchParams;
  const busca = parametro(parametros.q);
  const empresaId = parametro(parametros.empresa);

  // "contains" + "insensitive" = contém o texto, sem diferenciar maiúsculas.
  const texto = { contains: busca, mode: "insensitive" as const };

  const [contatos, empresas] = await Promise.all([
    prisma.contato.findMany({
      where: {
        ...(busca && {
          OR: [
            { nome: texto },
            { email: texto },
            { telefone: texto },
            { cargo: texto },
            { empresa: { nome: texto } },
          ],
        }),
        ...(empresaId === "sem" ? { empresaId: null } : empresaId ? { empresaId } : {}),
      },
      orderBy: { criadoEm: "desc" },
      // include traz junto os dados da empresa ligada a cada contato.
      include: { empresa: { select: { nome: true } } },
    }),
    prisma.empresa.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  const filtrando = Boolean(busca || empresaId);

  return (
    <div className="grid gap-4">
      <BarraBusca
        caminho="/contatos"
        busca={busca}
        placeholder="Buscar por nome, e-mail, telefone, cargo ou empresa"
        filtroAtivo={filtrando}
      >
        <SelecaoFiltro nome="empresa" valor={empresaId} rotulo="Filtrar por empresa">
          <option value="">Todas as empresas</option>
          <option value="sem">Sem empresa</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </SelecaoFiltro>
      </BarraBusca>

      {contatos.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {filtrando ? "Nenhum contato encontrado com esses filtros." : "Nenhum contato cadastrado ainda."}
        </p>
      ) : (
        <TabelaContatos contatos={contatos} />
      )}
    </div>
  );
}

function TabelaContatos({
  contatos,
}: {
  contatos: {
    id: string;
    nome: string;
    email: string | null;
    telefone: string | null;
    cargo: string | null;
    empresa: { nome: string } | null;
  }[];
}) {
  return (
    <section className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-2 font-medium">Nome</th>
            <th className="px-4 py-2 font-medium">Empresa</th>
            <th className="px-4 py-2 font-medium">E-mail</th>
            <th className="px-4 py-2 font-medium">Telefone</th>
            <th className="px-4 py-2 font-medium">Cargo</th>
            <th className="px-4 py-2 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {contatos.map((contato) => (
            <tr
              key={contato.id}
              className="border-t border-zinc-200 dark:border-zinc-800"
            >
              <td className="px-4 py-2">
                <Link href={`/contatos/${contato.id}`} className="font-medium hover:underline">
                  {contato.nome}
                </Link>
              </td>
              <td className="px-4 py-2">{contato.empresa?.nome ?? "—"}</td>
              <td className="px-4 py-2">{contato.email ?? "—"}</td>
              <td className="px-4 py-2">
                <div className="grid">
                  <span className="whitespace-nowrap">{contato.telefone ?? "—"}</span>
                  <LinkWhatsApp telefone={contato.telefone} nome={contato.nome} />
                </div>
              </td>
              <td className="px-4 py-2">{contato.cargo ?? "—"}</td>
              <td className="px-4 py-2">
                <div className="flex gap-3">
                  <Link
                    href={`/contatos/${contato.id}/editar`}
                    className="hover:underline"
                  >
                    Editar
                  </Link>
                  <BotaoExcluir
                    acao={excluirContato.bind(null, contato.id)}
                    mensagem={`Excluir o contato "${contato.nome}"? Esta ação não pode ser desfeita.`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-zinc-200 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800">
        {contatos.length} contato(s)
      </p>
    </section>
  );
}
