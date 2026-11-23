// Peças do painel que não precisam de interação (rodam no servidor).

import type { ReactNode } from "react";

// Indicador: rótulo, valor grande e, opcionalmente, uma comparação.
export function Indicador({
  rotulo,
  valor,
  destaque = false,
  rodape,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean; // o número principal do painel (só um por tela)
  rodape?: ReactNode;
}) {
  return (
    <div className="grid content-start gap-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{rotulo}</span>
      <span className={destaque ? "text-5xl font-semibold tracking-tight" : "text-2xl font-semibold"}>
        {valor}
      </span>
      {rodape && <span className="text-xs">{rodape}</span>}
    </div>
  );
}

// Variação contra o período anterior: seta + texto (nunca só a cor).
export function Variacao({ diferenca, texto }: { diferenca: number; texto: string }) {
  if (diferenca === 0) {
    return <span className="text-zinc-600 dark:text-zinc-400">= igual ao mês passado</span>;
  }
  const subiu = diferenca > 0;
  return (
    <span className={subiu ? "viz-sucesso" : "viz-critico"}>
      <span aria-hidden>{subiu ? "▲" : "▼"}</span> {subiu ? "Mais" : "Menos"} {texto}
    </span>
  );
}

// Cartão com título que abriga um gráfico e sua versão em tabela.
export function CartaoGrafico({
  titulo,
  subtitulo,
  children,
  tabela,
}: {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  tabela: { colunas: string[]; linhas: string[][] };
}) {
  return (
    <section className="grid content-start gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <h2 className="font-semibold">{titulo}</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{subtitulo}</p>
      </header>
      {/* pt-6 dá espaço para a dica que aparece acima das marcas */}
      <div className="pt-6">{children}</div>
      {/* Versão em tabela: acessível a leitores de tela e para conferir os números. */}
      <details className="text-xs">
        <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">Ver como tabela</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead>
            <tr className="text-zinc-600 dark:text-zinc-400">
              {tabela.colunas.map((c) => (
                <th key={c} className="py-1 pr-3 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabela.linhas.map((linha) => (
              <tr key={linha[0]} className="border-t border-zinc-200 dark:border-zinc-800">
                {linha.map((celula, i) => (
                  <td key={i} className="py-1 pr-3">
                    {celula}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
