"use client";

// Botão de excluir com confirmação, usado em qualquer tabela.
// Precisa rodar no navegador para mostrar a caixa "Tem certeza?".
//
// `acao` é uma Server Action com o id já amarrado (via .bind), por exemplo:
// <BotaoExcluir acao={excluirContato.bind(null, contato.id)} mensagem="..." />

import { useTransition } from "react";

export function BotaoExcluir({
  acao,
  mensagem,
}: {
  acao: () => Promise<void>;
  mensagem: string;
}) {
  const [excluindo, iniciar] = useTransition();

  function aoClicar() {
    if (!window.confirm(mensagem)) return;
    iniciar(() => acao());
  }

  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={excluindo}
      className="text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
    >
      {excluindo ? "Excluindo..." : "Excluir"}
    </button>
  );
}
