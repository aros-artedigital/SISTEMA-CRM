"use client";

// Formulário de nova tarefa.
// - Dentro de um contato/negócio: o vínculo vai em campos escondidos.
// - Na página /tarefas: recebe `opcoes` e mostra listas para escolher.

import { useActionState } from "react";
import type { EstadoFormulario } from "@/lib/formulario";
import {
  Campo,
  CampoSelecao,
  Mensagens,
  estiloBotaoPrincipal,
} from "@/app/ui/campos";
import { criarTarefa } from "./actions";

type Opcao = { id: string; nome: string };

const estadoInicial: EstadoFormulario = {};

export function FormularioTarefa({
  contatoId,
  negocioId,
  opcoes,
}: {
  contatoId?: string;
  negocioId?: string;
  opcoes?: { contatos: Opcao[]; negocios: Opcao[] };
}) {
  const [estado, enviar, salvando] = useActionState(criarTarefa, estadoInicial);
  const v = estado.valores;

  return (
    <form action={enviar} className="grid gap-3">
      {contatoId && <input type="hidden" name="contatoId" value={contatoId} />}
      {negocioId && <input type="hidden" name="negocioId" value={negocioId} />}

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <Campo
          rotulo="Tarefa *"
          nome="titulo"
          valor={v?.titulo}
          placeholder="Ex.: Enviar proposta"
          obrigatorio
        />
        <Campo rotulo="Prazo" nome="prazo" tipo="date" valor={v?.prazo} />
      </div>

      {opcoes && (
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoSelecao rotulo="Contato" nome="contatoId" valor={v?.contatoId}>
            <option value="">Nenhum</option>
            {opcoes.contatos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </CampoSelecao>
          <CampoSelecao rotulo="Negócio" nome="negocioId" valor={v?.negocioId}>
            <option value="">Nenhum</option>
            {opcoes.negocios.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nome}
              </option>
            ))}
          </CampoSelecao>
        </div>
      )}

      <Mensagens erro={estado.erro} sucesso={estado.sucesso} />

      <div>
        <button type="submit" disabled={salvando} className={estiloBotaoPrincipal}>
          {salvando ? "Salvando..." : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}
