"use server";

// Server Actions de empresas: cadastrar, editar e excluir.
// Seguem o mesmo padrão de app/contatos/actions.ts.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autenticacao";
import { lerCampo, respostaDeErro, type EstadoFormulario } from "@/lib/formulario";

type DadosEmpresa = {
  nome: string;
  cnpj: string | null;
  site: string | null;
  telefone: string | null;
  endereco: string | null;
};

// Formata 14 dígitos como 00.000.000/0000-00.
function formatarCnpj(digitos: string): string {
  return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function validarEmpresa(
  formData: FormData,
): { dados: DadosEmpresa } | { erro: string } {
  const nome = lerCampo(formData, "nome");
  const cnpjDigitado = lerCampo(formData, "cnpj");
  let site = lerCampo(formData, "site");
  const telefone = lerCampo(formData, "telefone");
  const endereco = lerCampo(formData, "endereco");

  if (!nome) {
    return { erro: "O nome é obrigatório." };
  }

  // Aceita o CNPJ com ou sem pontuação, mas exige 14 dígitos.
  // (Não verifica os dígitos verificadores: fica para uma melhoria futura.)
  let cnpj: string | null = null;
  if (cnpjDigitado) {
    const digitos = cnpjDigitado.replace(/\D/g, "");
    if (digitos.length !== 14) {
      return { erro: "O CNPJ precisa ter 14 dígitos." };
    }
    cnpj = formatarCnpj(digitos);
  }

  // Quem digita "empresa.com.br" quer dizer "https://empresa.com.br".
  if (site && !/^https?:\/\//i.test(site)) {
    site = `https://${site}`;
  }

  return { dados: { nome, cnpj, site, telefone, endereco } };
}

export async function criarEmpresa(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  // Só quem está logado pode gravar (senão, vai para /login).
  await exigirUsuario();

  const resultado = validarEmpresa(formData);
  if ("erro" in resultado) return respostaDeErro(resultado.erro, formData);

  await prisma.empresa.create({ data: resultado.dados });

  revalidatePath("/empresas");
  return { sucesso: `Empresa "${resultado.dados.nome}" cadastrada.` };
}

export async function atualizarEmpresa(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  // Só quem está logado pode gravar (senão, vai para /login).
  await exigirUsuario();

  const resultado = validarEmpresa(formData);
  if ("erro" in resultado) return respostaDeErro(resultado.erro, formData);

  const { count } = await prisma.empresa.updateMany({
    where: { id },
    data: resultado.dados,
  });
  if (count === 0) {
    return respostaDeErro("Esta empresa não existe mais.", formData);
  }

  // O nome da empresa também aparece na lista de contatos.
  revalidatePath("/empresas");
  revalidatePath("/contatos");
  redirect("/empresas");
}

export async function excluirEmpresa(id: string): Promise<void> {
  await exigirUsuario();

  // Os contatos e negócios desta empresa NÃO são apagados:
  // o schema usa onDelete: SetNull, então eles ficam "sem empresa".
  await prisma.empresa.deleteMany({ where: { id } });

  revalidatePath("/empresas");
  revalidatePath("/contatos");
}
