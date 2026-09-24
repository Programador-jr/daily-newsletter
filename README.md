# King's Newsletter

Newsletter diária com notícias relevantes de política, economia, investimentos, tecnologia, Brasil e mundo.

O site é estático e não depende de banco de dados, backend próprio ou OpenAI API paga. A automação pesquisa, valida e atualiza diretamente o GitHub.

## Estrutura

- `index.html` — página inicial
- `editions.html` — edição atual, busca, filtros e histórico
- `about.html` — informações do projeto
- `styles.css` — identidade visual e responsividade
- `script.js` — carregamento, filtros, busca, tema e histórico
- `data/news.json` — edição atual
- `data/archive/YYYY-MM-DD.json` — uma edição histórica por dia
- `data/archive/list.json` — índice completo do histórico

## Histórico

Não existe limite artificial de 30 edições. Cada edição permanece no arquivo histórico e aparece no índice.

## Regras editoriais

- Cobertura nacional e internacional.
- Política neutra e factual.
- Alegações e opiniões identificadas.
- Acre/Norte entram quando houver relevância significativa.
- Não inventar fatos ou URLs.
- Priorizar links diretos.
- Evitar duplicação.
- De 7 a 10 notícias relevantes por edição.
