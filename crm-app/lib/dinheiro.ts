// Conversões de valores em reais.

const formatador = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// 1500.5 → "R$ 1.500,50"
export function formatarReais(valor: number): string {
  return formatador.format(valor);
}

// Converte o que a pessoa digitou em número.
// Aceita "1500", "1500,50", "1.500,50", "R$ 1.500,50" e "1500.50".
// Retorna null se não for um número válido.
export function lerReais(texto: string): number | null {
  let limpo = texto.replace(/R\$|\s/g, "");
  if (limpo === "") return null;

  if (limpo.includes(",")) {
    // Formato brasileiro: ponto separa milhar, vírgula separa centavos.
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    // "1.500" ou "1.500.000": pontos só como separador de milhar.
    limpo = limpo.replace(/\./g, "");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}
