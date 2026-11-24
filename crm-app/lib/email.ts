// Envio de e-mails pelo serviço Resend (https://resend.com).
//
// A chave RESEND_API_KEY é criada automaticamente quando o Resend é
// conectado ao projeto pela Vercel. Sem ela, nada é enviado.
import "server-only";

export function envioDeEmailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// Remetente. Sem domínio próprio, o Resend só permite este endereço de
// teste, e só envia para o e-mail do dono da conta Resend.
const REMETENTE = process.env.EMAIL_REMETENTE || "CRM <onboarding@resend.dev>";

export async function enviarEmail(para: string, assunto: string, html: string): Promise<void> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) throw new Error("RESEND_API_KEY não configurada.");

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chave}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: REMETENTE, to: [para], subject: assunto, html }),
  });

  if (!resposta.ok) {
    // A mensagem do Resend explica o motivo (ex.: destinatário não permitido).
    throw new Error(`Resend recusou o envio (${resposta.status}): ${await resposta.text()}`);
  }
}

// Escapa texto digitado pelo usuário antes de colocá-lo no HTML do e-mail.
export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
