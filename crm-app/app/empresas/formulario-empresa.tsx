"use client";

// Formulário de empresa: serve para cadastrar e para editar,
// igual ao formulário de contatos.

import Link from "next/link";
import { useActionState } from "react";
import type { EstadoFormulario } from "@/lib/formulario";
import {
  Campo,
  Mensagens,
  estiloBotaoPrincipal,
  estiloCartao,
} from "@/app/ui/campos";
import { criarEmpresa } from "./actions";

type ValoresEmpresa = {
  nome: string;
  cnpj: string | null;
  site: string | null;
  telefone: string | null;
  endereco: string | null;
};

type AcaoFormulario = (
  estado: EstadoFormulario,
  formData: FormData,
) => Promise<EstadoFormulario>;

const estadoInicial: EstadoFormulario = {};

export function FormularioEmpresa({
  empresa,
  acao = criarEmpresa,
}: {
  empresa?: ValoresEmpresa;
  acao?: AcaoFormulario;
}) {
  const editando = empresa !== undefined;
  const [estado, enviar, salvando] = useActionState(acao, estadoInicial);

  // Mesmo cuidado do formulário de contatos: em caso de erro, os campos
  // voltam com o que foi digitado (`estado.valores`).
  const v = estado.valores;

  return (
    <form action={enviar} className={estiloCartao}>
      <h2 className="text-lg font-semibold">
        {editando ? "Editar empresa" : "Nova empresa"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome *" nome="nome" valor={v?.nome ?? empresa?.nome} obrigatorio />
        <Campo
          rotulo="CNPJ"
          nome="cnpj"
          valor={v?.cnpj ?? empresa?.cnpj}
          placeholder="00.000.000/0000-00"
        />
        <Campo
          rotulo="Site"
          nome="site"
          valor={v?.site ?? empresa?.site}
          placeholder="empresa.com.br"
        />
        <Campo
          rotulo="Telefone"
          nome="telefone"
          tipo="tel"
          valor={v?.telefone ?? empresa?.telefone}
        />
        <div className="sm:col-span-2">
          <Campo
            rotulo="Endereço"
            nome="endereco"
            valor={v?.endereco ?? empresa?.endereco}
          />
        </div>
      </div>

      <Mensagens erro={estado.erro} sucesso={estado.sucesso} />

      <div className="flex items-center gap-3">
        <button type="submit" disabled={salvando} className={estiloBotaoPrincipal}>
          {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar empresa"}
        </button>
        {editando && (
          <Link
            href="/empresas"
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
