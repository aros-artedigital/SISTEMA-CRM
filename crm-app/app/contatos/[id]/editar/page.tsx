// Página /contatos/[id]/editar
//
// A pasta [id] entre colchetes é uma "rota dinâmica": o trecho da URL
// nessa posição vira o parâmetro `id`. Ex.: /contatos/abc123/editar → id = "abc123".

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { atualizarContato } from "../../actions";
import { FormularioContato } from "../../formulario-contato";

export const metadata = {
  title: "Editar contato | CRM",
};

export default function PaginaEditarContato({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-10">
      <Suspense fallback={<p className="text-sm">Carregando contato...</p>}>
        <EditarContato params={params} />
      </Suspense>
    </main>
  );
}

async function EditarContato({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();
  const { id } = await params;

  // Promise.all faz as duas consultas ao mesmo tempo, em vez de uma depois da outra.
  const [contato, empresas] = await Promise.all([
    prisma.contato.findUnique({ where: { id } }),
    prisma.empresa.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  // Se o id não existir, mostra a página padrão de "não encontrado" (404).
  if (!contato) notFound();

  // `.bind(null, id)` cria uma nova função com o id já preenchido.
  // O formulário só precisa enviar os campos digitados.
  const acao = atualizarContato.bind(null, contato.id);

  return <FormularioContato empresas={empresas} contato={contato} acao={acao} />;
}
