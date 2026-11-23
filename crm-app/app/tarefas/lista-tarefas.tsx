// Lista de tarefas. Pode mostrar as de um contato, as de um negócio,
// ou todas (página /tarefas).
//
// Pendentes primeiro, por prazo (as sem prazo no fim), com destaque para
// atrasadas e de hoje. As concluídas ficam recolhidas no final.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarData, inicioDoDia, somarDias } from "@/lib/datas";
import { BotaoExcluir } from "@/app/ui/botao-excluir";
import { excluirTarefa } from "./actions";
import { CaixaConcluir } from "./caixa-concluir";

type Filtro = { contatoId?: string; negocioId?: string };

const LIMITE_CONCLUIDAS = 20;

export async function ListaTarefas({ contatoId, negocioId }: Filtro) {
  const onde = contatoId ? { contatoId } : negocioId ? { negocioId } : {};
  const incluir = {
    contato: { select: { id: true, nome: true } },
    negocio: { select: { id: true, titulo: true } },
  };

  const [pendentes, concluidas] = await Promise.all([
    prisma.tarefa.findMany({
      where: { ...onde, concluida: false },
      orderBy: [{ prazo: { sort: "asc", nulls: "last" } }, { criadoEm: "asc" }],
      include: incluir,
    }),
    prisma.tarefa.findMany({
      where: { ...onde, concluida: true },
      orderBy: { criadoEm: "desc" },
      take: LIMITE_CONCLUIDAS,
      include: incluir,
    }),
  ]);

  const hoje = inicioDoDia(new Date());
  const amanha = somarDias(hoje, 1);

  function Linha({ tarefa }: { tarefa: (typeof pendentes)[number] }) {
    const atrasada = !tarefa.concluida && tarefa.prazo && tarefa.prazo < hoje;
    const deHoje =
      !tarefa.concluida && tarefa.prazo && tarefa.prazo >= hoje && tarefa.prazo < amanha;

    return (
      <li className="flex items-start gap-3 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
        <span className="pt-0.5">
          <CaixaConcluir id={tarefa.id} titulo={tarefa.titulo} concluida={tarefa.concluida} />
        </span>
        <div className="grid flex-1 gap-1">
          <span className={tarefa.concluida ? "text-zinc-500 line-through" : ""}>
            {tarefa.titulo}
          </span>
          <span className="flex flex-wrap gap-x-2 text-xs text-zinc-600 dark:text-zinc-400">
            {tarefa.prazo && (
              <span
                className={
                  atrasada
                    ? "font-medium text-red-600 dark:text-red-400"
                    : deHoje
                      ? "font-medium text-amber-600 dark:text-amber-400"
                      : ""
                }
              >
                {atrasada ? "Atrasada · " : deHoje ? "Hoje · " : "Prazo: "}
                {formatarData(tarefa.prazo)}
              </span>
            )}
            {!contatoId && tarefa.contato && (
              <Link href={`/contatos/${tarefa.contato.id}`} className="hover:underline">
                {tarefa.contato.nome}
              </Link>
            )}
            {!negocioId && tarefa.negocio && (
              <Link href={`/negocios/${tarefa.negocio.id}`} className="hover:underline">
                {tarefa.negocio.titulo}
              </Link>
            )}
          </span>
        </div>
        <BotaoExcluir
          acao={excluirTarefa.bind(null, tarefa.id)}
          mensagem={`Excluir a tarefa "${tarefa.titulo}"?`}
        />
      </li>
    );
  }

  return (
    <div className="grid gap-3">
      {pendentes.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma tarefa pendente.</p>
      ) : (
        <ul className="grid gap-2">
          {pendentes.map((tarefa) => (
            <Linha key={tarefa.id} tarefa={tarefa} />
          ))}
        </ul>
      )}

      {concluidas.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">
            Concluídas ({concluidas.length}
            {concluidas.length === LIMITE_CONCLUIDAS ? "+" : ""})
          </summary>
          <ul className="mt-2 grid gap-2">
            {concluidas.map((tarefa) => (
              <Linha key={tarefa.id} tarefa={tarefa} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
