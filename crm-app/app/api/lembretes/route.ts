// Endereço /api/lembretes: envia por e-mail as tarefas atrasadas e do dia.
//
// A Vercel chama este endereço sozinha, todo dia às 7h (Brasília), conforme
// o "crons" do arquivo vercel.json.
//
// Segurança:
// - Se CRON_SECRET estiver definida, só aceita chamadas com essa chave
//   (a Vercel envia automaticamente no cabeçalho Authorization).
// - De qualquer forma, cada usuário recebe no máximo UM e-mail por dia
//   (tabela LembreteEnviado), então chamadas repetidas não geram spam.

import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatarData, inicioDoDia, paraCampoData, somarDias } from "@/lib/datas";
import { enviarEmail, envioDeEmailConfigurado, escaparHtml } from "@/lib/email";

function enderecoDoSite(): string {
  const dominio = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return dominio ? `https://${dominio}` : "http://localhost:3000";
}

export async function GET(request: Request) {
  // Obrigatório: diz ao Next.js que esta rota roda a cada chamada.
  // Sem isso, ela seria executada uma única vez durante o build (e enviaria
  // e-mails na hora da publicação), com o resultado congelado depois.
  await connection();

  const segredo = process.env.CRON_SECRET;
  if (segredo && request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return Response.json({ erro: "Não autorizado" }, { status: 401 });
  }

  if (!envioDeEmailConfigurado()) {
    return Response.json({ enviados: 0, aviso: "Envio de e-mail não configurado (RESEND_API_KEY)." });
  }

  const agora = new Date();
  const hoje = inicioDoDia(agora);
  const amanha = somarDias(hoje, 1);
  const dia = paraCampoData(agora);

  const usuarios = await prisma.usuario.findMany({
    where: { senhaHash: { not: "" } },
    select: { id: true, nome: true, email: true },
  });

  const resultado: { usuario: string; situacao: string }[] = [];

  for (const usuario of usuarios) {
    const tarefas = await prisma.tarefa.findMany({
      where: { responsavelId: usuario.id, concluida: false, prazo: { lt: amanha } },
      orderBy: { prazo: "asc" },
      include: {
        contato: { select: { nome: true } },
        negocio: { select: { titulo: true } },
      },
    });
    if (tarefas.length === 0) {
      resultado.push({ usuario: usuario.id, situacao: "sem tarefas" });
      continue;
    }

    // Marca o envio ANTES de enviar: se outra chamada chegar ao mesmo tempo,
    // a restrição @@unique([usuarioId, dia]) impede o segundo e-mail.
    try {
      await prisma.lembreteEnviado.create({ data: { usuarioId: usuario.id, dia } });
    } catch {
      resultado.push({ usuario: usuario.id, situacao: "já enviado hoje" });
      continue;
    }

    const atrasadas = tarefas.filter((t) => t.prazo! < hoje);
    const deHoje = tarefas.filter((t) => t.prazo! >= hoje);

    const item = (t: (typeof tarefas)[number]) => {
      const extras = [t.contato?.nome, t.negocio?.titulo].filter(Boolean).map((x) => escaparHtml(x!));
      return `<li><strong>${escaparHtml(t.titulo)}</strong> — ${formatarData(t.prazo!)}${
        extras.length ? ` <span style="color:#666">(${extras.join(" · ")})</span>` : ""
      }</li>`;
    };

    const html = `
      <div style="font-family:system-ui,Segoe UI,sans-serif;font-size:15px;line-height:1.5">
        <p>Bom dia, ${escaparHtml(usuario.nome)}!</p>
        ${atrasadas.length ? `<p><strong style="color:#b42828">Atrasadas (${atrasadas.length})</strong></p><ul>${atrasadas.map(item).join("")}</ul>` : ""}
        ${deHoje.length ? `<p><strong>Para hoje (${deHoje.length})</strong></p><ul>${deHoje.map(item).join("")}</ul>` : ""}
        <p><a href="${enderecoDoSite()}/tarefas">Abrir as tarefas no CRM</a></p>
      </div>`;

    try {
      await enviarEmail(
        usuario.email,
        `CRM: ${tarefas.length} tarefa(s) para hoje${atrasadas.length ? " e atrasadas" : ""}`,
        html,
      );
      resultado.push({ usuario: usuario.id, situacao: "enviado" });
    } catch (erro) {
      // Falhou: apaga a marcação para que a próxima chamada tente de novo.
      await prisma.lembreteEnviado.deleteMany({ where: { usuarioId: usuario.id, dia } });
      console.error("Falha ao enviar lembrete:", erro);
      resultado.push({ usuario: usuario.id, situacao: "falhou" });
    }
  }

  return Response.json({
    enviados: resultado.filter((r) => r.situacao === "enviado").length,
    resultado,
  });
}
