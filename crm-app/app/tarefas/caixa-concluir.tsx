"use client";

// Caixinha de "concluída". Marca na hora (atualização otimista) e grava no
// servidor em seguida. Se a gravação falhar, a caixinha volta sozinha.

import { useOptimistic, useTransition } from "react";
import { marcarTarefa } from "./actions";

export function CaixaConcluir({
  id,
  titulo,
  concluida,
}: {
  id: string;
  titulo: string;
  concluida: boolean;
}) {
  const [, iniciar] = useTransition();
  const [marcada, setMarcada] = useOptimistic(concluida);

  return (
    <input
      type="checkbox"
      checked={marcada}
      aria-label={`Concluir "${titulo}"`}
      onChange={(e) => {
        const novo = e.target.checked;
        iniciar(async () => {
          setMarcada(novo);
          await marcarTarefa(id, novo);
        });
      }}
      className="size-4 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
    />
  );
}
