// Quem está usando o sistema agora.
//
// Toda página e toda Server Action que lê ou grava dados chama
// `exigirUsuario()`. Se não houver login válido, a pessoa vai para /login.
// Essa verificação fica perto dos dados de propósito: o proxy.ts também
// confere o login, mas é só um primeiro filtro.
import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lerSessao } from "@/lib/sessao";

export type UsuarioLogado = {
  id: string;
  nome: string;
  email: string;
};

// `cache` evita consultar o banco várias vezes na mesma requisição
// quando vários componentes pedem o usuário.
export const usuarioOpcional = cache(async (): Promise<UsuarioLogado | null> => {
  const sessao = await lerSessao();
  if (!sessao) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.usuarioId },
    // Só os campos necessários. A senha (mesmo cifrada) nunca sai daqui.
    select: { id: true, nome: true, email: true },
  });
  return usuario;
});

export async function exigirUsuario(): Promise<UsuarioLogado> {
  const usuario = await usuarioOpcional();
  if (!usuario) redirect("/login");
  return usuario;
}

// Código de configuração do primeiro acesso.
//
// Num site público, quem abrisse o endereço primeiro poderia criar o
// usuário administrador. Para evitar isso, a tela de primeiro acesso pede
// um código definido na variável CODIGO_PRIMEIRO_ACESSO do servidor.
// - "sim":      o código está definido e será pedido;
// - "faltando": está em produção sem código: a tela fica fechada;
// - "nao":      no seu computador (desenvolvimento), não é pedido.
export function exigenciaCodigoPrimeiroAcesso(): "sim" | "faltando" | "nao" {
  if (process.env.CODIGO_PRIMEIRO_ACESSO) return "sim";
  return process.env.NODE_ENV === "production" ? "faltando" : "nao";
}

// Compara em tempo constante: a resposta não fica mais rápida ou mais lenta
// conforme quantas letras estão certas (isso ajudaria a adivinhar o código).
export function codigoPrimeiroAcessoCorreto(digitado: FormDataEntryValue | null): boolean {
  // trim() nos dois lados: ignora espaços e quebras de linha nas pontas
  // (comuns ao copiar e colar o código ou ao cadastrá-lo no servidor).
  const esperado = process.env.CODIGO_PRIMEIRO_ACESSO?.trim();
  if (!esperado || typeof digitado !== "string") return false;
  const resumo = (texto: string) => createHash("sha256").update(texto).digest();
  return timingSafeEqual(resumo(digitado.trim()), resumo(esperado));
}

// O sistema já foi configurado (alguém já definiu uma senha)?
export async function sistemaConfigurado(): Promise<boolean> {
  const comSenha = await prisma.usuario.count({ where: { senhaHash: { not: "" } } });
  return comSenha > 0;
}
