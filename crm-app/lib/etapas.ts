// Etapas do funil de vendas, na ordem em que aparecem no quadro.
// Os valores (NOVO_LEAD etc.) são os mesmos do enum EtapaNegocio do schema.

import type { EtapaNegocio } from "@/app/generated/prisma/enums";

export type { EtapaNegocio };

export const ETAPAS: { valor: EtapaNegocio; nome: string; cor: string }[] = [
  { valor: "NOVO_LEAD", nome: "Novo lead", cor: "border-t-sky-500" },
  { valor: "QUALIFICADO", nome: "Qualificado", cor: "border-t-violet-500" },
  { valor: "PROPOSTA", nome: "Proposta", cor: "border-t-amber-500" },
  { valor: "GANHO", nome: "Ganho", cor: "border-t-green-600" },
  { valor: "PERDIDO", nome: "Perdido", cor: "border-t-zinc-400" },
];

export function etapaValida(valor: unknown): valor is EtapaNegocio {
  return ETAPAS.some((etapa) => etapa.valor === valor);
}

// Ganho e Perdido encerram o negócio.
export function etapaEncerrada(etapa: EtapaNegocio): boolean {
  return etapa === "GANHO" || etapa === "PERDIDO";
}
