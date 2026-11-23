"use client";

import { useActionState } from "react";
import type { EstadoFormulario } from "@/lib/formulario";
import { Campo, Mensagens, estiloBotaoPrincipal, estiloCartao } from "@/app/ui/campos";
import { entrar } from "./actions";

const estadoInicial: EstadoFormulario = {};

export function FormularioLogin() {
  const [estado, enviar, entrando] = useActionState(entrar, estadoInicial);

  return (
    <form action={enviar} className={estiloCartao}>
      <h1 className="text-xl font-semibold">Entrar no CRM</h1>
      <Campo
        rotulo="E-mail"
        nome="email"
        tipo="email"
        valor={estado.valores?.email}
        obrigatorio
      />
      <Campo rotulo="Senha" nome="senha" tipo="password" obrigatorio />
      <Mensagens erro={estado.erro} />
      <button type="submit" disabled={entrando} className={estiloBotaoPrincipal}>
        {entrando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
