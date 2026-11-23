"use server";

// Server Actions de negócios: cadastrar, editar, mover de etapa e excluir.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lerReais } from "@/lib/dinheiro";
import { etapaEncerrada, etapaValida, type EtapaNegocio } from "@/lib/etapas";
import { lerCampo, respostaDeErro, type EstadoFormulario } from "@/lib/formulario";
import { exigirUsuario } from "@/lib/autenticacao";

// Maior valor que cabe na coluna Decimal(12, 2) do banco.
const VALOR_MAXIMO = 9_999_999_999.99;

type DadosNegocio = {
  titulo: string;
  valor: string; // o Prisma aceita Decimal como texto, sem perder centavos
  etapa: EtapaNegocio;
  contatoId: string | null;
  empresaId: string | null;
};

async function validarNegocio(
  formData: FormData,
): Promise<{ dados: DadosNegocio } | { erro: string }> {
  const titulo = lerCampo(formData, "titulo");
  const valorDigitado = lerCampo(formData, "valor");
  const etapa = lerCampo(formData, "etapa") ?? "NOVO_LEAD";
  const contatoId = lerCampo(formData, "contatoId");
  let empresaId = lerCampo(formData, "empresaId");

  if (!titulo) {
    return { erro: "O título é obrigatório." };
  }

  // Valor vazio conta como zero (ex.: ainda não se sabe o valor).
  const valor = valorDigitado === null ? 0 : lerReais(valorDigitado);
  if (valor === null) {
    return { erro: "Valor inválido. Use, por exemplo, 1.500,00." };
  }
  if (valor > VALOR_MAXIMO) {
    return { erro: "Valor alto demais." };
  }

  if (!etapaValida(etapa)) {
    return { erro: "Etapa inválida." };
  }

  if (contatoId) {
    const contato = await prisma.contato.findUnique({
      where: { id: contatoId },
      select: { empresaId: true },
    });
    if (!contato) {
      return { erro: "O contato escolhido não existe mais. Recarregue a página." };
    }
    // Se a empresa ficou em branco, usa a empresa do contato.
    empresaId ??= contato.empresaId;
  }

  if (empresaId) {
    const existe = await prisma.empresa.count({ where: { id: empresaId } });
    if (!existe) {
      return { erro: "A empresa escolhida não existe mais. Recarregue a página." };
    }
  }

  return {
    dados: { titulo, valor: valor.toFixed(2), etapa, contatoId, empresaId },
  };
}

// Ganho/Perdido registram a data de fechamento; as outras etapas a apagam
// (caso um negócio "perdido" seja reaberto, por exemplo).
function dataDeFechamento(etapa: EtapaNegocio): Date | null {
  return etapaEncerrada(etapa) ? new Date() : null;
}

export async function criarNegocio(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  // Só quem está logado pode gravar. Quem cadastra vira o responsável.
  const usuario = await exigirUsuario();

  const resultado = await validarNegocio(formData);
  if ("erro" in resultado) return respostaDeErro(resultado.erro, formData);

  await prisma.negocio.create({
    data: {
      ...resultado.dados,
      fechadoEm: dataDeFechamento(resultado.dados.etapa),
      responsavelId: usuario.id,
    },
  });

  revalidatePath("/negocios");
  return { sucesso: `Negócio "${resultado.dados.titulo}" cadastrado.` };
}

export async function atualizarNegocio(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirUsuario();

  const resultado = await validarNegocio(formData);
  if ("erro" in resultado) return respostaDeErro(resultado.erro, formData);

  const atual = await prisma.negocio.findUnique({
    where: { id },
    select: { etapa: true },
  });
  if (!atual) {
    return respostaDeErro("Este negócio não existe mais.", formData);
  }

  await prisma.negocio.update({
    where: { id },
    data: {
      ...resultado.dados,
      // Só mexe na data de fechamento se a etapa mudou.
      ...(atual.etapa !== resultado.dados.etapa && {
        fechadoEm: dataDeFechamento(resultado.dados.etapa),
      }),
    },
  });

  revalidatePath("/negocios");
  redirect("/negocios");
}

// Chamada quando um cartão é arrastado para outra coluna do quadro.
export async function moverNegocio(id: string, etapa: EtapaNegocio): Promise<void> {
  await exigirUsuario();

  // A etapa vem do navegador, então é conferida aqui no servidor.
  if (!etapaValida(etapa)) return;

  // `etapa: { not: etapa }` evita gravar (e mudar a data) se nada mudou.
  await prisma.negocio.updateMany({
    where: { id, etapa: { not: etapa } },
    data: { etapa, fechadoEm: dataDeFechamento(etapa) },
  });

  revalidatePath("/negocios");
}

export async function excluirNegocio(id: string): Promise<void> {
  await exigirUsuario();

  // Atividades e tarefas deste negócio ficam sem vínculo (onDelete: SetNull).
  await prisma.negocio.deleteMany({ where: { id } });

  revalidatePath("/negocios");
}
