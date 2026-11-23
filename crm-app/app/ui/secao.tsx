// Caixa com título, usada nas páginas de detalhe (contato, negócio).

import type { ReactNode } from "react";
import { estiloCartao } from "./campos";

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className={estiloCartao}>
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

// Linha "rótulo: valor" para a ficha de dados.
export function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-zinc-600 dark:text-zinc-400">{rotulo}</dt>
      <dd className="text-sm">{children ?? "—"}</dd>
    </div>
  );
}
