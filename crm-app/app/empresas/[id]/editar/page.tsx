// Página /empresas/[id]/editar

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { atualizarEmpresa } from "../../actions";
import { FormularioEmpresa } from "../../formulario-empresa";

export const metadata = {
  title: "Editar empresa | CRM",
};

export default function PaginaEditarEmpresa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10">
      <Suspense fallback={<p className="text-sm">Carregando empresa...</p>}>
        <EditarEmpresa params={params} />
      </Suspense>
    </main>
  );
}

async function EditarEmpresa({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();
  const { id } = await params;

  const empresa = await prisma.empresa.findUnique({ where: { id } });
  if (!empresa) notFound();

  return (
    <FormularioEmpresa
      empresa={empresa}
      acao={atualizarEmpresa.bind(null, empresa.id)}
    />
  );
}
