// Datas: leitura do que vem dos formulários e formatação em português.
//
// Todas as datas usam o horário de Brasília, mesmo quando o servidor está
// em outro fuso (o da Vercel usa UTC, 3 horas à frente). Sem isso, depois das
// 21h o site online já acharia que é "amanhã".
//
// O Brasil não tem horário de verão desde 2019, então Brasília é sempre UTC-3.

export const FUSO = "America/Sao_Paulo";
const DESLOCAMENTO = "-03:00";

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: FUSO,
});
const formatoData = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: FUSO });
const formatoPartes = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: FUSO,
});

// 2026-11-23 14:30 → "23/11/2026, 14:30"
export function formatarDataHora(data: Date): string {
  return formatoDataHora.format(data);
}

// 2026-11-23 → "23/11/2026"
export function formatarData(data: Date): string {
  return formatoData.format(data);
}

// Ano, mês (1 a 12) e dia de uma data, no horário de Brasília.
export function partesData(data: Date): { ano: number; mes: number; dia: number } {
  const [ano, mes, dia] = formatoPartes.format(data).split("-").map(Number);
  return { ano, mes, dia };
}

const doisDigitos = (n: number) => String(n).padStart(2, "0");

// Meia-noite (em Brasília) de um dia do calendário.
export function meiaNoite(ano: number, mes: number, dia: number): Date {
  // Date.UTC normaliza meses/dias fora do intervalo (ex.: mês 0 = dezembro anterior).
  const normalizada = new Date(Date.UTC(ano, mes - 1, dia));
  return new Date(
    `${normalizada.getUTCFullYear()}-${doisDigitos(normalizada.getUTCMonth() + 1)}-${doisDigitos(normalizada.getUTCDate())}T00:00:00${DESLOCAMENTO}`,
  );
}

// Campo <input type="datetime-local">: "2026-11-23T14:30" (horário de Brasília).
export function lerDataHora(texto: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(texto)) return null;
  const data = new Date(`${texto}:00${DESLOCAMENTO}`);
  return Number.isNaN(data.getTime()) ? null : data;
}

// Campo <input type="date">: "2026-11-23". Guarda a meia-noite de Brasília.
export function lerData(texto: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  const data = new Date(`${texto}T00:00:00${DESLOCAMENTO}`);
  return Number.isNaN(data.getTime()) ? null : data;
}

// Date → "2026-11-23", para preencher um <input type="date">.
export function paraCampoData(data: Date): string {
  const { ano, mes, dia } = partesData(data);
  return `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`;
}

// Início do dia (meia-noite em Brasília) da data informada.
export function inicioDoDia(data: Date): Date {
  const { ano, mes, dia } = partesData(data);
  return meiaNoite(ano, mes, dia);
}

export function somarDias(data: Date, dias: number): Date {
  return new Date(data.getTime() + dias * 24 * 60 * 60 * 1000);
}
