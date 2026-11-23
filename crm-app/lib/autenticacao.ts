// Quem está usando o sistema agora.
//
// Toda página e toda Server Action que lê ou grava dados chama
// `exigirUsuario()`. Se não houver login válido, a pessoa vai para /login.
// Essa verificação fica perto dos dados de propósito: o proxy.ts também
// confere o login, mas é só um primeiro filtro.
import "server-only";

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

// O sistema já foi configurado (alguém já definiu uma senha)?
export async function sistemaConfigurado(): Promise<boolean> {
  const comSenha = await prisma.usuario.count({ where: { senhaHash: { not: "" } } });
  return comSenha > 0;
}
