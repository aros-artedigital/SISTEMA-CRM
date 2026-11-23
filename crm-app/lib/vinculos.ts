// Confere os vínculos (contato e negócio) enviados por um formulário de
// atividade ou de tarefa. Usado pelas Server Actions dos dois.
import "server-only";

import { prisma } from "@/lib/prisma";

export async function validarVinculos(
  contatoId: string | null,
  negocioId: string | null,
): Promise<{ contatoId: string | null; negocioId: string | null } | { erro: string }> {
  if (negocioId) {
    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: { contatoId: true },
    });
    if (!negocio) return { erro: "O negócio não existe mais. Recarregue a página." };
    // Registro feito num negócio também aparece no histórico do contato dele.
    contatoId ??= negocio.contatoId;
  }

  if (contatoId) {
    const existe = await prisma.contato.count({ where: { id: contatoId } });
    if (!existe) return { erro: "O contato não existe mais. Recarregue a página." };
  }

  return { contatoId, negocioId };
}
