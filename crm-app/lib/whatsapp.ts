// Links para abrir conversas no WhatsApp (sem precisar de conta de API).
//
// O endereço https://wa.me/NUMERO abre a conversa no WhatsApp Web ou no
// aplicativo do celular. O número precisa estar no formato internacional,
// só com dígitos: 55 (Brasil) + DDD + número. Ex.: 5571999991111.

export function numeroWhatsApp(telefone: string | null | undefined): string | null {
  if (!telefone) return null;
  let digitos = telefone.replace(/\D/g, "");
  digitos = digitos.replace(/^0+/, ""); // tira o 0 de "0 71 9999-..."

  // Número brasileiro sem o 55: DDD (2) + 8 ou 9 dígitos.
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  // Já com o código do país (55 + 10 ou 11 dígitos).
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) return digitos;
  return null; // não parece um celular/telefone válido
}

export function linkWhatsApp(telefone: string | null | undefined, mensagem?: string): string | null {
  const numero = numeroWhatsApp(telefone);
  if (!numero) return null;
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${numero}${texto}`;
}
