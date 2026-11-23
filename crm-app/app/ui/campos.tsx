// Peças visuais reaproveitadas pelos formulários (contatos, empresas, ...).
// Sem "use client": podem ser usadas tanto no servidor quanto no navegador.

import type { ReactNode } from "react";

const estiloEntrada =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100";

export function Campo({
  rotulo,
  nome,
  tipo = "text",
  valor,
  obrigatorio = false,
  placeholder,
}: {
  rotulo: string;
  nome: string;
  tipo?: string;
  valor?: string | null;
  obrigatorio?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{rotulo}</span>
      <input
        name={nome}
        type={tipo}
        defaultValue={valor ?? ""}
        required={obrigatorio}
        placeholder={placeholder}
        className={estiloEntrada}
      />
    </label>
  );
}

// Caixa de texto com várias linhas.
export function CampoTextoLongo({
  rotulo,
  nome,
  valor,
  obrigatorio = false,
  placeholder,
}: {
  rotulo: string;
  nome: string;
  valor?: string | null;
  obrigatorio?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{rotulo}</span>
      <textarea
        name={nome}
        rows={3}
        defaultValue={valor ?? ""}
        required={obrigatorio}
        placeholder={placeholder}
        className={estiloEntrada}
      />
    </label>
  );
}

export function CampoSelecao({
  rotulo,
  nome,
  valor,
  children,
}: {
  rotulo: string;
  nome: string;
  valor?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{rotulo}</span>
      <select name={nome} defaultValue={valor ?? ""} className={estiloEntrada}>
        {children}
      </select>
    </label>
  );
}

export function Mensagens({ erro, sucesso }: { erro?: string; sucesso?: string }) {
  return (
    <>
      {erro && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {erro}
        </p>
      )}
      {sucesso && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          {sucesso}
        </p>
      )}
    </>
  );
}

export const estiloBotaoPrincipal =
  "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

export const estiloCartao =
  "grid gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900";
