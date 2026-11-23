"use client";

// Formulário para registrar uma atividade num contato ou num negócio.
// O vínculo (contatoId/negocioId) vai em campos escondidos.

import { useActionState } from "react";
import type { EstadoFormulario } from "@/lib/formulario";
import {
  Campo,
  CampoSelecao,
  CampoTextoLongo,
  Mensagens,
  estiloBotaoPrincipal,
} from "@/app/ui/campos";
import { registrarAtividade } from "./actions";
import { TIPOS_ATIVIDADE } from "./tipos";

const estadoInicial: EstadoFormulario = {};

export function FormularioAtividade({
  contatoId,
  negocioId,
}: {
  contatoId?: string;
  negocioId?: string;
}) {
  const [estado, enviar, salvando] = useActionState(registrarAtividade, estadoInicial);
  const v = estado.valores;

  return (
    <form action={enviar} className="grid gap-3">
      {contatoId && <input type="hidden" name="contatoId" value={contatoId} />}
      {negocioId && <input type="hidden" name="negocioId" value={negocioId} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <CampoSelecao rotulo="Tipo" nome="tipo" valor={v?.tipo ?? "LIGACAO"}>
          {TIPOS_ATIVIDADE.map((tipo) => (
            <option key={tipo.valor} value={tipo.valor}>
              {tipo.icone} {tipo.nome}
            </option>
          ))}
        </CampoSelecao>
        <Campo
          rotulo="Quando (em branco = agora)"
          nome="data"
          tipo="datetime-local"
          valor={v?.data}
        />
      </div>
      <CampoTextoLongo
        rotulo="O que aconteceu? *"
        nome="descricao"
        valor={v?.descricao}
        placeholder="Ex.: Liguei, pediu proposta até sexta."
        obrigatorio
      />

      <Mensagens erro={estado.erro} sucesso={estado.sucesso} />

      <div>
        <button type="submit" disabled={salvando} className={estiloBotaoPrincipal}>
          {salvando ? "Salvando..." : "Registrar atividade"}
        </button>
      </div>
    </form>
  );
}
