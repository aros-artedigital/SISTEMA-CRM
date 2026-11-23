// Página /negocios/[id]/editar

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { atualizarNegocio } from "../../actions";
import { buscarOpcoes } from "../../dados";
import { FormularioNegocio } from "../../formulario-negocio";

export const metadata = {
  title: "Editar negócio | CRM",
};

export default function PaginaEditarNegocio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10">
      <Suspense fallback={<p className="text-sm">Carregando negócio...</p>}>
        <EditarNegocio params={params} />
      </Suspense>
    </main>
  );
}

async function EditarNegocio({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();
  const { id } = await params;

  const [negocio, { contatos, empresas }] = await Promise.all([
    prisma.negocio.findUnique({ where: { id } }),
    buscarOpcoes(),
  ]);
  if (!negocio) notFound();

  return (
    <FormularioNegocio
      contatos={contatos}
      empresas={empresas}
      negocio={{
        titulo: negocio.titulo,
        // Decimal → texto no formato brasileiro, ex.: "1500,00".
        valorTexto: negocio.valor.toFixed(2).replace(".", ","),
        etapa: negocio.etapa,
        contatoId: negocio.contatoId,
        empresaId: negocio.empresaId,
      }}
      acao={atualizarNegocio.bind(null, negocio.id)}
    />
  );
}
