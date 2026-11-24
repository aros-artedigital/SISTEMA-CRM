// Barra de busca reaproveitada nas listas (contatos, empresas, negócios).
//
// Usa o <Form> do Next.js com `action` em texto: ao enviar, o que foi
// digitado vira parte do endereço (ex.: /contatos?q=maria). Assim a busca
// pode ser salva nos favoritos ou compartilhada, e funciona sem JavaScript.

import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";

const estiloEntrada =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100";

export function BarraBusca({
  caminho,
  busca,
  placeholder,
  filtroAtivo,
  children,
}: {
  caminho: string; // página para onde a busca vai, ex.: "/contatos"
  busca: string; // texto buscado agora (para manter no campo)
  placeholder: string;
  filtroAtivo: boolean; // há busca ou filtro aplicado? (mostra "Limpar")
  children?: ReactNode; // filtros extras (listas de seleção)
}) {
  return (
    <Form action={caminho} className="flex flex-wrap items-center gap-2" role="search">
      <input
        type="search"
        name="q"
        defaultValue={busca}
        placeholder={placeholder}
        aria-label="Buscar"
        className={`${estiloEntrada} min-w-0 flex-1 sm:max-w-sm`}
      />
      {children}
      <button
        type="submit"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Buscar
      </button>
      {filtroAtivo && (
        <Link href={caminho} className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          Limpar
        </Link>
      )}
    </Form>
  );
}

export function SelecaoFiltro({
  nome,
  valor,
  rotulo,
  children,
}: {
  nome: string;
  valor: string;
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <select name={nome} defaultValue={valor} aria-label={rotulo} className={estiloEntrada}>
      {children}
    </select>
  );
}

// Lê um parâmetro de busca da URL como texto simples.
export function parametro(valor: string | string[] | undefined): string {
  return (Array.isArray(valor) ? valor[0] : valor)?.trim() ?? "";
}
