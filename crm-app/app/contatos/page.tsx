// Página /contatos
//
// Este arquivo é um Server Component: roda no servidor, então pode
// consultar o banco diretamente, sem expor a senha do banco ao navegador.

import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { BotaoExcluir } from "@/app/ui/botao-excluir";
import { excluirContato } from "./actions";
import { FormularioContato } from "./formulario-contato";

export const metadata = {
  title: "Contatos | CRM",
};

export default function PaginaContatos() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Contatos</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Pessoas com quem você se relaciona.
        </p>
      </header>

      {/* Os dados vêm do banco a cada acesso. O Suspense mostra um aviso
          enquanto carregam. */}
      <Suspense fallback={<p className="text-sm">Carregando formulário...</p>}>
        <NovoContato />
      </Suspense>

      <Suspense fallback={<p className="text-sm">Carregando contatos...</p>}>
        <ListaContatos />
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

async function ListaContatos() {
  // Confere o login antes de ler os dados. Como isso lê o cookie, também
  // indica ao Next.js que esta parte é gerada a cada acesso.
  await exigirUsuario();

  const contatos = await prisma.contato.findMany({
    orderBy: { criadoEm: "desc" },
    // include traz junto os dados da empresa ligada a cada contato.
    include: { empresa: { select: { nome: true } } },
  });

  if (contatos.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Nenhum contato cadastrado ainda.
      </p>
    );
  }

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
              <td className="px-4 py-2">{contato.telefone ?? "—"}</td>
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
