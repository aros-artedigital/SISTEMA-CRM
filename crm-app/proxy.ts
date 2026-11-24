// Proxy: roda antes de cada página.
//
// Faz uma checagem rápida, só pelo cookie (sem consultar o banco):
// sem login → manda para /login.
//
// Atenção: o proxy NÃO manda quem tem cookie para fora do /login. Um cookie
// pode ter assinatura válida mas apontar para um usuário que não existe mais
// (ex.: usuário excluído). Se o proxy mandasse esse caso de /login para /,
// e a página mandasse de / para /login, a tela ficaria num vaivém sem fim.
// Quem decide isso é a própria página de login, que consulta o banco.
//
// É só um primeiro filtro. A proteção de verdade está em cada página e
// Server Action, que chamam exigirUsuario() (lib/autenticacao.ts).

import { NextResponse, type NextRequest } from "next/server";
import { NOME_COOKIE, decifrarSessao } from "@/lib/sessao";

// /api/lembretes é chamado pela Vercel (sem login) e tem proteção própria:
// CRON_SECRET + no máximo um e-mail por usuário por dia.
const ROTAS_PUBLICAS = ["/login", "/primeiro-acesso", "/api/lembretes"];

export default async function proxy(req: NextRequest) {
  const caminho = req.nextUrl.pathname;
  const publica = ROTAS_PUBLICAS.includes(caminho);
  const sessao = await decifrarSessao(req.cookies.get(NOME_COOKIE)?.value);

  if (!publica && !sessao) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  return NextResponse.next();
}

// Arquivos estáticos (imagens, CSS, JS do Next) não passam pelo proxy.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|ico)$).*)"],
};
