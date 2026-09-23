import fs from "node:fs/promises";

const TZ = "America/Brasilia";

function todayInBrasilia() {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${map.year}-${map.month}-${map.day}`;
}

async function main() {
  const date = todayInBrasilia();
  
  try {
    const data = await fs.readFile("data/news.json", "utf-8");
    const parsed = JSON.parse(data);
    
    await fs.mkdir("data/archive", { recursive: true });
    await fs.writeFile(`data/archive/${date}.json`, data);
    
    console.log(`Edição ${date} arquivada com ${parsed.stories.length} notícias.`);
  } catch (error) {
    console.error("Erro ao processar news.json:", error.message);
    process.exit(1);
  }
}

main();
