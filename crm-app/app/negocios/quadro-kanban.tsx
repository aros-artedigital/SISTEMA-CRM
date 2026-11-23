"use client";

// Quadro Kanban do funil de vendas.
//
// Cada coluna é uma etapa. Para mudar um negócio de etapa:
// - arraste o cartão para outra coluna (mouse), ou
// - use a lista "Mover para" no cartão (teclado e celular, onde arrastar
//   não funciona bem).
//
// "Atualização otimista": o cartão muda de coluna na hora, antes da resposta
// do servidor. Se o servidor falhar, o React desfaz a mudança sozinho.

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { BotaoExcluir } from "@/app/ui/botao-excluir";
import { formatarReais } from "@/lib/dinheiro";
import { ETAPAS, type EtapaNegocio } from "@/lib/etapas";
import { excluirNegocio, moverNegocio } from "./actions";

export type CartaoNegocio = {
  id: string;
  titulo: string;
  valor: number;
  etapa: EtapaNegocio;
  contatoNome: string | null;
  empresaNome: string | null;
};

export function QuadroKanban({ negocios }: { negocios: CartaoNegocio[] }) {
  const [, iniciar] = useTransition();
  const [colunaDestacada, setColunaDestacada] = useState<EtapaNegocio | null>(null);

  const [negociosNaTela, moverNaTela] = useOptimistic(
    negocios,
    (atuais, mudanca: { id: string; etapa: EtapaNegocio }) =>
      atuais.map((n) => (n.id === mudanca.id ? { ...n, etapa: mudanca.etapa } : n)),
  );

  function mover(id: string, etapa: EtapaNegocio) {
    const negocio = negociosNaTela.find((n) => n.id === id);
    if (!negocio || negocio.etapa === etapa) return;
    iniciar(async () => {
      moverNaTela({ id, etapa });
      await moverNegocio(id, etapa);
    });
  }

  return (
    <section
      aria-label="Funil de vendas"
      className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2"
    >
      {ETAPAS.map((etapa) => {
        const daColuna = negociosNaTela.filter((n) => n.etapa === etapa.valor);
        const total = daColuna.reduce((soma, n) => soma + n.valor, 0);
        const destacada = colunaDestacada === etapa.valor;

        return (
          <div
            key={etapa.valor}
            // Permite soltar cartões nesta coluna.
            onDragOver={(e) => {
              e.preventDefault();
              setColunaDestacada(etapa.valor);
            }}
            onDragLeave={() => setColunaDestacada(null)}
            onDrop={(e) => {
              e.preventDefault();
              setColunaDestacada(null);
              mover(e.dataTransfer.getData("text/plain"), etapa.valor);
            }}
            className={`flex min-h-64 flex-col gap-3 rounded-lg border border-t-4 border-zinc-200 p-3 dark:border-zinc-800 ${etapa.cor} ${
              destacada ? "bg-zinc-100 dark:bg-zinc-800" : "bg-zinc-50 dark:bg-zinc-900/50"
            }`}
          >
            <header>
              <h2 className="flex items-center justify-between text-sm font-semibold">
                {etapa.nome}
                <span className="rounded-full bg-zinc-200 px-2 text-xs font-medium dark:bg-zinc-700">
                  {daColuna.length}
                </span>
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {formatarReais(total)}
              </p>
            </header>

            {daColuna.map((negocio) => (
              <article
                key={negocio.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", negocio.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                className="grid cursor-grab gap-1 rounded-md border border-zinc-200 bg-white p-3 text-sm shadow-sm active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900"
              >
                <Link
                  href={`/negocios/${negocio.id}`}
                  className="font-medium hover:underline"
                >
                  {negocio.titulo}
                </Link>
                <span className="font-semibold">{formatarReais(negocio.valor)}</span>
                {(negocio.empresaNome || negocio.contatoNome) && (
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {[negocio.empresaNome, negocio.contatoNome]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}

                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <select
                    aria-label={`Mover "${negocio.titulo}" para`}
                    value={negocio.etapa}
                    onChange={(e) => mover(negocio.id, e.target.value as EtapaNegocio)}
                    className="rounded border border-zinc-300 bg-transparent px-1 py-0.5 dark:border-zinc-700"
                  >
                    {ETAPAS.map((opcao) => (
                      <option key={opcao.valor} value={opcao.valor}>
                        {opcao.nome}
                      </option>
                    ))}
                  </select>
                  <BotaoExcluir
                    acao={excluirNegocio.bind(null, negocio.id)}
                    mensagem={`Excluir o negócio "${negocio.titulo}"? Esta ação não pode ser desfeita.`}
                  />
                </div>
              </article>
            ))}

            {daColuna.length === 0 && (
              <p className="text-xs text-zinc-500">Arraste um negócio para cá.</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
