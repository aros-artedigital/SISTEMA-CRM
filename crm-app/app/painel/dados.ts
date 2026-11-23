// Números do painel da página inicial.
import "server-only";

import { prisma } from "@/lib/prisma";
import { ETAPAS } from "@/lib/etapas";

const ETAPAS_ABERTAS = ["NOVO_LEAD", "QUALIFICADO", "PROPOSTA"] as const;
const MESES_NO_GRAFICO = 6;

const nomeMes = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const nomeMesAno = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export type MetricasPainel = {
  emAberto: { valor: number; quantidade: number };
  ganhoMes: { valor: number; mesAnterior: number };
  taxaGanho: { ganhos: number; perdidos: number } ;
  porEtapa: { nome: string; valor: number; quantidade: number }[];
  porMes: { rotulo: string; rotuloLongo: string; valor: number; quantidade: number }[];
};

export async function buscarMetricas(): Promise<MetricasPainel> {
  const agora = new Date();
  // Primeiro dia do mês mais antigo que aparece no gráfico.
  const inicioPeriodo = new Date(agora.getFullYear(), agora.getMonth() - (MESES_NO_GRAFICO - 1), 1);

  const [abertosPorEtapa, encerradosPorEtapa, ganhosRecentes] = await Promise.all([
    // groupBy = "agrupar e somar" direto no banco, sem trazer cada negócio.
    prisma.negocio.groupBy({
      by: ["etapa"],
      where: { etapa: { in: [...ETAPAS_ABERTAS] } },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.negocio.groupBy({
      by: ["etapa"],
      where: { etapa: { in: ["GANHO", "PERDIDO"] } },
      _count: true,
    }),
    prisma.negocio.findMany({
      where: { etapa: "GANHO", fechadoEm: { gte: inicioPeriodo } },
      select: { valor: true, fechadoEm: true },
    }),
  ]);

  // Funil: uma linha por etapa aberta, na ordem do quadro (mesmo as vazias).
  const porEtapa = ETAPAS.filter((e) =>
    (ETAPAS_ABERTAS as readonly string[]).includes(e.valor),
  ).map((etapa) => {
    const grupo = abertosPorEtapa.find((g) => g.etapa === etapa.valor);
    return {
      nome: etapa.nome,
      valor: grupo?._sum.valor?.toNumber() ?? 0,
      quantidade: grupo?._count ?? 0,
    };
  });

  // Ganhos por mês: cria os 6 meses zerados e soma cada negócio no seu mês.
  const porMes = Array.from({ length: MESES_NO_GRAFICO }, (_, i) => {
    const data = new Date(inicioPeriodo.getFullYear(), inicioPeriodo.getMonth() + i, 1);
    return {
      ano: data.getFullYear(),
      mes: data.getMonth(),
      rotulo: nomeMes.format(data).replace(".", ""),
      rotuloLongo: nomeMesAno.format(data),
      valor: 0,
      quantidade: 0,
    };
  });
  for (const negocio of ganhosRecentes) {
    if (!negocio.fechadoEm) continue;
    const alvo = porMes.find(
      (m) => m.ano === negocio.fechadoEm!.getFullYear() && m.mes === negocio.fechadoEm!.getMonth(),
    );
    if (alvo) {
      alvo.valor += negocio.valor.toNumber();
      alvo.quantidade += 1;
    }
  }

  const contar = (etapa: string) => encerradosPorEtapa.find((g) => g.etapa === etapa)?._count ?? 0;

  return {
    emAberto: {
      valor: porEtapa.reduce((s, e) => s + e.valor, 0),
      quantidade: porEtapa.reduce((s, e) => s + e.quantidade, 0),
    },
    ganhoMes: {
      valor: porMes[porMes.length - 1].valor,
      mesAnterior: porMes[porMes.length - 2].valor,
    },
    taxaGanho: { ganhos: contar("GANHO"), perdidos: contar("PERDIDO") },
    porEtapa,
    porMes: porMes.map(({ rotulo, rotuloLongo, valor, quantidade }) => ({
      rotulo,
      rotuloLongo,
      valor,
      quantidade,
    })),
  };
}
