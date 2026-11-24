// Sessão de login guardada em um cookie.
//
// O cookie contém só o id do usuário, "assinado" com a chave SESSION_SECRET
// (arquivo .env). A assinatura impede que alguém altere o cookie para se
// passar por outro usuário: se o conteúdo mudar, a assinatura deixa de bater.
import "server-only";

import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const NOME_COOKIE = "crm_sessao";
const DURACAO_DIAS = 7;

// Chave que assina o cookie.
// 1. Se SESSION_SECRET existir (como no seu computador), usa ela.
// 2. Senão, deriva uma chave da senha do banco (DATABASE_URL), que o servidor
//    sempre tem. Quem conhecesse a senha do banco já teria acesso a tudo, então
//    isso não enfraquece a segurança. (Trocar a senha do banco desconecta todos.)
function chave(): Uint8Array {
  const segredo = process.env.SESSION_SECRET?.trim();
  if (segredo && segredo.length >= 32) {
    return new TextEncoder().encode(segredo);
  }
  const banco = process.env.DATABASE_URL;
  if (banco) {
    return new Uint8Array(createHmac("sha256", banco).update("crm-sessao-v1").digest());
  }
  throw new Error("Defina SESSION_SECRET (ou DATABASE_URL) no servidor.");
}

type DadosSessao = { usuarioId: string };

// Lê e confere o conteúdo do cookie. Retorna null se for inválido ou vencido.
export async function decifrarSessao(
  token: string | undefined,
): Promise<DadosSessao | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave(), { algorithms: ["HS256"] });
    return typeof payload.usuarioId === "string"
      ? { usuarioId: payload.usuarioId }
      : null;
  } catch {
    return null;
  }
}

export async function criarSessao(usuarioId: string): Promise<void> {
  const expiraEm = new Date(Date.now() + DURACAO_DIAS * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({ usuarioId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiraEm)
    .sign(chave());

  (await cookies()).set(NOME_COOKIE, token, {
    httpOnly: true, // o JavaScript da página não consegue ler o cookie
    secure: process.env.NODE_ENV === "production", // só via https em produção
    sameSite: "lax", // não é enviado em formulários de outros sites
    expires: expiraEm,
    path: "/",
  });
}

export async function lerSessao(): Promise<DadosSessao | null> {
  return decifrarSessao((await cookies()).get(NOME_COOKIE)?.value);
}

export async function apagarSessao(): Promise<void> {
  (await cookies()).delete(NOME_COOKIE);
}

export { NOME_COOKIE };
