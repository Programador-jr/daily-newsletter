# Resumo Diário

Newsletter diária com notícias de política, economia, investimentos, tecnologia, Acre, Brasil e mundo.

## Como funciona

Todos os dias, um GitHub Actions executa o gerador de notícias. O gerador pesquisa notícias recentes na web, organiza a edição em JSON, salva o arquivo do dia no histórico e, se o envio de e-mail estiver configurado, envia a edição.

Fluxo:

`Web → OpenAI Responses API + web search → news.json → histórico → e-mail → site`

## Estrutura

- `index.html` — página principal
- `styles.css` — identidade visual responsiva
- `script.js` — carregamento da edição
- `data/news.json` — edição atual
- `data/archive/` — edições anteriores
- `scripts/generate-news.mjs` — pesquisa, geração e envio
- `.github/workflows/daily-news.yml` — execução diária

## Configuração

No GitHub, abra **Settings → Secrets and variables → Actions**.

### Secret obrigatório

- `OPENAI_API_KEY` — chave da OpenAI usada pelo gerador.

### Secrets opcionais para e-mail

- `RESEND_API_KEY` — chave da Resend.
- `RESEND_FROM` — variável do repositório com o remetente verificado.
- `NEWSLETTER_TO` — variável do repositório com o e-mail que receberá a edição.

Também é possível criar a variável:

- `OPENAI_MODEL` — modelo da OpenAI. Se não for criada, o padrão do script é `gpt-5.6-luna`.

## Horário

O workflow roda diariamente às **05:30 no horário do Acre**, usando o cron do GitHub em UTC. Também pode ser executado manualmente em **Actions → Atualizar Resumo Diário → Run workflow**.

## E-mail

O envio usa a API da Resend. Para produção, configure um remetente/domínio autorizado na Resend e coloque esse endereço em `RESEND_FROM`.

## Publicação

O projeto continua sendo HTML/CSS/JS puro. Ele pode ser conectado diretamente ao Vercel pelo GitHub; cada push na `main` pode gerar uma nova publicação.

## Observação

As edições geradas automaticamente devem ser revisadas periodicamente. O gerador foi instruído a priorizar fontes confiáveis, usar URLs diretas e separar fatos de alegações, especialmente em notícias políticas e investigações.
