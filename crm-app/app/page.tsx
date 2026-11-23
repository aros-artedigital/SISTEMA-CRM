// Página inicial: atalhos e um resumo do que precisa de atenção hoje.

import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { inicioDoDia, somarDias } from "@/lib/datas";

const estiloAtalho =
  "rounded-lg border border-zinc-200 p-4 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900";

export default function Inicio() {
  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">CRM</h1>

      <Suspense fallback={<p className="text-sm">Carregando resumo...</p>}>
        <ResumoDoDia />
      </Suspense>

      <nav className="grid gap-3 sm:grid-cols-2">
        <Link href="/negocios" className={estiloAtalho}>
          <span className="block font-medium">Funil de negócios</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Acompanhar oportunidades por etapa
          </span>
        </Link>
        <Link href="/tarefas" className={estiloAtalho}>
          <span className="block font-medium">Tarefas</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            O que precisa ser feito, por prazo
          </span>
        </Link>
        <Link href="/contatos" className={estiloAtalho}>
          <span className="block font-medium">Contatos</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Pessoas e histórico de conversas
          </span>
        </Link>
        <Link href="/empresas" className={estiloAtalho}>
          <span className="block font-medium">Empresas</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Cadastrar e listar organizações
          </span>
        </Link>
      </nav>
    </main>
  );
}

async function ResumoDoDia() {
  const usuario = await exigirUsuario();

  const hoje = inicioDoDia(new Date());
  const amanha = somarDias(hoje, 1);
  const pendente = { concluida: false };

  const [atrasadas, paraHoje] = await Promise.all([
    prisma.tarefa.count({ where: { ...pendente, prazo: { lt: hoje } } }),
    prisma.tarefa.count({ where: { ...pendente, prazo: { gte: hoje, lt: amanha } } }),
  ]);

  return (
    <section className="grid gap-2">
      <p className="text-zinc-600 dark:text-zinc-400">Olá, {usuario.nome}.</p>
      {atrasadas + paraHoje === 0 ? (
        <p className="text-sm">Nenhuma tarefa atrasada ou para hoje.</p>
      ) : (
        <Link
          href="/tarefas"
          className="flex flex-wrap gap-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-950/70"
        >
          {atrasadas > 0 && (
            <span className="font-medium text-red-700 dark:text-red-400">
              {atrasadas} tarefa(s) atrasada(s)
            </span>
          )}
          {paraHoje > 0 && (
            <span className="font-medium text-amber-800 dark:text-amber-300">
              {paraHoje} tarefa(s) para hoje
            </span>
          )}
          <span className="ml-auto underline">Ver tarefas</span>
        </Link>
      )}
    </section>
  );
}
