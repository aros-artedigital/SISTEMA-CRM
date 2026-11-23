// Funções de apoio usadas pelas Server Actions de todas as telas.

export type EstadoFormulario = {
  erro?: string;
  sucesso?: string;
  // O React limpa o formulário depois de cada envio. Quando há erro,
  // devolvemos o que a pessoa digitou para os campos serem preenchidos de novo.
  valores?: Record<string, string>;
};

// Copia os campos de texto do formulário para um objeto simples.
// (Ignora os campos internos do Next.js, que começam com "$".)
export function valoresDoFormulario(formData: FormData): Record<string, string> {
  const valores: Record<string, string> = {};
  for (const [nome, valor] of formData.entries()) {
    if (typeof valor === "string" && !nome.startsWith("$")) {
      valores[nome] = valor;
    }
  }
  return valores;
}

// Resposta padrão de erro: mensagem + valores digitados.
export function respostaDeErro(erro: string, formData: FormData): EstadoFormulario {
  return { erro, valores: valoresDoFormulario(formData) };
}

// Lê um campo do formulário como texto, removendo espaços.
// Retorna null quando o campo vem vazio, para gravar "sem valor" no banco.
export function lerCampo(formData: FormData, nome: string): string | null {
  const valor = formData.get(nome);
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  return limpo === "" ? null : limpo;
}

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
