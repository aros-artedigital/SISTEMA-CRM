// Datas: leitura do que vem dos formulários e formatação em português.
//
// Observação: as datas são interpretadas no fuso horário do computador que
// roda o servidor. Para uso local isso é o esperado. Se um dia o sistema for
// para um servidor em outro fuso, será preciso fixar o fuso aqui.

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});
const formatoData = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

// 2026-11-23 14:30 → "23/11/2026, 14:30"
export function formatarDataHora(data: Date): string {
  return formatoDataHora.format(data);
}

// 2026-11-23 → "23/11/2026"
export function formatarData(data: Date): string {
  return formatoData.format(data);
}

// Campo <input type="datetime-local">: "2026-11-23T14:30".
export function lerDataHora(texto: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(texto)) return null;
  const data = new Date(texto); // sem fuso no texto = horário local
  return Number.isNaN(data.getTime()) ? null : data;
}

// Campo <input type="date">: "2026-11-23". Guarda o início do dia.
export function lerData(texto: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  const data = new Date(`${texto}T00:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}

// Date → "2026-11-23", para preencher um <input type="date">.
export function paraCampoData(data: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}

export function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function somarDias(data: Date, dias: number): Date {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}
