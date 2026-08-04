# Banco de questões externo (QConcursos)

## O ponto de partida honesto

O QConcursos **não oferece API pública** para terceiros. Não existe endpoint documentado, nem chave de desenvolvedor, nem connector pronto. Além disso, entrar com seu usuário e senha por robô viola os termos de uso deles e pode bloquear sua conta.

Então o caminho realista é: preparar o app para **receber questões de fora** por duas portas — uma que funciona hoje (importação) e outra que liga na hora em que você tiver uma credencial oficial de API (deles ou de qualquer outra plataforma).

## O que será construído

### 1. Banco de questões na nuvem (Lovable Cloud)
Hoje o acervo só existe no aparelho. Passa a ficar salvo na nuvem, com login, disponível no celular e no tablet, e crescendo sem limite:
- Tabela de questões com enunciado, alternativas, gabarito, explicação, banca, matéria, assunto, ano, origem (manual / importado / API).
- Login por e-mail e senha + Google, cada usuário com seu próprio acervo.
- As telas `/questoes`, `/prova-interativa` e `/inclusao` passam a ler desse banco em vez do armazenamento local, com migração automática do que já está no aparelho.

### 2. Importador de provas (funciona hoje, sem API)
Tela `/inclusao` ganha importação real:
- Colar texto de prova + gabarito, ou enviar PDF; a IA separa as questões, alternativas, gabarito e matéria e grava cada uma no banco.
- Prévia antes de salvar, com opção de corrigir ou descartar questões mal separadas.
- Deduplicação por enunciado, para não repetir a mesma questão de duas provas.

### 3. Conexão com API externa (pronta para ligar)
Uma tela de "Fontes externas" onde você cadastra uma fonte de questões:
- Nome da fonte, endereço da API e a chave/token — a chave fica guardada só no servidor, nunca no aplicativo.
- Um mapeamento simples de campos (qual campo é enunciado, alternativas, gabarito).
- Botão "Testar conexão" e "Importar questões" com filtro por banca/matéria; tudo cai no mesmo banco.

Assim, no dia em que o QConcursos (ou Gran, Tec, Estratégia) liberar acesso oficial, é só cadastrar a fonte — sem obra nova.

### 4. O que não será feito
Robô que faz login com seu usuário e senha do QConcursos e raspa questões. Risco de banimento da sua conta e problema jurídico; não vou implementar isso.

## Detalhes técnicos

- Ativar Lovable Cloud: tabelas `questoes`, `fontes_externas`, RLS por `auth.uid()` com grants, migração com o schema.
- Importação/parsing de PDF e texto por server function usando o AI Gateway já configurado (`runAIJson`), com validação Zod do resultado.
- Credenciais de API externa guardadas via secrets do servidor, chamadas só por `createServerFn`; nada de chave no navegador.
- `src/lib/acervo.ts` vira uma camada sobre o banco (mesma interface, para não reescrever as telas).
- Corrigir também um erro de execução atual em `/redacao` (leitura de índice indefinido).
