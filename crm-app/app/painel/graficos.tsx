"use client";

// Gráficos do painel, feitos com HTML e CSS (sem biblioteca de gráficos).
//
// Regras seguidas (guia de visualização de dados):
// - uma série só → uma cor só (azul, validada para contraste e daltonismo);
// - barras finas (≤ 24px), ponta arredondada de 4px, base reta;
// - linhas de grade finas e discretas;
// - valor escrito na ponta da barra; textos nunca usam a cor da série;
// - dica (tooltip) ao passar o mouse OU ao focar com o teclado (Tab).
//   Ela só complementa: todo valor também está escrito ou na tabela.
//
// As cores vêm das classes .viz-* definidas em app/globals.css.

import { useState, type ReactNode } from "react";
import { formatarReais, formatarReaisCompacto } from "@/lib/dinheiro";

const ALTURA_BARRA = 20; // px
const LARGURA_COLUNA = 24; // px
const ALTURA_GRAFICO = 160; // px
const RESERVA_ROTULO = "8.5rem"; // espaço para "R$ 12,5 mil · 10 negócios"

function plural(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

// Caixinha que aparece sobre a marca ativa. Valor em destaque, nome em segundo plano.
function Dica({ valor, rotulo, visivel }: { valor: string; rotulo: string; visivel: boolean }) {
  if (!visivel) return null;
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 grid -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs shadow-md dark:border-zinc-700 dark:bg-zinc-900"
    >
      <span className="text-sm font-semibold">{valor}</span>
      <span className="viz-texto-mudo">{rotulo}</span>
    </span>
  );
}

// Área que responde ao mouse e ao teclado. A área de toque é maior que a marca.
function AlvoInterativo({
  indice,
  setAtivo,
  descricao,
  className,
  children,
}: {
  indice: number;
  setAtivo: (i: number | null) => void;
  descricao: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      tabIndex={0}
      aria-label={descricao}
      onPointerEnter={() => setAtivo(indice)}
      onPointerLeave={() => setAtivo(null)}
      onFocus={() => setAtivo(indice)}
      onBlur={() => setAtivo(null)}
      className={`relative rounded outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Barras horizontais: valor em aberto por etapa do funil.

export function GraficoFunil({
  dados,
}: {
  dados: { nome: string; valor: number; quantidade: number }[];
}) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const maximo = Math.max(...dados.map((d) => d.valor), 1);

  return (
    <div className="grid gap-3">
      {dados.map((d, i) => {
        const largura = (d.valor / maximo) * 100;
        const negocios = plural(d.quantidade, "negócio", "negócios");
        return (
          <div
            key={d.nome}
            className="grid grid-cols-[6.5rem_1fr] items-center gap-3 text-sm sm:grid-cols-[7.5rem_1fr]"
          >
            <span className="truncate text-zinc-600 dark:text-zinc-400">{d.nome}</span>
            <AlvoInterativo
              indice={i}
              setAtivo={setAtivo}
              descricao={`${d.nome}: ${formatarReais(d.valor)}, ${negocios}`}
              className="flex items-center gap-2 py-1"
            >
              {/* A barra maior ocupa o espaço todo MENOS uma reserva para o valor
                  na ponta, assim o texto nunca passa da borda do cartão. */}
              <span
                className="relative flex-none"
                style={{ width: `calc((100% - ${RESERVA_ROTULO}) * ${largura / 100})` }}
              >
                {d.valor > 0 && (
                  <span
                    className={`block rounded-r ${ativo === i ? "viz-barra-ativa" : "viz-barra"}`}
                    style={{ height: ALTURA_BARRA }}
                  />
                )}
                <Dica valor={formatarReais(d.valor)} rotulo={`${d.nome} · ${negocios}`} visivel={ativo === i} />
              </span>
              <span className="whitespace-nowrap text-xs tabular-nums">
                {formatarReaisCompacto(d.valor)}
                <span className="viz-texto-mudo"> · {negocios}</span>
              </span>
            </AlvoInterativo>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Colunas: valor ganho por mês.

// Arredonda o topo do eixo para um número "redondo" (1, 2, 2,5, 5 × 10ⁿ).
function topoDoEixo(maximo: number): number {
  if (maximo <= 0) return 1000;
  const potencia = 10 ** Math.floor(Math.log10(maximo));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * potencia >= maximo) return m * potencia;
  }
  return 10 * potencia;
}

export function GraficoGanhosPorMes({
  dados,
}: {
  dados: { rotulo: string; rotuloLongo: string; valor: number; quantidade: number }[];
}) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const maximo = Math.max(...dados.map((d) => d.valor));
  const topo = topoDoEixo(maximo);
  const marcas = [topo, topo / 2, 0];
  const ultimo = dados.length - 1;
  // Rótulos seletivos: só no mês atual e no maior mês (nunca em todas as colunas).
  const indiceMaior = maximo > 0 ? dados.findIndex((d) => d.valor === maximo) : -1;
  const colunas = { gridTemplateColumns: `repeat(${dados.length}, 1fr)` };

  return (
    // Coluna do eixo Y com largura fixa, para os rótulos não vazarem.
    <div className="grid grid-cols-[4.5rem_1fr] gap-x-2">
      <div className="viz-texto-mudo relative text-xs tabular-nums" style={{ height: ALTURA_GRAFICO }}>
        {marcas.map((m) => (
          <span
            key={m}
            className="absolute right-0 -translate-y-1/2 whitespace-nowrap"
            style={{ top: `${(1 - m / topo) * 100}%` }}
          >
            {formatarReaisCompacto(m)}
          </span>
        ))}
      </div>

      {/* Área do gráfico: grade ao fundo, colunas por cima */}
      <div className="relative" style={{ height: ALTURA_GRAFICO }}>
        {marcas.map((m) => (
          <span
            key={m}
            aria-hidden
            className={`absolute inset-x-0 h-px ${m === 0 ? "viz-eixo" : "viz-grade"}`}
            style={{ top: `${(1 - m / topo) * 100}%` }}
          />
        ))}
        <div className="absolute inset-0 grid" style={colunas}>
          {dados.map((d, i) => {
            const altura = (d.valor / topo) * 100;
            const mostrarRotulo = d.valor > 0 && (i === ultimo || i === indiceMaior);
            return (
              <AlvoInterativo
                key={d.rotuloLongo}
                indice={i}
                setAtivo={setAtivo}
                descricao={`${d.rotuloLongo}: ${formatarReais(d.valor)}, ${plural(d.quantidade, "negócio ganho", "negócios ganhos")}`}
                className="flex h-full flex-col items-center justify-end"
              >
                {mostrarRotulo && (
                  <span className="mb-1 whitespace-nowrap text-xs tabular-nums">
                    {formatarReaisCompacto(d.valor)}
                  </span>
                )}
                {d.valor > 0 && (
                  <span
                    className={`block flex-none rounded-t ${ativo === i ? "viz-barra-ativa" : "viz-barra"}`}
                    style={{ width: LARGURA_COLUNA, height: `${altura}%` }}
                  />
                )}
                <Dica
                  valor={formatarReais(d.valor)}
                  rotulo={`${d.rotuloLongo} · ${plural(d.quantidade, "ganho", "ganhos")}`}
                  visivel={ativo === i}
                />
              </AlvoInterativo>
            );
          })}
        </div>
      </div>

      {/* Eixo X: dentro do mesmo bloco, para nunca ser cortado */}
      <span />
      <div className="viz-texto-mudo mt-2 grid text-center text-xs" style={colunas}>
        {dados.map((d) => (
          <span key={d.rotuloLongo}>{d.rotulo}</span>
        ))}
      </div>
    </div>
  );
}
