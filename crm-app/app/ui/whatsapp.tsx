// Link que abre a conversa do contato no WhatsApp (Web ou aplicativo).
// Só aparece se o telefone parecer um número válido.

import { linkWhatsApp } from "@/lib/whatsapp";

export function LinkWhatsApp({
  telefone,
  nome,
  variante = "compacto",
}: {
  telefone: string | null;
  nome: string;
  variante?: "compacto" | "botao";
}) {
  const href = linkWhatsApp(telefone);
  if (!href) return null;

  const estilo =
    variante === "botao"
      ? "inline-flex items-center gap-1.5 rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
      : "text-xs font-medium text-green-700 hover:underline dark:text-green-400";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir conversa com ${nome} no WhatsApp (abre em nova aba)`}
      className={estilo}
    >
      <span aria-hidden>💬</span> WhatsApp
    </a>
  );
}
