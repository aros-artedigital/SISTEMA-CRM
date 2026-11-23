"use client";

// Componente de cliente: roda no navegador, porque precisa reagir ao envio
// (mostrar "Salvando...", exibir erros e limpar os campos).
//
// O mesmo formulário serve para cadastrar e para editar:
// - Cadastro: sem `contato`, chama `criarContato`.
// - Edição: recebe `contato` (valores atuais) e a ação de atualizar.
//
// A lista de empresas vem pronta do servidor (prop `empresas`), porque
// o navegador não acessa o banco diretamente.

import Link from "next/link";
import { useActionState } from "react";
import type { EstadoFormulario } from "@/lib/formulario";
import {
  Campo,
  CampoSelecao,
  Mensagens,
  estiloBotaoPrincipal,
  estiloCartao,
} from "@/app/ui/campos";
import { criarContato } from "./actions";

type ValoresContato = {
  nome: string;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  empresaId: string | null;
};

export type OpcaoEmpresa = { id: string; nome: string };

type AcaoFormulario = (
  estado: EstadoFormulario,
  formData: FormData,
) => Promise<EstadoFormulario>;

const estadoInicial: EstadoFormulario = {};

export function FormularioContato({
  empresas,
  contato,
  acao = criarContato,
}: {
  empresas: OpcaoEmpresa[];
  contato?: ValoresContato;
  acao?: AcaoFormulario;
}) {
  const editando = contato !== undefined;
  const [estado, enviar, salvando] = useActionState(acao, estadoInicial);

  // O React limpa o formulário a cada envio. Para não perder o que foi
  // digitado quando dá erro, os campos usam primeiro os valores devolvidos
  // pelo servidor (`estado.valores`) e, se não houver, os dados do contato.
  const v = estado.valores;

  return (
    <form action={enviar} className={estiloCartao}>
      <h2 className="text-lg font-semibold">
        {editando ? "Editar contato" : "Novo contato"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome *" nome="nome" valor={v?.nome ?? contato?.nome} obrigatorio />
        <Campo
          rotulo="E-mail"
          nome="email"
          tipo="email"
          valor={v?.email ?? contato?.email}
        />
        <Campo
          rotulo="Telefone"
          nome="telefone"
          tipo="tel"
          valor={v?.telefone ?? contato?.telefone}
        />
        <Campo rotulo="Cargo" nome="cargo" valor={v?.cargo ?? contato?.cargo} />
        <CampoSelecao
          rotulo="Empresa"
          nome="empresaId"
          valor={v?.empresaId ?? contato?.empresaId}
        >
          <option value="">Sem empresa</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome}
            </option>
          ))}
        </CampoSelecao>
      </div>

      {empresas.length === 0 && (
        <p className="text-xs text-zinc-500">
          Nenhuma empresa cadastrada.{" "}
          <Link href="/empresas" className="underline">
            Cadastrar empresa
          </Link>
        </p>
      )}

      <Mensagens erro={estado.erro} sucesso={estado.sucesso} />

      <div className="flex items-center gap-3">
        <button type="submit" disabled={salvando} className={estiloBotaoPrincipal}>
          {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar contato"}
        </button>
        {editando && (
          <Link
            href="/contatos"
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
