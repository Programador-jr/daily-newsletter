# King's Newsletter

Newsletter diária com notícias de política, economia, investimentos, tecnologia, Acre, Brasil e mundo.

## Como funciona

O site carrega as notícias do arquivo `data/news.json` e exibe na página principal. O script de arquivamento salva cópias das edições em `data/archive/`.

Fluxo:

`news.json → site → archive/`

## Estrutura

- `index.html` — página principal
- `styles.css` — identidade visual responsiva com tema claro/escuro
- `script.js` — carregamento da edição e toggle de tema
- `data/news.json` — edição atual
- `data/archive/` — edições anteriores
- `scripts/generate-news.mjs` — arquivamento de edições

## Atualização

Para atualizar as notícias, edite manualmente o arquivo `data/news.json` com o formato:

```json
{
  "date": "2026-09-23",
  "stories": [
    {
      "category": "Política",
      "title": "Título da notícia",
      "summary": "Resumo de 2-3 frases",
      "context": "Contexto explicando por que importa",
      "source": "Fonte",
      "publishedAt": "23/09/2026",
      "url": "https://exemplo.com/noticia"
    }
  ]
}
```

## Arquivamento

Para arquivar a edição atual:

```bash
node scripts/generate-news.mjs
```

Isso copia `data/news.json` para `data/archive/AAAA-MM-DD.json`.

## Tema

O site suporta tema claro e escuro com toggle no header. A preferência é salva no localStorage.
