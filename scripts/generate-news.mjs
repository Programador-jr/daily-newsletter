import fs from "node:fs/promises";
import path from "node:path";

const TZ = "America/Sao_Paulo";

function todayInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${map.year}-${map.month}-${map.day}`;
}

async function updateArchiveList() {
  try {
    const archiveDir = "data/archive";
    const files = await fs.readdir(archiveDir);
    
    // Filter only JSON files (not list.json)
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && file !== 'list.json' && file !== '.gitkeep'
    );
    
    if (jsonFiles.length === 0) {
      await fs.writeFile(
        path.join(archiveDir, "list.json"), 
        JSON.stringify([], null, 2)
      );
      console.log("Nenhum arquivo de arquivo encontrado. Lista vazia criada.");
      return;
    }
    
    // Extract dates from filenames and sort
    const archives = await Promise.all(
      jsonFiles.map(async (file) => {
        const date = file.replace('.json', '');
        const filePath = path.join(archiveDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        return {
          date: date,
          title: `Edição de ${new Date(date).toLocaleDateString('pt-BR')}`,
          stories: data.stories ? data.stories.length : 0
        };
      })
    );
    
    // Sort by date (newest first)
    archives.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Keep only last 30 entries
    const limitedArchives = archives.slice(0, 30);
    
    await fs.writeFile(
      path.join(archiveDir, "list.json"), 
      JSON.stringify(limitedArchives, null, 2)
    );
    
    console.log(`Lista de arquivos atualizada com ${limitedArchives.length} edições.`);
  } catch (error) {
    console.error("Erro ao atualizar lista de arquivos:", error.message);
  }
}

async function main() {
  const date = todayInSaoPaulo();
  
  try {
    const data = await fs.readFile("data/news.json", "utf-8");
    const parsed = JSON.parse(data);
    
    await fs.mkdir("data/archive", { recursive: true });
    await fs.writeFile(`data/archive/${date}.json`, data);
    
    console.log(`Edição ${date} arquivada com ${parsed.stories.length} notícias.`);
    
    // Update archive list based on real files
    await updateArchiveList();
  } catch (error) {
    console.error("Erro ao processar news.json:", error.message);
    process.exit(1);
  }
}

main();
