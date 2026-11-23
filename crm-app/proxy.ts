// Proxy: roda antes de cada página.
//
// Faz uma checagem rápida, só pelo cookie (sem consultar o banco):
// - sem login → manda para /login;
// - já logado e abrindo /login → manda para a página inicial.
//
// É só um primeiro filtro. A proteção de verdade está em cada página e
// Server Action, que chamam exigirUsuario() (lib/autenticacao.ts).

import { NextResponse, type NextRequest } from "next/server";
import { NOME_COOKIE, decifrarSessao } from "@/lib/sessao";

const ROTAS_PUBLICAS = ["/login", "/primeiro-acesso"];

export default async function proxy(req: NextRequest) {
  const caminho = req.nextUrl.pathname;
  const publica = ROTAS_PUBLICAS.includes(caminho);
  const sessao = await decifrarSessao(req.cookies.get(NOME_COOKIE)?.value);

  if (!publica && !sessao) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (caminho === "/login" && sessao) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

// Arquivos estáticos (imagens, CSS, JS do Next) não passam pelo proxy.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|ico)$).*)"],
};
