"use client";

import Link from "next/link";
import { useActionState } from "react";
import { estiloBotaoPrincipal, estiloCartao } from "@/app/ui/campos";
import { importarContatos, type ResultadoImportacao } from "./actions";

const estadoInicial: ResultadoImportacao = {};
const MOSTRAR_IGNORADOS = 15;

export function FormularioImportacao() {
  const [resultado, enviar, importando] = useActionState(importarContatos, estadoInicial);
  const ignorados = resultado.ignorados ?? [];

  return (
    <div className="grid gap-6">
      <form action={enviar} className={estiloCartao}>
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Planilha (.xlsx ou .csv, até 2 MB)</span>
          <input
            type="file"
            name="arquivo"
            accept=".xlsx,.csv"
            required
            className="text-sm file:mr-3 file:rounded-md file:border file:border-zinc-300 file:bg-transparent file:px-3 file:py-1.5 dark:file:border-zinc-700"
          />
        </label>
        <div>
          <button type="submit" disabled={importando} className={estiloBotaoPrincipal}>
            {importando ? "Importando..." : "Importar contatos"}
          </button>
        </div>
      </form>

      {resultado.erro && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {resultado.erro}
        </p>
      )}

      {resultado.criados !== undefined && (
        <section role="status" className={estiloCartao}>
          <h2 className="text-lg font-semibold">Resultado</h2>
          <ul className="grid gap-1 text-sm">
            <li>
              <strong>{resultado.criados}</strong> contato(s) importado(s).
            </li>
            {!!resultado.empresasCriadas && (
              <li>
                <strong>{resultado.empresasCriadas}</strong> empresa(s) nova(s) criada(s).
              </li>
            )}
            {ignorados.length > 0 && (
              <li>
                <strong>{ignorados.length}</strong> linha(s) ignorada(s):
              </li>
            )}
          </ul>
          {ignorados.length > 0 && (
            <ul className="grid gap-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              {ignorados.slice(0, MOSTRAR_IGNORADOS).map((i) => (
                <li key={i.linha}>
                  Linha {i.linha}: {i.motivo}
                </li>
              ))}
              {ignorados.length > MOSTRAR_IGNORADOS && (
                <li>... e mais {ignorados.length - MOSTRAR_IGNORADOS}.</li>
              )}
            </ul>
          )}
          <Link href="/contatos" className="text-sm underline">
            Ver contatos
          </Link>
        </section>
      )}
    </div>
  );
}
