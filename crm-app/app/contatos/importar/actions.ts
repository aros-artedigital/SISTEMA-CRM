"use server";

// Importa contatos de uma planilha (.xlsx ou .csv).
//
// Regras:
// - "Nome" é obrigatório; linhas sem nome são ignoradas.
// - Contatos cujo e-mail já existe (no sistema ou repetido na planilha)
//   são ignorados, para não criar duplicados.
// - Se a coluna "Empresa" vier preenchida, liga o contato a ela,
//   criando a empresa se ainda não existir.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { emailValido } from "@/lib/formulario";
import { ErroPlanilha, lerPlanilha } from "@/lib/planilha";

const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2 MB
const LINHAS_MAXIMAS = 2000;

export type ResultadoImportacao = {
  erro?: string;
  criados?: number;
  empresasCriadas?: number;
  ignorados?: { linha: number; motivo: string }[];
};

export async function importarContatos(
  _estadoAnterior: ResultadoImportacao,
  formData: FormData,
): Promise<ResultadoImportacao> {
  await exigirUsuario();

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Escolha um arquivo .xlsx ou .csv." };
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return { erro: "O arquivo passa de 2 MB. Divida a planilha em partes menores." };
  }

  let linhas;
  try {
    linhas = await lerPlanilha(arquivo);
  } catch (e) {
    if (e instanceof ErroPlanilha) return { erro: e.message };
    throw e;
  }
  if (linhas.length > LINHAS_MAXIMAS) {
    return { erro: `A planilha tem ${linhas.length} linhas; o limite é ${LINHAS_MAXIMAS} por vez.` };
  }

  // E-mails que já existem no sistema (em minúsculas, para comparar).
  const existentes = await prisma.contato.findMany({
    where: { email: { not: null } },
    select: { email: true },
  });
  const emailsVistos = new Set(existentes.map((c) => c.email!.toLowerCase()));

  // Empresas já cadastradas, por nome (sem diferenciar maiúsculas).
  const empresas = await prisma.empresa.findMany({ select: { id: true, nome: true } });
  const empresaPorNome = new Map(empresas.map((e) => [e.nome.toLowerCase(), e.id]));

  const ignorados: ResultadoImportacao["ignorados"] = [];
  const novos: {
    nome: string;
    email: string | null;
    telefone: string | null;
    cargo: string | null;
    empresaNome: string | null;
  }[] = [];

  linhas.forEach((l, i) => {
    const numeroLinha = i + 2; // +1 do cabeçalho, +1 porque planilhas começam em 1
    const nome = l.nome?.trim();
    if (!nome) {
      ignorados.push({ linha: numeroLinha, motivo: "sem nome" });
      return;
    }

    let email: string | null = l.email?.trim().toLowerCase() || null;
    if (email && !emailValido(email)) {
      ignorados.push({ linha: numeroLinha, motivo: `e-mail inválido (${email})` });
      return;
    }
    if (email && emailsVistos.has(email)) {
      ignorados.push({ linha: numeroLinha, motivo: `e-mail já cadastrado (${email})` });
      return;
    }
    if (email) emailsVistos.add(email);
    else email = null;

    novos.push({
      nome,
      email,
      telefone: l.telefone?.trim() || null,
      cargo: l.cargo?.trim() || null,
      empresaNome: l.empresa?.trim() || null,
    });
  });

  // Transação: ou entra tudo, ou nada (se der erro no meio, nada fica pela metade).
  const { criados, empresasCriadas } = await prisma.$transaction(async (tx) => {
    let empresasCriadas = 0;
    for (const n of novos) {
      if (n.empresaNome && !empresaPorNome.has(n.empresaNome.toLowerCase())) {
        const empresa = await tx.empresa.create({ data: { nome: n.empresaNome } });
        empresaPorNome.set(n.empresaNome.toLowerCase(), empresa.id);
        empresasCriadas++;
      }
    }

    const { count } = await tx.contato.createMany({
      data: novos.map((n) => ({
        nome: n.nome,
        email: n.email,
        telefone: n.telefone,
        cargo: n.cargo,
        empresaId: n.empresaNome ? empresaPorNome.get(n.empresaNome.toLowerCase())! : null,
      })),
    });
    return { criados: count, empresasCriadas };
  }, { timeout: 30_000 }); // planilhas grandes podem levar alguns segundos

  revalidatePath("/", "layout");
  return { criados, empresasCriadas, ignorados };
}
