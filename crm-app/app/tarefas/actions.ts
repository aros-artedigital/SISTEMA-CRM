"use server";

// Tarefas: lembretes com prazo (ex.: "Enviar proposta até sexta").

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { lerData } from "@/lib/datas";
import { lerCampo, respostaDeErro, type EstadoFormulario } from "@/lib/formulario";
import { validarVinculos } from "@/lib/vinculos";

export async function criarTarefa(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario();

  const titulo = lerCampo(formData, "titulo");
  const prazoTexto = lerCampo(formData, "prazo");

  if (!titulo) return respostaDeErro("Descreva a tarefa.", formData);

  // Prazo é opcional.
  const prazo = prazoTexto ? lerData(prazoTexto) : null;
  if (prazoTexto && !prazo) return respostaDeErro("Prazo inválido.", formData);

  const vinculos = await validarVinculos(
    lerCampo(formData, "contatoId"),
    lerCampo(formData, "negocioId"),
  );
  if ("erro" in vinculos) return respostaDeErro(vinculos.erro, formData);

  await prisma.tarefa.create({
    data: { titulo, prazo, responsavelId: usuario.id, ...vinculos },
  });

  // Tarefas aparecem em várias páginas (início, tarefas, contato, negócio).
  revalidatePath("/", "layout");
  return { sucesso: "Tarefa criada." };
}

// Marca ou desmarca como concluída.
export async function marcarTarefa(id: string, concluida: boolean): Promise<void> {
  await exigirUsuario();
  // O valor vem do navegador: garante que é mesmo true/false.
  await prisma.tarefa.updateMany({ where: { id }, data: { concluida: concluida === true } });
  revalidatePath("/", "layout");
}

export async function excluirTarefa(id: string): Promise<void> {
  await exigirUsuario();
  await prisma.tarefa.deleteMany({ where: { id } });
  revalidatePath("/", "layout");
}
