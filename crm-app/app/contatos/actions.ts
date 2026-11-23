"use server";

// Server Actions: funções que rodam no servidor e são chamadas pelos formulários.
// O navegador envia os dados, e estas funções gravam no banco.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import {
  emailValido,
  lerCampo,
  respostaDeErro,
  type EstadoFormulario,
} from "@/lib/formulario";

type DadosContato = {
  nome: string;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  empresaId: string | null;
};

// Lê e valida os campos do contato. Usada tanto no cadastro quanto na edição,
// para as regras ficarem num lugar só.
// O servidor sempre valida, mesmo que a tela já valide,
// porque qualquer pessoa pode enviar dados direto para estas funções.
async function validarContato(
  formData: FormData,
): Promise<{ dados: DadosContato } | { erro: string }> {
  const nome = lerCampo(formData, "nome");
  const email = lerCampo(formData, "email");
  const telefone = lerCampo(formData, "telefone");
  const cargo = lerCampo(formData, "cargo");
  const empresaId = lerCampo(formData, "empresaId");

  if (!nome) {
    return { erro: "O nome é obrigatório." };
  }
  if (email && !emailValido(email)) {
    return { erro: "E-mail inválido." };
  }
  // A empresa escolhida pode ter sido excluída enquanto o formulário estava aberto.
  if (empresaId) {
    const existe = await prisma.empresa.count({ where: { id: empresaId } });
    if (!existe) {
      return { erro: "A empresa escolhida não existe mais. Recarregue a página." };
    }
  }

  return { dados: { nome, email, telefone, cargo, empresaId } };
}

export async function criarContato(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  // Só quem está logado pode gravar (senão, vai para /login).
  await exigirUsuario();

  const resultado = await validarContato(formData);
  if ("erro" in resultado) return respostaDeErro(resultado.erro, formData);

  await prisma.contato.create({ data: resultado.dados });

  // Avisa o Next.js que as listas mudaram e precisam ser recarregadas.
  // (A lista de empresas mostra quantos contatos cada uma tem.)
  revalidatePath("/contatos");
  revalidatePath("/empresas");

  return { sucesso: `Contato "${resultado.dados.nome}" cadastrado.` };
}

// O `id` vem primeiro porque a página "amarra" o id à função com `.bind`.
// Assim o formulário só precisa enviar os campos.
export async function atualizarContato(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  // Só quem está logado pode gravar (senão, vai para /login).
  await exigirUsuario();

  const resultado = await validarContato(formData);
  if ("erro" in resultado) return respostaDeErro(resultado.erro, formData);

  // updateMany não dá erro se o contato tiver sido excluído nesse meio tempo;
  // ele só informa quantos registros mudou.
  const { count } = await prisma.contato.updateMany({
    where: { id },
    data: resultado.dados,
  });
  if (count === 0) {
    return respostaDeErro("Este contato não existe mais.", formData);
  }

  revalidatePath("/contatos");
  revalidatePath("/empresas");
  // redirect encerra a função aqui e leva o usuário de volta para a lista.
  redirect("/contatos");
}

export async function excluirContato(id: string): Promise<void> {
  await exigirUsuario();

  // Negócios, atividades e tarefas ligados a este contato NÃO são apagados:
  // o schema usa onDelete: SetNull, então eles só perdem o vínculo.
  await prisma.contato.deleteMany({ where: { id } });

  revalidatePath("/contatos");
  revalidatePath("/empresas");
}
