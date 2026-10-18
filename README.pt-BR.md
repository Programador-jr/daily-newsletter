<div align="center">

# King's Newsletter

### As notícias que importam, com o contexto por trás delas.

Cobertura diária do Brasil e do mundo, com resumos concisos, fontes selecionadas e guias sobre a história do Brasil e educação cívica.

[English](./README.md) · **Português (Brasil)**

<br>

[![Acessar o site](https://img.shields.io/badge/Acessar_o_site-dailynewsletter.vercel.app-0B766B?style=for-the-badge&logo=vercel&logoColor=white)](https://dailynewsletter.vercel.app)

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Banco_de_dados-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Licença](https://img.shields.io/badge/Licença-MIT-blue?style=flat-square)](./LICENSE)
[![Testes](https://github.com/Programador-jr/daily-newsletter/actions/workflows/tests.yml/badge.svg)](https://github.com/Programador-jr/daily-newsletter/actions/workflows/tests.yml)
[![Estrelas no GitHub](https://img.shields.io/github/stars/Programador-jr/daily-newsletter?style=flat-square)](https://github.com/Programador-jr/daily-newsletter/stargazers)
[![Issues no GitHub](https://img.shields.io/github/issues/Programador-jr/daily-newsletter?style=flat-square)](https://github.com/Programador-jr/daily-newsletter/issues)

</div>

---

## Conteúdo

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Educação cívica](#educação-cívica)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como começar](#como-começar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Painel administrativo](#painel-administrativo)
- [Referência da API](#referência-da-api)
- [Testes](#testes)
- [Operações de e-mail](#operações-de-e-mail)
- [Segurança e operação em produção](#segurança-e-operação-em-produção)
- [Diagnóstico do runtime e benchmarks](#diagnóstico-do-runtime-e-benchmarks)
- [Implantação](#implantação)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Sobre o projeto

A King's Newsletter é uma plataforma responsiva de notícias para acompanhar acontecimentos atuais e explorar a história e o contexto por trás deles. Reúne edições diárias, arquivo pesquisável, assinaturas por e-mail e uma seção sobre a História do Brasil.

**Acesse:** [Site publicado](https://dailynewsletter.vercel.app) · [Código-fonte](https://github.com/Programador-jr/daily-newsletter) · [Reportar um problema](https://github.com/Programador-jr/daily-newsletter/issues)

## Funcionalidades

- **Edições diárias** — notícias com resumos, contexto, datas de publicação e links para as fontes.
- **Arquivo pesquisável** — consulte edições anteriores e filtre notícias.
- **História do Brasil** — linha do tempo interativa, marcos históricos, presidentes, governos, constituições e guias temáticos.
- **Educação cívica** — guias de referência sobre ideologias políticas, políticas públicas, gastos públicos e funções constitucionais dos três Poderes.
- **Interface responsiva** — layouts para computadores e dispositivos móveis, com temas claro e escuro.
- **Assinaturas por e-mail** — fluxo de confirmação, links de cancelamento e notificações quando novas edições são publicadas.
- **Rastreamento de envios** — registra as notícias enviadas para ajudar a evitar notificações duplicadas.
- **Painel administrativo** — métricas de inscritos, entrega de e-mails, edições e worker, além de controles para envios pendentes e agendamento.

## Tecnologias

| Área | Tecnologias |
| --- | --- |
| Front-end | HTML, CSS, JavaScript puro |
| Servidor | Node.js 20+, Express 5 |
| Dados | MongoDB, Mongoose |
| E-mail | Nodemailer |
| Hospedagem | Vercel |
| Testes | Test runner nativo do Node.js, ESLint, Playwright |

## Estrutura do projeto

```text
.
├── api/                  # Manipuladores de notícias, assinaturas, confirmações e notificações
├── data/                 # Dados de exemplo e esquema de notícias
├── lib/                  # Conexão com banco, modelos, e-mail e tokens
├── test/                 # Testes de API e utilitários
├── public/
│   ├── css/              # Estilos do site e das páginas
│   ├── js/               # Comportamento executado no navegador
│   └── *.html             # Newsletter, edições, história e páginas de presidentes
├── scripts/              # Scripts de diagnóstico e benchmark
├── .github/workflows/    # Verificações automatizadas em pushes e pull requests
├── server.js             # Servidor Express local e rotas
├── vercel.json           # Configuração da Vercel
└── package.json
```

## Como começar

### Pré-requisitos

- [Node.js 20 ou superior](https://nodejs.org/)
- String de conexão do MongoDB para os recursos que usam o banco de dados
- Credenciais SMTP para enviar e-mails de assinatura e de edições

### Instalação

```bash
git clone https://github.com/Programador-jr/daily-newsletter.git
cd daily-newsletter
npm install
```

Crie um arquivo de ambiente local a partir do exemplo:

```bash
cp .env.example .env
```

Preencha as variáveis necessárias em `.env` (consulte [Variáveis de ambiente](#variáveis-de-ambiente) e inicie a aplicação:

```bash
# Servidor de desenvolvimento com reinicialização automática
npm run dev

# Ou inicie o servidor normalmente
npm start
```

Acesse [http://localhost:3000](http://localhost:3000).

> O site pode iniciar sem configuração do banco ou SMTP, mas os recursos da API que usam MongoDB ou enviam e-mails precisam das respectivas variáveis de ambiente.

## Variáveis de ambiente

| Variável | Finalidade |
| --- | --- |
| `MONGODB_URI` | String de conexão do MongoDB. Necessária para notícias e assinaturas. |
| `RATE_LIMIT_WINDOW_MS` | Janela do limitador de requisições em milissegundos (padrão: 900000, 15 minutos). |
| `RATE_LIMIT_SUBSCRIBE_IP_MAX` | Solicitações de assinatura por IP em cada janela (padrão: 10). |
| `RATE_LIMIT_SUBSCRIBE_EMAIL_MAX` | Tentativas por e-mail normalizado em cada janela (padrão: 3). |
| `RATE_LIMIT_ADMIN_LOGIN_IP_MAX` | Tentativas de login administrativo por IP em cada janela (padrão: 10). |
| `RATE_LIMIT_ADMIN_LOGIN_USER_MAX` | Tentativas por nome de usuário normalizado em cada janela (padrão: 5). |
| `EMAIL_USER` | Conta SMTP usada pelo Nodemailer. |
| `EMAIL_PASS` | Senha SMTP ou senha de aplicativo específica do provedor. |
| `EMAIL_FROM` | Nome e endereço opcionais do remetente; por padrão, usa `EMAIL_USER`. |
| `APP_URL` | URL pública canônica usada para gerar links de confirmação e cancelamento. |
| `NOTIFY_SECRET` | Segredo que autoriza operações protegidas de publicação e notificação de notícias. |
| `WORKER_CONTROL_SECRET` | Segredo separado, com pelo menos 32 caracteres, compartilhado entre o site e o canal de controle do worker. |
| `ADMIN_USERNAME` | Nome de usuário do painel administrativo privado. |
| `ADMIN_PASSWORD` | Senha forte para o painel administrativo privado. |
| `ADMIN_SESSION_SECRET` | Chave aleatória de assinatura, com pelo menos 32 caracteres, para as sessões administrativas. |
| `PORT` | Porta local opcional do servidor; o padrão é `3000`. |

Mantenha o arquivo `.env` privado. Nunca publique credenciais nem as envie ao repositório. No Gmail, use uma senha de app em vez da senha da conta.

## Painel administrativo

O painel fica disponível em `/admin` e exige usuário e senha. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` no ambiente local e na Vercel. A chave de assinatura da sessão deve ser aleatória e ter pelo menos 32 caracteres. O painel utiliza a variável `MONGODB_URI` do site; sem ela, não consegue carregar os dados.

O painel exibe inscritos confirmados e pendentes, quantidade de notícias da edição mais recente, notícias entregues e pendentes, mensagens aceitas ou rejeitadas pelo SMTP, falhas e execuções do worker. O botão **Disparar notícias pendentes** solicita confirmação e envia apenas notícias ainda não registradas como entregues. Os registros de envio e execução passam a ser armazenados a partir da implementação dessas métricas; logs antigos do console não são importados. Os horários são exibidos em `America/Rio_Branco`. “Aceito” significa que o servidor SMTP aceitou a mensagem para processamento, não que ela chegou à caixa de entrada do destinatário.

O painel também permite configurar o intervalo do worker (de 1 a 168 horas), pausar ou retomar o agendamento e consultar uma contagem regressiva e o último estado informado pelo worker. Configure o mesmo `WORKER_CONTROL_SECRET` no ambiente do site e no arquivo `.env` do worker, mantendo-o separado de `NOTIFY_SECRET`. O worker consulta a configuração e informa seu estado por HTTPS de saída a cada 30 segundos. Não é necessária uma porta pública nem um IP fixo. Configure essa variável no ambiente de produção da Vercel e faça uma nova implantação para habilitar o controle remoto em produção.

Na inicialização, o servidor avisa quando MongoDB, e-mail ou publicação protegida não estão configurados. Uma configuração SMTP parcial, uma variável `PORT` inválida ou uma `APP_URL` que não use HTTP/HTTPS interrompe a inicialização com uma mensagem que identifica a configuração sem revelar seu valor.

## Referência da API

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/news` | Retorna a edição mais recente. |
| `GET` | `/api/news?date=dd/mm/yyyy` | Retorna uma edição por data. |
| `GET` | `/api/news?history=true` | Lista as datas de edições disponíveis. |
| `POST` | `/api/news` | Publica ou atualiza notícias de uma edição. Exige `NOTIFY_SECRET`. |
| `POST` | `/api/subscribe` | Solicita confirmação de assinatura por e-mail. |
| `GET` | `/api/confirm?token=...` | Confirma uma assinatura. |
| `GET` | `/api/unsubscribe?token=...` | Cancela notificações por e-mail. |
| `POST` | `/api/notify-news` | Envia notificações de notícias publicadas. Exige `NOTIFY_SECRET`. |
| `POST` | `/api/admin/login` | Inicia uma sessão administrativa. |
| `POST` | `/api/admin/logout` | Encerra uma sessão administrativa. |
| `GET` | `/api/admin/dashboard?days=7` | Consulta métricas de inscritos, e-mails e worker. Exige sessão administrativa. |
| `GET`, `PUT` | `/api/admin/schedule` | Consulta ou altera o intervalo e o estado do agendamento do worker. Exige sessão administrativa. |
| `POST` | `/api/admin/dispatch` | Envia imediatamente as notícias pendentes. Exige sessão administrativa. |
| `GET` | `/api/worker/config` | Consulta a configuração de agendamento do worker. Exige `WORKER_CONTROL_SECRET`. |
| `POST` | `/api/worker/heartbeat` | Informa o estado do worker e o horário da próxima execução. Exige `WORKER_CONTROL_SECRET`. |

As datas das edições usam o formato `dd/mm/yyyy`. Os endpoints protegidos esperam o segredo configurado no cabeçalho `Authorization`.

## Testes

Execute a suíte de testes com o executor nativo do Node.js:

```bash
npm test
npm run lint
```

Os testes unitários usam substitutos para o MongoDB e o envio de e-mails, portanto não exigem serviços externos nem credenciais de produção. Os testes de navegador usam Playwright e Chromium. O GitHub Actions executa os testes unitários no Node.js 20 e 22 e verifica lint e navegador em pushes e pull requests. Rastros e relatórios do navegador são enviados como artefatos quando essas verificações falham.

Para executar os testes de navegador localmente, instale o Chromium:

```bash
npx playwright install chromium
npm run test:e2e
```

## Operações de e-mail

O envio de e-mails usa Gmail SMTP por meio do Nodemailer. Para uso local ou em produção, configure `EMAIL_USER` e `EMAIL_PASS`; contas do Gmail devem usar uma senha de app do Google, não a senha normal da conta. `EMAIL_FROM` é opcional e altera o remetente exibido.

O servidor emite eventos estruturados de log `email.delivery.succeeded` e `email.delivery.failed`. Os logs de sucesso incluem o ID da mensagem SMTP e a quantidade de destinatários aceitos; os de falha incluem um código de erro seguro. Endereços dos destinatários, conteúdo das mensagens e credenciais são omitidos intencionalmente. Na Vercel, consulte os logs do projeto e das funções no horário da tentativa e, em seguida, os logs de entrega ou segurança do provedor para investigar rejeições SMTP, devoluções ou mensagens na pasta de spam. A aceitação SMTP confirma que o provedor recebeu a mensagem para processamento, não que ela chegou à caixa de entrada.

Se o envio falhar, verifique se as duas variáveis SMTP estão configuradas, se a conta permite acesso SMTP/senha de app e se a implantação usa a `APP_URL` esperada. Não inclua credenciais nem o conteúdo integral de e-mails em relatos de problemas.

## Segurança e operação em produção

- Configure `APP_URL` como a origem canônica do site (por exemplo, `https://seudominio.com`), sem caminho, query string ou fragmento. Os links enviados por e-mail não devem depender do cabeçalho `Host` recebido.
- Em produção, `APP_URL` e `MONGODB_URI` são obrigatórias; a inicialização informa claramente quando falta configuração necessária.
- O cancelamento de inscrição usa GET apenas para exibir a página de confirmação e POST para concluir a ação. Os cabeçalhos de segurança são configurados na Vercel.
- As consultas à Câmara dos Deputados e ao Transferegov usam limites de tempo e tamanho, cache local limitado e cache compartilhado no CDN para respostas públicas bem-sucedidas. As listas de deputados e despesas usam `s-maxage=300` (5 minutos), a CEAP usa `s-maxage=1800` (30 minutos) e as emendas do Transferegov usam `s-maxage=600` (10 minutos). O `stale-while-revalidate` permite servir dados temporariamente desatualizados enquanto o CDN atualiza o cache. Respostas de erro não recebem esses cabeçalhos, e a API de notícias não usa cache compartilhado no CDN para evitar atrasos após a publicação de uma edição.
- O código da aplicação não chama `url.parse()` diretamente. Para identificar a origem de um aviso `DEP0169`, reproduza-o com `NODE_OPTIONS=--trace-deprecation` e inspecione o stack trace do runtime/implantação em vez de atualizar dependências sem diagnóstico.

## Diagnóstico do runtime e benchmarks

### Rastrear avisos de depreciação do Node.js

O código da aplicação não chama `url.parse()` diretamente; o aviso pode vir de uma dependência transitiva ou de um caminho de requisição incomum. O CI executa testes unitários e de navegador com `NODE_OPTIONS=--trace-deprecation`, para que avisos reproduzidos nesses testes incluam a pilha de chamadas. Se o aviso ocorrer apenas na Vercel, defina temporariamente `NODE_OPTIONS=--trace-deprecation` no ambiente Preview, faça uma nova implantação, reproduza a requisição e use o primeiro frame que não seja do Node.js para identificar o pacote responsável. Remova a configuração temporária depois de obter o rastreamento.

### Comparar o desempenho da API pública

Defina `BASE_URL_BEFORE` e `BASE_URL_AFTER` para as implantações antiga e candidata e configure `BENCHMARK_PATHS` com os mesmos endpoints GET separados por vírgulas. Execute:

```sh
BASE_URL_BEFORE=https://old-preview.example.com \
BASE_URL_AFTER=https://new-preview.example.com \
BENCHMARK_PATHS='/api/camara-deputados,/api/transferegov-emendas?ano=2025&limite=25' \
BENCHMARK_RUNS=5 node scripts/benchmark-public-data.js
```

O script registra status HTTP, tamanho da resposta, tempos individuais e latência mediana. Execute-o em implantações Preview com o mesmo período de dados; não o utilize como teste de carga em produção.

### Comparar consultas de edições no MongoDB

Com uma `MONGODB_URI` com permissões de leitura apontando para um banco representativo `kings_newsletter`, execute:

```bash
node scripts/benchmark-news-queries.js
```

O script verifica se os resultados atuais das agregações correspondem à referência calculada no Node.js, registra tempos medianos e informa estatísticas de execução do MongoDB quando disponíveis. É um diagnóstico opcional e não é executado pelo CI porque exige um banco real.

## Implantação

O projeto está configurado para a [Vercel](https://vercel.com/) e usa MongoDB para persistência dos dados. Antes de implantar, adicione as variáveis de ambiente necessárias nas configurações do projeto na Vercel. Defina `APP_URL` com a URL pública de produção para que os links dos e-mails apontem para o site correto.

## Contribuição

Relatos de bugs, ideias e melhorias são bem-vindos. Abra uma [issue](https://github.com/Programador-jr/daily-newsletter/issues) para discutir mudanças maiores antes de enviar um pull request. Execute `npm test` e `npm run lint` antes de submeter alterações.

## Licença

Este projeto está licenciado sob a [Licença MIT](./LICENSE).

---

<div align="center">

Feito com café e JavaScript por **Daniel Melo**.

</div>
