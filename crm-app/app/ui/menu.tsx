// Menu do topo. Só aparece para quem está logado.

import Link from "next/link";
import { usuarioOpcional } from "@/lib/autenticacao";
import { sair } from "@/app/login/actions";

export async function Menu() {
  const usuario = await usuarioOpcional();
  if (!usuario) return null;

  return (
    <>
      <Link href="/negocios" className="hover:underline">
        Negócios
      </Link>
      <Link href="/tarefas" className="hover:underline">
        Tarefas
      </Link>
      <Link href="/contatos" className="hover:underline">
        Contatos
      </Link>
      <Link href="/empresas" className="hover:underline">
        Empresas
      </Link>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-zinc-600 sm:inline dark:text-zinc-400">
          {usuario.nome}
        </span>
        {/* Um formulário com Server Action: funciona até sem JavaScript. */}
        <form action={sair}>
          <button type="submit" className="hover:underline">
            Sair
          </button>
        </form>
      </div>
    </>
  );
}
