# King's Newsletter

Newsletter diária com notícias de política, economia, investimentos, tecnologia, Brasil e mundo.

## Como funciona

O site carrega as notícias do arquivo `data/news.json` e exibe na página principal com um design moderno inspirado em newsletters premium. O script de arquivamento salva cópias das edições em `data/archive/`.

Fluxo:

`news.json → site → archive/`

## Estrutura

- `index.html` — página principal com design moderno
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

Isso copia `data/news.json` para `data/archive/AAAA-MM-DD.json` e atualiza a timeline do histórico.

## Timeline

O histórico de edições é exibido em uma linha do tempo na seção "Edições". O arquivo `data/archive/list.json` controla quais edições aparecem na timeline.

## Tema

O site suporta tema claro e escuro com toggle no header. A preferência é salva no localStorage.

## Design

- Layout moderno com container centralizado
- Fontes Playfair Display (títulos) e Inter (corpo)
- Switch de tema animado com ícones de sol e lua
- Cards de notícias com design clean
- Timeline de histórico visual
- Responsivo para todos os dispositivos
