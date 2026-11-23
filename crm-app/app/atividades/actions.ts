"use server";

// Atividades: o histórico de interações (ligações, reuniões, e-mails, notas).

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { lerDataHora } from "@/lib/datas";
import { lerCampo, respostaDeErro, type EstadoFormulario } from "@/lib/formulario";
import { validarVinculos } from "@/lib/vinculos";
import { tipoAtividadeValido } from "./tipos";

export async function registrarAtividade(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario();

  const tipo = lerCampo(formData, "tipo");
  const descricao = lerCampo(formData, "descricao");
  const dataTexto = lerCampo(formData, "data");

  if (!tipoAtividadeValido(tipo)) {
    return respostaDeErro("Escolha o tipo da atividade.", formData);
  }
  if (!descricao) {
    return respostaDeErro("Descreva o que aconteceu.", formData);
  }

  // Data em branco = agora.
  const data = dataTexto ? lerDataHora(dataTexto) : new Date();
  if (!data) return respostaDeErro("Data inválida.", formData);

  const vinculos = await validarVinculos(
    lerCampo(formData, "contatoId"),
    lerCampo(formData, "negocioId"),
  );
  if ("erro" in vinculos) return respostaDeErro(vinculos.erro, formData);
  if (!vinculos.contatoId && !vinculos.negocioId) {
    return respostaDeErro("A atividade precisa estar ligada a um contato ou negócio.", formData);
  }

  await prisma.atividade.create({
    data: { tipo, descricao, data, usuarioId: usuario.id, ...vinculos },
  });

  // O histórico aparece em várias páginas (contato, negócio); atualiza todas.
  revalidatePath("/", "layout");
  return { sucesso: "Atividade registrada." };
}

export async function excluirAtividade(id: string): Promise<void> {
  await exigirUsuario();
  await prisma.atividade.deleteMany({ where: { id } });
  revalidatePath("/", "layout");
}
