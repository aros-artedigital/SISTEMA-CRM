// Histórico de atividades de um contato ou de um negócio, da mais recente
// para a mais antiga. Server Component: consulta o banco diretamente.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarDataHora } from "@/lib/datas";
import { BotaoExcluir } from "@/app/ui/botao-excluir";
import { excluirAtividade } from "./actions";
import { descreverTipo } from "./tipos";

export async function ListaAtividades({
  contatoId,
  negocioId,
}: {
  contatoId?: string;
  negocioId?: string;
}) {
  const atividades = await prisma.atividade.findMany({
    where: contatoId ? { contatoId } : { negocioId },
    orderBy: { data: "desc" },
    include: {
      usuario: { select: { nome: true } },
      negocio: { select: { id: true, titulo: true } },
      contato: { select: { id: true, nome: true } },
    },
  });

  if (atividades.length === 0) {
    return <p className="text-sm text-zinc-500">Nenhuma atividade registrada.</p>;
  }

  return (
    <ol className="grid gap-3">
      {atividades.map((atividade) => {
        const tipo = descreverTipo(atividade.tipo);
        return (
          <li
            key={atividade.id}
            className="grid gap-1 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
          >
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span aria-hidden>{tipo.icone}</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{tipo.nome}</span>
              <span>· {formatarDataHora(atividade.data)}</span>
              <span>· {atividade.usuario.nome}</span>
              {/* Na página do contato, mostra de qual negócio é; na do negócio, de qual contato. */}
              {contatoId && atividade.negocio && (
                <Link href={`/negocios/${atividade.negocio.id}`} className="hover:underline">
                  · {atividade.negocio.titulo}
                </Link>
              )}
              {negocioId && atividade.contato && (
                <Link href={`/contatos/${atividade.contato.id}`} className="hover:underline">
                  · {atividade.contato.nome}
                </Link>
              )}
              <span className="ml-auto">
                <BotaoExcluir
                  acao={excluirAtividade.bind(null, atividade.id)}
                  mensagem="Excluir esta atividade do histórico?"
                />
              </span>
            </div>
            <p className="whitespace-pre-wrap">{atividade.descricao}</p>
          </li>
        );
      })}
    </ol>
  );
}
