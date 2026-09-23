import fs from "node:fs/promises";

const TZ = "America/Rio_Branco";
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";
const SITE_URL = process.env.SITE_URL || "https://github.com/Programador-jr/daily-newsletter";

function todayInAcre() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function stripHtml(value) {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function emailHtml(data) {
  const stories = data.stories.map((story) => `
    <article style="padding:24px 0;border-bottom:1px solid #e5e5e5">
      <div style="font:700 11px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#1457d9;margin-bottom:10px">
        ${escapeHtml(story.category)} · ${escapeHtml(story.source)}
      </div>
      <h2 style="font:600 25px Georgia,serif;line-height:1.15;margin:0 0 12px;color:#171717">
        ${escapeHtml(story.title)}
      </h2>
      <p style="font:15px Arial,sans-serif;line-height:1.6;color:#444;margin:0 0 10px">
        ${escapeHtml(story.summary)}
      </p>
      <p style="font:14px Arial,sans-serif;line-height:1.6;color:#171717;margin:0 0 14px">
        <strong>Contexto:</strong> ${escapeHtml(story.context)}
      </p>
      <a href="${escapeHtml(story.url)}" style="font:700 13px Arial,sans-serif;color:#1457d9;text-decoration:none">Ler fonte</a>
    </article>
  `).join("");

  return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;background:#f5f5f2;color:#171717">
  <div style="max-width:720px;margin:0 auto;padding:36px 22px;font-family:Arial,sans-serif">
    <div style="border-bottom:1px solid #deded8;padding-bottom:18px">
      <div style="font-size:20px;font-weight:700">Resumo Diário</div>
      <div style="font-size:12px;color:#777;margin-top:6px">Edição de ${escapeHtml(data.date)}</div>
    </div>
    <div style="padding:28px 0 12px">
      <h1 style="font:600 42px/1 Georgia,serif;margin:0 0 12px">As notícias que importam.</h1>
      <p style="font-size:16px;line-height:1.6;color:#666;margin:0">Política, economia, investimentos, tecnologia, Acre, Brasil e mundo.</p>
    </div>
    ${stories}
    <div style="padding:26px 0 0;font-size:12px;color:#777;line-height:1.6">
      Informação antes da opinião. Cada notícia inclui a fonte para conferência.
    </div>
  </div>
</body>
</html>`;
}

async function openaiNews() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      date: { type: "string" },
      stories: {
        type: "array",
        minItems: 7,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            category: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            context: { type: "string" },
            source: { type: "string" },
            publishedAt: { type: "string" },
            url: { type: "string" }
          },
          required: ["category", "title", "summary", "context", "source", "publishedAt", "url"]
        }
      }
    },
    required: ["date", "stories"]
  };

  const prompt = `Hoje é ${todayInAcre()} no fuso America/Rio_Branco.

Produza a edição diária do site "Resumo Diário" para leitores brasileiros.

Use pesquisa na web para encontrar acontecimentos relevantes das últimas 24 horas. Priorize fontes primárias e veículos jornalísticos confiáveis. Não invente fatos, números, datas ou URLs.

Cobertura obrigatória:
1. Política e governo do Brasil
2. Economia e indicadores
3. Investimentos, mercados e empresas
4. Acre e região Norte, dando prioridade a fatos do Acre
5. Tecnologia e inteligência artificial
6. Brasil
7. Mundo

Escolha de 7 a 10 notícias realmente relevantes. Evite repetir o mesmo acontecimento em categorias diferentes.

Para cada notícia:
- title: título factual, sem clickbait.
- summary: 2 a 3 frases explicando o que aconteceu.
- context: 2 a 4 frases explicando por que importa, antecedentes e possíveis efeitos já documentados. Não faça previsão eleitoral ou financeira.
- source: nome da fonte principal.
- publishedAt: data da publicação da fonte no formato DD/MM/AAAA.
- url: URL direta da matéria utilizada, não a página inicial do veículo.
- category: uma destas categorias: Política, Economia, Investimentos, Acre, Tecnologia, Brasil, Mundo.

Para política e eleições, seja estritamente neutro: descreva fatos, posições e decisões documentadas. Não recomende candidatos, partidos ou escolhas políticas, não dê notas/rankings e não faça previsão de resultado eleitoral. Em investigações, diferencie suspeitas, acusações, decisões judiciais e fatos comprovados.

Retorne somente o JSON compatível com o schema solicitado.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      store: false,
      tools: [{ type: "web_search" }],
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "daily_newsletter",
          strict: true,
          schema
        }
      }
    })
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI API ${response.status}: ${JSON.stringify(body)}`);
  }

  const raw = body.output_text;
  if (!raw) {
    throw new Error("A OpenAI API não retornou texto estruturado.");
  }

  const data = JSON.parse(raw);
  data.date = todayInAcre();
  return data;
}

async function sendEmail(data) {
  const required = ["RESEND_API_KEY", "RESEND_FROM", "NEWSLETTER_TO"];
  const configured = required.every((key) => process.env[key]);

  if (!configured) {
    console.log("Envio de e-mail ignorado: configure RESEND_API_KEY, RESEND_FROM e NEWSLETTER_TO.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to: [process.env.NEWSLETTER_TO],
      subject: `Resumo Diário — ${data.date}`,
      html: emailHtml(data)
    })
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Resend API ${response.status}: ${JSON.stringify(body)}`);
  }

  console.log("E-mail enviado:", body.id || "ok");
}

async function main() {
  const data = await openaiNews();
  const json = JSON.stringify(data, null, 2) + "\n";

  await fs.mkdir("data/archive", { recursive: true });
  await fs.writeFile("data/news.json", json);
  await fs.writeFile(`data/archive/${data.date}.json`, json);
  await sendEmail(data);

  console.log(`Edição ${data.date} gerada com ${data.stories.length} notícias.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
