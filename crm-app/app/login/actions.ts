"use server";

// Entrar, sair e configurar o primeiro acesso.

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { emailValido, lerCampo, type EstadoFormulario } from "@/lib/formulario";
import { apagarSessao, criarSessao } from "@/lib/sessao";

// Custo do bcrypt: quanto maior, mais lento para quem tenta adivinhar senhas
// (e um pouco mais lento para entrar). 12 é um valor comum hoje.
const CUSTO_BCRYPT = 12;
const SENHA_MINIMA = 8;

// Nas telas de login nunca devolvemos a senha para o navegador,
// só o e-mail (para não precisar digitá-lo de novo).
function erroLogin(erro: string, email: string | null): EstadoFormulario {
  return { erro, valores: { email: email ?? "" } };
}

// Hash de uma senha qualquer, usado quando o e-mail não existe.
// Assim a resposta demora o mesmo tempo com e sem e-mail cadastrado,
// e ninguém descobre quais e-mails existem medindo o tempo.
let hashFalso: Promise<string> | null = null;
function obterHashFalso() {
  hashFalso ??= bcrypt.hash("senha-que-nao-existe", CUSTO_BCRYPT);
  return hashFalso;
}

export async function entrar(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = lerCampo(formData, "email")?.toLowerCase() ?? null;
  const senha = formData.get("senha");

  if (!email || typeof senha !== "string" || senha === "") {
    return erroLogin("Informe e-mail e senha.", email);
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true, senhaHash: true },
  });

  const hash = usuario?.senhaHash || (await obterHashFalso());
  const senhaCorreta = await bcrypt.compare(senha, hash);

  // Mesma mensagem para "e-mail não existe" e "senha errada", de propósito.
  if (!usuario || !usuario.senhaHash || !senhaCorreta) {
    return erroLogin("E-mail ou senha incorretos.", email);
  }

  await criarSessao(usuario.id);
  redirect("/");
}

export async function sair(): Promise<void> {
  await apagarSessao();
  redirect("/login");
}

export async function configurarPrimeiroAcesso(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const nome = lerCampo(formData, "nome");
  const email = lerCampo(formData, "email")?.toLowerCase() ?? null;
  const senha = formData.get("senha");
  const confirmacao = formData.get("confirmacao");

  const devolver = (erro: string): EstadoFormulario => ({
    erro,
    valores: { nome: nome ?? "", email: email ?? "" },
  });

  if (!nome) return devolver("Informe seu nome.");
  if (!email || !emailValido(email)) return devolver("Informe um e-mail válido.");
  if (typeof senha !== "string" || senha.length < SENHA_MINIMA) {
    return devolver(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
  }
  if (senha !== confirmacao) return devolver("As senhas não são iguais.");

  const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);

  // Transação: as operações abaixo acontecem juntas, ou nenhuma acontece.
  // Também evita que duas pessoas configurem o sistema ao mesmo tempo.
  const usuarioId = await prisma.$transaction(async (tx) => {
    if (await tx.usuario.count({ where: { senhaHash: { not: "" } } })) {
      return null; // alguém já configurou
    }

    // Se já existe o usuário padrão (criado antes do login existir),
    // ele é reaproveitado: assim os negócios dele continuam com responsável.
    const existente = await tx.usuario.findFirst({
      where: { senhaHash: "" },
      orderBy: { criadoEm: "asc" },
      select: { id: true },
    });

    const dados = { nome, email, senhaHash, papel: "ADMIN" as const };
    const usuario = existente
      ? await tx.usuario.update({ where: { id: existente.id }, data: dados })
      : await tx.usuario.create({ data: dados });
    return usuario.id;
  });

  if (!usuarioId) {
    // Configurado por outra pessoa enquanto este formulário estava aberto.
    redirect("/login");
  }

  await criarSessao(usuarioId);
  redirect("/");
}
