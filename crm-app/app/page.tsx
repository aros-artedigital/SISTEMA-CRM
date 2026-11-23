// Página inicial: o que precisa de atenção hoje e o painel de vendas.

import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { inicioDoDia, somarDias } from "@/lib/datas";
import { formatarReais } from "@/lib/dinheiro";
import { buscarMetricas } from "./painel/dados";
import { CartaoGrafico, Indicador, Variacao } from "./painel/blocos";
import { GraficoFunil, GraficoGanhosPorMes } from "./painel/graficos";

export default function Inicio() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Painel</h1>

      <Suspense fallback={<p className="text-sm">Carregando resumo...</p>}>
        <ResumoDoDia />
      </Suspense>

      <Suspense fallback={<p className="text-sm">Carregando painel...</p>}>
        <PainelVendas />
      </Suspense>
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

async function PainelVendas() {
  await exigirUsuario();
  const m = await buscarMetricas();

  const encerrados = m.taxaGanho.ganhos + m.taxaGanho.perdidos;
  const taxa = encerrados > 0 ? Math.round((m.taxaGanho.ganhos / encerrados) * 100) : null;
  const diferencaMes = m.ganhoMes.valor - m.ganhoMes.mesAnterior;
  const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

  return (
    <div className="grid gap-6">
      {/* Indicadores. O primeiro é o número principal do painel. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <Indicador
          destaque
          rotulo="Em aberto no funil"
          valor={formatarReais(m.emAberto.valor)}
          rodape={
            <span className="text-zinc-600 dark:text-zinc-400">
              {plural(m.emAberto.quantidade, "negócio em andamento", "negócios em andamento")}
            </span>
          }
        />
        <Indicador
          rotulo="Ganho este mês"
          valor={formatarReais(m.ganhoMes.valor)}
          rodape={
            <Variacao
              diferenca={diferencaMes}
              texto={`${formatarReais(Math.abs(diferencaMes))} que no mês passado`}
            />
          }
        />
        <Indicador
          rotulo="Taxa de ganho"
          valor={taxa === null ? "—" : `${taxa}%`}
          rodape={
            <span className="text-zinc-600 dark:text-zinc-400">
              {encerrados === 0
                ? "Nenhum negócio encerrado ainda"
                : `${plural(m.taxaGanho.ganhos, "ganho", "ganhos")} de ${plural(encerrados, "encerrado", "encerrados")}`}
            </span>
          }
        />
        <Indicador
          rotulo="Negócios em aberto"
          valor={String(m.emAberto.quantidade)}
          rodape={
            <Link href="/negocios" className="text-zinc-600 underline dark:text-zinc-400">
              Ver funil
            </Link>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CartaoGrafico
          titulo="Funil por etapa"
          subtitulo="Valor em aberto e número de negócios em cada etapa"
          tabela={{
            colunas: ["Etapa", "Valor", "Negócios"],
            linhas: m.porEtapa.map((e) => [e.nome, formatarReais(e.valor), String(e.quantidade)]),
          }}
        >
          <GraficoFunil dados={m.porEtapa} />
        </CartaoGrafico>

        <CartaoGrafico
          titulo="Ganhos por mês"
          subtitulo="Valor dos negócios ganhos nos últimos 6 meses"
          tabela={{
            colunas: ["Mês", "Valor ganho", "Negócios"],
            linhas: m.porMes.map((x) => [x.rotuloLongo, formatarReais(x.valor), String(x.quantidade)]),
          }}
        >
          <GraficoGanhosPorMes dados={m.porMes} />
        </CartaoGrafico>
      </div>
    </div>
  );
}
