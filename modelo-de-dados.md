# Modelo de dados do CRM (uso interno)

Versão 1 (MVP). Uso interno de uma única empresa, então não há separação entre clientes (multi-tenant).

## Entidades

### Usuario
Quem usa o sistema.
- `id` (identificador único)
- `nome` (texto, obrigatório)
- `email` (texto, único, obrigatório)
- `senhaHash` (texto, obrigatório; nunca guardar senha em texto puro)
- `papel` (enum: `ADMIN` ou `VENDEDOR`)
- `criadoEm` (data e hora)

### Empresa
Organização cliente ou potencial cliente.
- `id`
- `nome` (obrigatório)
- `cnpj` (texto, opcional)
- `site` (texto, opcional)
- `telefone` (texto, opcional)
- `endereco` (texto, opcional)
- `criadoEm`

### Contato
Pessoa com quem a empresa se relaciona.
- `id`
- `nome` (obrigatório)
- `email` (opcional)
- `telefone` (opcional)
- `cargo` (opcional)
- `empresaId` (opcional, vínculo com Empresa)
- `criadoEm`

### Negocio
Oportunidade de venda, que percorre o funil.
- `id`
- `titulo` (obrigatório, ex.: "Licença anual do sistema X")
- `valor` (número decimal, em reais)
- `etapa` (enum, veja abaixo; padrão `NOVO_LEAD`)
- `contatoId` (opcional)
- `empresaId` (opcional)
- `responsavelId` (obrigatório, vínculo com Usuario)
- `fechadoEm` (data, preenchida ao ganhar ou perder)
- `criadoEm`

### Atividade
Registro de interação (histórico).
- `id`
- `tipo` (enum: `LIGACAO`, `REUNIAO`, `EMAIL`, `NOTA`)
- `descricao` (texto)
- `data` (data e hora)
- `usuarioId` (quem registrou)
- `contatoId` (opcional)
- `negocioId` (opcional)
- `criadoEm`

### Tarefa
Lembrete ou pendência com prazo.
- `id`
- `titulo` (obrigatório)
- `prazo` (data, opcional)
- `concluida` (sim ou não; padrão não)
- `responsavelId` (vínculo com Usuario)
- `contatoId` (opcional)
- `negocioId` (opcional)
- `criadoEm`

## Enumeração: etapas do funil

| Valor | Significado |
|---|---|
| `NOVO_LEAD` | Entrou no sistema, ainda não foi qualificado |
| `QUALIFICADO` | Tem interesse real e necessidade confirmada |
| `PROPOSTA` | Proposta enviada, aguardando resposta |
| `GANHO` | Venda fechada |
| `PERDIDO` | Negócio não fechou (registrar o motivo em uma Atividade) |

## Relações (resumo)

- Uma **Empresa** tem muitos **Contatos**.
- Uma **Empresa** tem muitos **Negócios**.
- Um **Contato** pode ter muitos **Negócios**.
- Um **Negócio** tem muitas **Atividades** e muitas **Tarefas**.
- Um **Usuário** é responsável por muitos **Negócios** e **Tarefas**.

## Regras de negócio básicas

1. Negócio sem responsável não pode ser salvo.
2. Ao mudar a etapa para `GANHO` ou `PERDIDO`, `fechadoEm` recebe a data atual.
3. Vendedor vê só os negócios em que é responsável. Admin vê todos.
4. Excluir empresa não apaga os contatos; eles ficam sem empresa.

## Decisões confirmadas

- **Uso:** sozinho, uma única pessoa usando o sistema, dentro de uma empresa.
- **Escopo:** só o básico de CRM. Sem campos personalizados, sem produtos dentro do negócio.
- **Consequência:** a regra de permissões (admin vê tudo, vendedor vê só o seu) não é necessária no MVP. O campo `papel` fica no modelo só para uso futuro. Login continua necessário para proteger os dados.
