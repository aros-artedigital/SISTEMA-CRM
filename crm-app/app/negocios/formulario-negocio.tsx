"use client";

// Formulário de negócio: serve para cadastrar e para editar.

import Link from "next/link";
import { useActionState } from "react";
import type { EstadoFormulario } from "@/lib/formulario";
import { ETAPAS, type EtapaNegocio } from "@/lib/etapas";
import {
  Campo,
  CampoSelecao,
  Mensagens,
  estiloBotaoPrincipal,
  estiloCartao,
} from "@/app/ui/campos";
import { criarNegocio } from "./actions";

type ValoresNegocio = {
  titulo: string;
  valorTexto: string; // ex.: "1500,00"
  etapa: EtapaNegocio;
  contatoId: string | null;
  empresaId: string | null;
};

export type Opcao = { id: string; nome: string };

type AcaoFormulario = (
  estado: EstadoFormulario,
  formData: FormData,
) => Promise<EstadoFormulario>;

const estadoInicial: EstadoFormulario = {};

export function FormularioNegocio({
  contatos,
  empresas,
  negocio,
  acao = criarNegocio,
}: {
  contatos: Opcao[];
  empresas: Opcao[];
  negocio?: ValoresNegocio;
  acao?: AcaoFormulario;
}) {
  const editando = negocio !== undefined;
  const [estado, enviar, salvando] = useActionState(acao, estadoInicial);

  // Em caso de erro, os campos voltam com o que foi digitado.
  const v = estado.valores;

  return (
    <form action={enviar} className={estiloCartao}>
      <h2 className="text-lg font-semibold">
        {editando ? "Editar negócio" : "Novo negócio"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          rotulo="Título *"
          nome="titulo"
          valor={v?.titulo ?? negocio?.titulo}
          placeholder="Ex.: Licença anual do sistema"
          obrigatorio
        />
        <Campo
          rotulo="Valor (R$)"
          nome="valor"
          valor={v?.valor ?? negocio?.valorTexto}
          placeholder="1.500,00"
        />
        <CampoSelecao
          rotulo="Etapa"
          nome="etapa"
          valor={v?.etapa ?? negocio?.etapa ?? "NOVO_LEAD"}
        >
          {ETAPAS.map((etapa) => (
            <option key={etapa.valor} value={etapa.valor}>
              {etapa.nome}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao
          rotulo="Contato"
          nome="contatoId"
          valor={v?.contatoId ?? negocio?.contatoId}
        >
          <option value="">Sem contato</option>
          {contatos.map((contato) => (
            <option key={contato.id} value={contato.id}>
              {contato.nome}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao
          rotulo="Empresa"
          nome="empresaId"
          valor={v?.empresaId ?? negocio?.empresaId}
        >
          <option value="">Sem empresa (ou a do contato)</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome}
            </option>
          ))}
        </CampoSelecao>
      </div>

      <Mensagens erro={estado.erro} sucesso={estado.sucesso} />

      <div className="flex items-center gap-3">
        <button type="submit" disabled={salvando} className={estiloBotaoPrincipal}>
          {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar negócio"}
        </button>
        {editando && (
          <Link
            href="/negocios"
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
