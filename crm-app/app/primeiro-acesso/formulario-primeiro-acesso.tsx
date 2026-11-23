"use client";

import { useActionState } from "react";
import type { EstadoFormulario } from "@/lib/formulario";
import { Campo, Mensagens, estiloBotaoPrincipal, estiloCartao } from "@/app/ui/campos";
import { configurarPrimeiroAcesso } from "../login/actions";

const estadoInicial: EstadoFormulario = {};

export function FormularioPrimeiroAcesso() {
  const [estado, enviar, salvando] = useActionState(
    configurarPrimeiroAcesso,
    estadoInicial,
  );
  const v = estado.valores;

  return (
    <form action={enviar} className={estiloCartao}>
      <div>
        <h1 className="text-xl font-semibold">Primeiro acesso</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Crie seu usuário. Você vai usar este e-mail e esta senha para entrar.
        </p>
      </div>
      <Campo rotulo="Seu nome" nome="nome" valor={v?.nome} obrigatorio />
      <Campo rotulo="E-mail" nome="email" tipo="email" valor={v?.email} obrigatorio />
      <Campo rotulo="Senha (mínimo 8 caracteres)" nome="senha" tipo="password" obrigatorio />
      <Campo rotulo="Repita a senha" nome="confirmacao" tipo="password" obrigatorio />
      <Mensagens erro={estado.erro} />
      <button type="submit" disabled={salvando} className={estiloBotaoPrincipal}>
        {salvando ? "Salvando..." : "Criar usuário e entrar"}
      </button>
    </form>
  );
}
