// Leitura de planilhas (.xlsx e .csv) para importar contatos.
import "server-only";

import { readSheet } from "read-excel-file/node";

export type LinhaPlanilha = Record<string, string>;

// Colunas reconhecidas e os nomes que aceitamos para cada uma.
// A comparação ignora maiúsculas, acentos e espaços extras.
const APELIDOS: Record<string, string[]> = {
  nome: ["nome", "nome completo", "name", "contato", "cliente"],
  email: ["email", "e-mail", "e mail", "mail"],
  telefone: ["telefone", "fone", "celular", "whatsapp", "telefone celular", "phone", "tel"],
  cargo: ["cargo", "funcao", "função", "title", "posicao"],
  empresa: ["empresa", "company", "organizacao", "organização", "razao social"],
};

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Descobre a qual campo cada coluna do cabeçalho corresponde.
function mapearCabecalho(cabecalho: string[]): (string | null)[] {
  return cabecalho.map((titulo) => {
    const t = normalizar(titulo);
    for (const [campo, nomes] of Object.entries(APELIDOS)) {
      if (nomes.some((n) => normalizar(n) === t)) return campo;
    }
    return null; // coluna desconhecida: ignorada
  });
}

// Converte uma célula qualquer (texto, número, data) em texto.
function celulaParaTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  // Telefones salvos como número no Excel (ex.: 11999990000) viram texto.
  if (typeof valor === "number") return String(valor);
  return String(valor).trim();
}

// Leitor de CSV: aceita ";" (padrão do Excel no Brasil) ou ",", campos entre
// aspas (que podem conter o separador e quebras de linha) e aspas duplicadas ("").
export function lerCsv(texto: string): string[][] {
  const conteudo = texto.replace(/^﻿/, ""); // remove marca de início do Excel
  const primeiraLinha = conteudo.split(/\r?\n/, 1)[0] ?? "";
  const separador =
    (primeiraLinha.match(/;/g)?.length ?? 0) >= (primeiraLinha.match(/,/g)?.length ?? 0) ? ";" : ",";

  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let entreAspas = false;

  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];
    if (entreAspas) {
      if (c === '"' && conteudo[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        entreAspas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreAspas = true;
    } else if (c === separador) {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && conteudo[i + 1] === "\n") i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  if (campo !== "" || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }
  // Descarta linhas totalmente vazias.
  return linhas.filter((l) => l.some((v) => v.trim() !== ""));
}

export class ErroPlanilha extends Error {}

// Lê o arquivo enviado e devolve uma lista de linhas { nome, email, ... }.
export async function lerPlanilha(arquivo: File): Promise<LinhaPlanilha[]> {
  const nome = arquivo.name.toLowerCase();
  const bytes = Buffer.from(await arquivo.arrayBuffer());

  let tabela: string[][];
  if (nome.endsWith(".csv")) {
    // Tenta UTF-8; se aparecerem caracteres inválidos, o arquivo veio no
    // formato antigo do Excel (Windows-1252), comum no Brasil.
    let texto = new TextDecoder("utf-8").decode(bytes);
    if (texto.includes("�")) texto = new TextDecoder("windows-1252").decode(bytes);
    tabela = lerCsv(texto);
  } else if (nome.endsWith(".xlsx")) {
    try {
      const dados = await readSheet(bytes);
      tabela = dados.map((linha) => linha.map(celulaParaTexto));
    } catch {
      throw new ErroPlanilha("Não foi possível ler o arquivo .xlsx. Ele está corrompido?");
    }
  } else {
    throw new ErroPlanilha("Envie um arquivo .xlsx (Excel) ou .csv.");
  }

  if (tabela.length < 2) {
    throw new ErroPlanilha("A planilha precisa de um cabeçalho e pelo menos uma linha de dados.");
  }

  const campos = mapearCabecalho(tabela[0].map((t) => celulaParaTexto(t)));
  if (!campos.includes("nome")) {
    throw new ErroPlanilha('Não encontrei a coluna "Nome" no cabeçalho (primeira linha).');
  }

  return tabela.slice(1).map((linha) => {
    const registro: LinhaPlanilha = {};
    campos.forEach((campo, i) => {
      if (campo) registro[campo] = celulaParaTexto(linha[i]);
    });
    return registro;
  });
}
