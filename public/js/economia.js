(() => {
  const container = document.getElementById('economy-news');
  if (!container) return;

  const economyTerms = /economia|econômic|mercado|investimento|investimentos|inflação|ipca|selic|juros|banco central|copom|dólar|câmbio|pib|emprego|desemprego|salário|fiscal|dívida pública|contas públicas|tesouro|bolsa de valores|ações|exportação|importação|comércio exterior|petróleo|combustível|preço dos alimentos/i;

  const text = value => typeof value === 'string' ? value.trim() : '';
  const safeExternalUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  };
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  };
  const formatDate = value => {
    const raw = text(value);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
    const date = new Date(raw);
    return raw && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
      : '';
  };
  const showMessage = message => {
    const state = element('p', 'economy-state', message);
    state.setAttribute('role', 'status');
    container.replaceChildren(state);
    container.setAttribute('aria-busy', 'false');
  };
  const renderStory = story => {
    const card = element('article', 'economy-news-card');
    const content = element('div');
    const meta = element('div', 'economy-news-meta');
    const category = text(story.category);
    if (category) meta.append(element('span', 'economy-news-category', category));
    const source = text(story.source);
    const date = formatDate(story.publishedAt);
    if (source) meta.append(element('span', '', source));
    if (date) meta.append(element('time', '', date));
    content.append(meta);
    content.append(element('h3', '', text(story.title) || 'Notícia sem título'));
    if (text(story.summary)) content.append(element('p', '', text(story.summary)));
    if (text(story.context)) content.append(element('p', '', text(story.context)));
    card.append(content);
    const url = safeExternalUrl(text(story.url));
    if (url) {
      const link = element('a', '', 'Ler na fonte');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(document.createTextNode(' '));
      const icon = document.createElement('i');
      icon.className = 'fas fa-arrow-up-right-from-square';
      icon.setAttribute('aria-hidden', 'true');
      link.append(icon);
      card.append(link);
    }
    return card;
  };

  fetch('/api/news', { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Falha ao consultar a edição atual.');
      return response.json();
    })
    .then(data => {
      const stories = Array.isArray(data?.stories) ? data.stories : [];
      const filtered = stories.filter(story => {
        const category = text(story.category);
        return economyTerms.test(category) ||
          economyTerms.test([story.title, story.summary, story.context].map(text).join(' '));
      }).filter(story => text(story.title) && text(story.source) && safeExternalUrl(text(story.url)));

      if (!filtered.length) {
        showMessage('Ainda não há notícias econômicas disponíveis na edição atual. Consulte os indicadores nas fontes oficiais acima ou veja a edição completa.');
        return;
      }
      container.replaceChildren(...filtered.slice(0, 6).map(renderStory));
      container.setAttribute('aria-busy', 'false');
    })
    .catch(() => showMessage('Não foi possível carregar as notícias econômicas agora. Os links para as fontes oficiais continuam disponíveis acima.'));
})();
