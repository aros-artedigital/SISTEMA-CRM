// Tipos de atividade, com nome e ícone para a tela.
// Os valores são os mesmos do enum TipoAtividade do schema.

import type { TipoAtividade } from "@/app/generated/prisma/enums";

export type { TipoAtividade };

export const TIPOS_ATIVIDADE: { valor: TipoAtividade; nome: string; icone: string }[] = [
  { valor: "LIGACAO", nome: "Ligação", icone: "📞" },
  { valor: "REUNIAO", nome: "Reunião", icone: "👥" },
  { valor: "EMAIL", nome: "E-mail", icone: "✉️" },
  { valor: "WHATSAPP", nome: "WhatsApp", icone: "💬" },
  { valor: "NOTA", nome: "Nota", icone: "📝" },
];

export function tipoAtividadeValido(valor: unknown): valor is TipoAtividade {
  return TIPOS_ATIVIDADE.some((t) => t.valor === valor);
}

export function descreverTipo(valor: TipoAtividade) {
  return (
    TIPOS_ATIVIDADE.find((t) => t.valor === valor) ??
    TIPOS_ATIVIDADE[TIPOS_ATIVIDADE.length - 1] // "Nota" como padrão
  );
}
