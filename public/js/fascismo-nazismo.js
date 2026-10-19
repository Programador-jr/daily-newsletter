(() => {
  const widget = document.querySelector('[data-comparison]');
  if (!widget) return;

  const comparisons = {
    origem: {
      italy: 'O movimento cresceu após a Primeira Guerra Mundial, em meio a conflitos sociais, medo de revolução e nacionalismo. Mussolini tornou-se primeiro-ministro em 1922; a ditadura foi consolidada nos anos seguintes.',
      germany: 'O Partido Nazista cresceu durante a crise da República de Weimar. Hitler foi nomeado chanceler em janeiro de 1933; o regime desmantelou rapidamente a democracia e concentrou o poder.',
      insight: 'Os dois movimentos se beneficiaram de crises e da violência política do pós-guerra, mas chegaram ao poder em contextos nacionais diferentes. A crise não tornou a ditadura inevitável.'
    },
    ideologia: {
      italy: 'Ultranacionalismo, Estado autoritário, culto ao líder e mobilização política de massas. O regime também incorporou imperialismo e, a partir de 1938, legislação racial antissemita.',
      germany: 'Projeto totalitário baseado no culto ao Führer, no racismo biológico, no antissemitismo radical e na conquista territorial. A ideologia racial orientou a exclusão, a perseguição e o genocídio.',
      insight: 'Ambos rejeitaram a democracia liberal e perseguiram adversários. No nazismo, o racismo biológico e o antissemitismo tiveram centralidade ideológica e conduziram ao Holocausto.'
    },
    politica: {
      italy: 'O Partido Nacional Fascista dominou o Estado, suprimiu a oposição, censurou a imprensa e restringiu sindicatos independentes. A monarquia continuou formalmente existente durante boa parte do regime.',
      germany: 'O regime de partido único destruiu a oposição, coordenou instituições sob o Führer e ampliou o poder da polícia política, da SS e de outros órgãos repressivos.',
      insight: 'Os dois regimes concentraram poder e eliminaram o pluralismo. As estruturas institucionais e a extensão do controle estatal não foram idênticas.'
    },
    propaganda: {
      italy: 'A propaganda glorificava Mussolini, a disciplina, a romanidade e a ideia de renascimento nacional. Estado e partido buscaram influenciar imprensa, educação, cultura e juventude.',
      germany: 'A propaganda nazista promoveu o culto a Hitler, nacionalismo, teorias raciais e antissemitismo. A censura e o controle dos meios de comunicação ajudaram a normalizar a perseguição.',
      insight: 'A propaganda dos dois regimes procurava construir lealdade e fabricar inimigos. Cada peça deve ser lida como produção política situada, e não como descrição neutra da realidade.'
    },
    repressao: {
      italy: 'Milícias fascistas, polícia política, censura, prisão, vigilância e exílio interno foram usados contra opositores. O regime também praticou violência colonial e repressão em territórios ocupados.',
      germany: 'Gestapo, SS, campos de concentração, prisão e terror estatal atingiram opositores políticos e grupos definidos como inimigos raciais ou sociais. A repressão evoluiu para deportações e assassinatos em massa.',
      insight: 'A violência política foi constitutiva de ambos os regimes, mas o sistema nazista desenvolveu uma perseguição racial e um programa genocida de escala e finalidade específicas.'
    },
    racismo: {
      italy: 'O regime adotou leis raciais antissemitas em 1938, excluindo judeus de escolas, profissões e outras áreas da vida pública. O colonialismo italiano também foi marcado por hierarquias raciais e violência.',
      germany: 'O racismo biológico e o antissemitismo eram centrais desde a ideologia nazista. A perseguição aos judeus culminou no Holocausto: seis milhões de judeus europeus foram assassinados.',
      insight: 'Não se deve apagar o racismo e os crimes do fascismo italiano, nem tratar as políticas dos dois regimes como equivalentes. A centralidade e a radicalização do projeto racial nazista foram distintivas.'
    },
    expansao: {
      italy: 'O regime perseguiu um projeto imperial, invadiu a Etiópia em 1935 e participou da ocupação de territórios nos Bálcãs durante a Segunda Guerra Mundial.',
      germany: 'A busca por Lebensraum (espaço vital) sustentou conquistas territoriais, a invasão da Polônia em 1939 e uma guerra de extermínio no Leste Europeu.',
      insight: 'Ambos recorreram à guerra e à expansão imperial. As metas, a escala e a relação entre conquista territorial e genocídio diferiram entre os regimes.'
    }
  };

  const tabs = Array.from(widget.querySelectorAll('[role="tab"]'));
  const panel = widget.querySelector('[role="tabpanel"]');
  const italy = widget.querySelector('[data-italy]');
  const germany = widget.querySelector('[data-germany]');
  const insight = widget.querySelector('[data-insight]');

  const selectTopic = (tab, moveFocus) => {
    const data = comparisons[tab.dataset.topic];
    if (!data) return;
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    italy.textContent = data.italy;
    germany.textContent = data.germany;
    insight.textContent = data.insight;
    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTopic(tab, false));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const nextIndex = event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : tabs.length - 1;
      event.preventDefault();
      selectTopic(tabs[nextIndex], true);
    });
  });

  const gallery = document.querySelector('[data-historical-gallery]');
  const dialog = document.querySelector('[data-gallery-dialog]');
  if (gallery) {
    const additionalSources = [
      // Fotografias da Itália fascista e de seu projeto colonial.
      ['fotografia', 'Artilharia italiana na guerra contra a Etiópia', 'Março de 1936 · Etiópia ocupada', 'A imagem mostra artilharia operada por soldados somalis Ascari a serviço da Itália durante a guerra de agressão contra a Etiópia. O registro deve ser lido no contexto da ocupação colonial.', 'Autor não identificado; fotografia preservada pelo Arquivo Digital Nacional da Polônia. Wikimedia Commons, domínio público.', 'Italian artillery during the Second Italo-Ethiopian War.jpg', 'Artilharia italiana operada por soldados somalis Ascari durante a guerra contra a Etiópia, em 1936.'],
      ['fotografia', 'Parada militar italiana em Adis Abeba', 'Maio de 1936 · Etiópia ocupada', 'A parada ocorreu após a ocupação de Adis Abeba pelas tropas italianas. A cerimônia pública encenava a conquista como vitória imperial e não representa consentimento da população etíope.', 'Autor não identificado; fotografia preservada pelo Arquivo Digital Nacional da Polônia. Wikimedia Commons, domínio público.', 'Military Parade of Italian Troops in Addis Ababa (1936).jpg', 'Tropas italianas desfilam em Adis Abeba após a ocupação da cidade em 1936.'],
      ['fotografia', 'A captura de Omar al-Mukhtar', '15 de setembro de 1931 · Líbia ocupada', 'O líder da resistência líbia Omar al-Mukhtar aparece preso entre oficiais italianos. O registro foi produzido durante a repressão à resistência contra a ocupação fascista da Líbia.', 'Fotógrafo não identificado. Wikimedia Commons, domínio público.', 'Omar Mokhtar arrested by Italian Officials.jpg', 'Omar al-Mukhtar algemado entre oficiais italianos, em 1931.'],
      ['fotografia', 'Campo de concentração de El Abiar', 'Entre 1929 e 1933 · Cirenaica, Líbia', 'A fotografia aérea registra o campo italiano de El Abiar durante a chamada pacificação da Cirenaica. As autoridades fascistas deportaram e internaram comunidades líbias em campos; o registro foi publicado em obra do próprio Rodolfo Graziani.', 'Rodolfo Graziani; publicado em Cirenaica pacificata (1932) e reproduzido por Wikimedia Commons, domínio público.', 'Italian concentration camp at el-Abiar.png', 'Vista aérea do campo de concentração italiano de El Abiar, na Líbia.'],
      ['fotografia', 'Mussolini na campanha do trigo', 'Por volta de 1925 · Itália', 'A fotografia mostra Mussolini trabalhando no campo para promover a campanha do trigo, que buscava ampliar a produção nacional. A encenação vinculava o líder à autossuficiência e ao trabalho rural.', 'Autor não identificado. Wikimedia Commons, licença CC BY-SA 4.0.', 'Mussolini nella battaglia del grano.jpg', 'Mussolini trabalha no campo durante a campanha fascista do trigo.'],

      // Cartazes, impressos e imagens de propaganda da Itália fascista.
      ['cartaz', 'A Noi!: lema fascista na imprensa', 'Antes de 1943 · Itália', 'A imagem publicada no jornal Il Popolo d’Italia retoma o lema “A noi!”, associado à mobilização fascista e a Gabriele D’Annunzio. O impresso evidencia a circulação de símbolos e palavras de ordem do movimento.', 'Autor não identificado; imagem publicada em Il Popolo d’Italia. Wikimedia Commons, domínio público.', 'A Noi!.png', 'Impresso com o lema fascista “A noi!” publicado em Il Popolo d’Italia.'],
      ['cartaz', 'Dia da Mãe e da Criança', '24 de dezembro de 1937 · Itália', 'O cartaz da Opera Nazionale Maternità e Infanzia promove a celebração fascista da maternidade. A política demográfica do regime exaltava a família e atribuía às mulheres um papel ligado à reprodução e à criação de futuros cidadãos.', 'Opera Nazionale Maternità e Infanzia (ONMI). Wikimedia Commons, domínio público.', 'Giornata-della-Madre-e-del-Fanciullo.jpg', 'Cartaz da celebração fascista do Dia da Mãe e da Criança, em 1937.'],
      ['cartaz', 'Tripoli é italiana!', 'Por volta de 1912 · Itália e Líbia', 'Este cartão celebra a captura italiana de Trípoli, antes da chegada de Mussolini ao poder. Ele ajuda a contextualizar a tradição imperial e colonial que o fascismo ampliou e usou em sua propaganda.', 'Autor não identificado. Wikimedia Commons, domínio público.', 'Tripoli è italiana!.jpg', 'Cartão-postal italiano que celebra a captura de Trípoli, por volta de 1912.'],
      ['cartaz', 'Propaganda eleitoral fascista de 1924', '1924 · Itália', 'Cartão de propaganda política da campanha fascista de 1924. A peça circulou em um período de violência contra opositores e de restrição crescente à competição eleitoral.', 'Autor não identificado. Wikimedia Commons, domínio público.', 'Propaganda politiche 1924.jpg', 'Cartão de propaganda fascista para as eleições italianas de 1924.'],
      ['cartaz', 'O Duce e a campanha do ouro para a pátria', '1937 · Itália', 'A campanha “Ouro para a Pátria” incentivou a entrega de alianças e outros objetos de ouro ao Estado durante a guerra da Etiópia e as sanções internacionais. A propaganda apresentava a contribuição como dever patriótico.', 'Autor não identificado. Wikimedia Commons; registro da campanha de 1937.', 'Duce e oro alla patria (1937).png', 'Peça da campanha fascista Ouro para a Pátria, de 1937.'],
      ['cartaz', '“Salutem no Duce, fundador do Império”', 'Por volta de 1930–1935 · Itália', 'O cartaz cultua Mussolini como fundador do Império, associando a imagem do líder às conquistas coloniais. A exaltação imperial encobria a violência da invasão e da ocupação de outros territórios.', 'Desenho: Piero Todeschini; Coleção Salce, Direção Regional dos Museus do Vêneto. Wikimedia Commons, Public Domain Mark.', 'Poster El Duce circa 1930-35.jpg', 'Cartaz que apresenta Mussolini como fundador do Império.'],
      ['cartaz', 'A italianização forçada da minoria eslava', 'Período fascista · Ístria', 'O aviso do Partido Nacional Fascista proíbe o uso público da língua eslava em Vodnjan e ameaça impor a ordem pela violência. É evidência da política de italianização e repressão cultural nas áreas eslavas anexadas.', 'Autor não identificado. Wikimedia Commons; registro digital de um impresso histórico.', 'Fascist italianization.jpg', 'Aviso fascista que proíbe falar eslavo em espaços públicos de Vodnjan.'],
      ['cartaz', 'O fascismo contra o bolchevismo', 'Período fascista · Itália', 'A peça contrapõe fascismo e bolchevismo para construir um inimigo político e legitimar o autoritarismo. Como propaganda, ela expressa a mensagem dos produtores e não oferece uma descrição neutra dos sistemas comparados.', 'Autor não identificado. Wikimedia Commons; cartaz de propaganda política italiana.', 'Bolchevisme vs fascisme (propaganda poster).jpg', 'Cartaz de propaganda que contrapõe fascismo e bolchevismo.'],
      ['cartaz', 'Propaganda das Brigadas Negras', '1944 · República Social Italiana', 'O manifesto de propaganda das Brigadas Negras pertence à República Social Italiana, o regime fascista instalado no norte da Itália sob ocupação alemã. O impresso registra a mobilização e a violência política da fase final do fascismo italiano.', 'Autor não identificado. Wikimedia Commons; manifesto de propaganda de 1944.', 'BrigateNere manifesto propaganda 1944.jpg', 'Manifesto de propaganda das Brigadas Negras, de 1944.'],

      // Documentos, imprensa e registros administrativos italianos.
      ['documento', 'O Pacto do Palazzo Vidoni', '2 de outubro de 1925 · Itália', 'O pacto entre a Confederação das Corporações Fascistas e a Confindustria reconheceu as organizações sindicais fascistas como representantes de trabalhadores e empregadores e enfraqueceu sindicatos independentes.', 'Documento histórico do Pacto do Palazzo Vidoni. Wikimedia Commons.', 'Patto di Palazzo Vidoni (1925).png', 'Registro do Pacto do Palazzo Vidoni, firmado em 1925.'],
      ['documento', 'O Manifesto dos intelectuais fascistas', '21 de abril de 1925 · Itália', 'Publicado por iniciativa de Giovanni Gentile, o manifesto buscou apresentar o fascismo como movimento cultural e político. É uma fonte primária da tentativa de intelectuais de legitimar o regime.', 'Publicado em Il Popolo d’Italia e outros jornais; autoria associada a Giovanni Gentile. Wikimedia Commons.', "Il Manifesto degl'intellettuali del Fascismo.png", 'Trecho do Manifesto dos intelectuais fascistas, publicado em 1925.'],
      ['documento', 'O manifesto dos intelectuais antifascistas', '1º de maio de 1925 · Itália', 'A declaração de oposição, promovida por Benedetto Croce, respondeu ao manifesto fascista e defendeu a liberdade intelectual. O documento registra a existência de resistência pública ao regime.', 'Publicado em Il Mondo em 1º de maio de 1925. Wikimedia Commons.', 'MANIFESTO ANTIFASCISTA il Mondo 01.05.1925.png', 'Manifesto antifascista publicado pelo jornal Il Mondo, em maio de 1925.'],
      ['documento', 'A declaração de pertencimento à “raça judaica”', '1938 · Itália', 'Este formulário burocrático foi usado após as leis raciais para identificar e registrar pessoas judias. A documentação mostra como a discriminação foi convertida em procedimento administrativo estatal.', 'Formulário administrativo do regime fascista italiano. Wikimedia Commons.', 'Denuncia di appartenenza alla razza ebraica.png', 'Formulário fascista italiano para declaração de pertencimento à comunidade judaica.'],
      ['documento', 'A primeira página do Corriere della Sera', '11 de novembro de 1938 · Itália', 'A primeira página do jornal registra o contexto da promulgação das leis raciais italianas. A imprensa da época é fonte para estudar como decisões estatais eram noticiadas sob a ditadura.', 'Corriere della Sera, edição de 11 de novembro de 1938. Wikimedia Commons.', 'Corriere testata 1938.jpg', 'Primeira página do Corriere della Sera no dia da promulgação das leis raciais.'],
      ['documento', 'Il Popolo d’Italia anuncia a entrada na guerra', '11 de junho de 1940 · Itália', 'A primeira página do jornal associado a Mussolini registra a entrada da Itália na Segunda Guerra Mundial. A manchete deve ser lida como comunicação política publicada em um sistema de imprensa sob censura.', 'Il Popolo d’Italia, edição de 11 de junho de 1940. Wikimedia Commons.', 'Popolo d Italia 11-06-1940.png', 'Primeira página de Il Popolo d’Italia após a declaração de guerra italiana.'],
      ['documento', 'A primeira página de La Tribuna', '28 de setembro de 1940 · Itália', 'Esta edição de La Tribuna é um exemplo de imprensa publicada durante a ditadura e a guerra. Manchetes e enquadramentos jornalísticos podem ser comparados com documentos e testemunhos independentes.', 'La Tribuna, edição de 28 de setembro de 1940. Wikimedia Commons.', 'Prima pagina La Tribuna 28-09-1940.jpg', 'Primeira página do jornal La Tribuna, de setembro de 1940.'],
      ['documento', 'A votação que retirou poderes de Mussolini', '24–25 de julho de 1943 · Itália', 'O registro da votação do Grande Conselho do Fascismo sobre a ordem do dia de Dino Grandi documenta a crise interna que levou à destituição de Mussolini pelo rei.', 'Registro da votação do Grande Conselho do Fascismo. Wikimedia Commons.', 'Votazione odg Grandi.jpg', 'Registro relacionado à votação da ordem do dia Grandi, em julho de 1943.'],
      ['documento', 'A cédula eleitoral do plebiscito de 1934', '25 de março de 1934 · Itália', 'A cédula oficial permite observar como o regime organizou a eleição parlamentar de lista única. A consulta não oferecia uma competição multipartidária livre.', 'Cédula da XXIX Legislatura, eleições políticas italianas de 1934. Wikimedia Commons.', 'Scheda per la votazione - Legislatura XXIX - Elezioni politiche 25 marzo 1934 - Fronte.jpeg', 'Frente da cédula eleitoral italiana usada em 1934.'],
      ['documento', 'A carteira da Milícia Voluntária para a Segurança Nacional', 'Período fascista · Itália', 'A carteira registra a identificação de um integrante da Milícia Voluntária para a Segurança Nacional (MVSN), força armada ligada ao Partido Nacional Fascista e utilizada pelo regime.', 'Carteira histórica da MVSN. Wikimedia Commons.', 'Tessera MVSN.jpg', 'Carteira de identificação da Milícia Voluntária para a Segurança Nacional.'],
      ['documento', 'O manifesto de fundação dos Fasci di combattimento', '1919 · Itália', 'O documento registra o programa político dos Fasci italiani di combattimento, fundados em Milão em 1919. É uma fonte primária para comparar as propostas iniciais do movimento com a ditadura posteriormente estabelecida.', 'Fasci italiani di combattimento, programa de 1919. Wikimedia Commons.', 'Fasci di combattimento.jpg', 'Reprodução do manifesto dos Fasci italiani di combattimento, de 1919.']
    ];

    additionalSources.forEach(([type, title, date, context, credit, file, alt]) => {
      const fileUrl = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replaceAll('%20', '_')}`;
      const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
      const card = document.createElement('article');
      card.className = 'historical-gallery-card';
      card.dataset.galleryType = type;

      const openButton = document.createElement('button');
      openButton.type = 'button';
      openButton.className = 'gallery-item-open';
      openButton.dataset.galleryOpen = '';
      openButton.dataset.title = title;
      openButton.dataset.date = date;
      openButton.dataset.context = context;
      openButton.dataset.credit = credit;
      openButton.dataset.source = fileUrl;
      openButton.dataset.image = imageUrl;

      const imageWrap = document.createElement('span');
      imageWrap.className = 'gallery-image-wrap';
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = alt;
      image.loading = 'lazy';
      const zoom = document.createElement('span');
      zoom.className = 'gallery-zoom';
      const zoomIcon = document.createElement('i');
      zoomIcon.className = 'fas fa-expand';
      zoomIcon.setAttribute('aria-hidden', 'true');
      zoom.append(zoomIcon, document.createTextNode(' Ampliar'));
      imageWrap.append(image, zoom);

      const body = document.createElement('span');
      body.className = 'gallery-card-body';
      const meta = document.createElement('span');
      meta.className = 'gallery-card-meta';
      meta.textContent = `${type === 'fotografia' ? 'Fotografia' : type === 'cartaz' ? 'Cartaz' : 'Documento'} · ${date}`;
      const heading = document.createElement('strong');
      heading.textContent = title;
      const summary = document.createElement('span');
      summary.textContent = alt;
      body.append(meta, heading, summary);
      openButton.append(imageWrap, body);
      card.append(openButton);
      gallery.append(card);
    });
  }

  if (gallery && dialog) {
    const filterButtons = Array.from(document.querySelectorAll('[data-gallery-filter]'));
    const cards = Array.from(gallery.querySelectorAll('[data-gallery-type]'));
    const closeButton = dialog.querySelector('[data-gallery-close]');
    const viewerImage = dialog.querySelector('[data-viewer-image]');
    const viewerTitle = dialog.querySelector('[data-viewer-title]');
    const viewerDate = dialog.querySelector('[data-viewer-date]');
    const viewerContext = dialog.querySelector('[data-viewer-context]');
    const viewerCredit = dialog.querySelector('[data-viewer-credit]');
    const viewerSource = dialog.querySelector('[data-viewer-source]');

    filterButtons.forEach(button => {
      const type = button.dataset.galleryFilter;
      const count = type === 'todos'
        ? cards.length
        : cards.filter(card => card.dataset.galleryType === type).length;
      const counter = button.querySelector('[data-gallery-count]');
      if (counter) counter.textContent = String(count);
    });

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.galleryFilter;
        filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        cards.forEach(card => { card.hidden = filter !== 'todos' && card.dataset.galleryType !== filter; });
      });
    });

    gallery.querySelectorAll('[data-gallery-open]').forEach(button => {
      button.addEventListener('click', () => {
        viewerImage.src = button.dataset.image;
        viewerImage.alt = button.querySelector('img')?.alt || button.dataset.title || '';
        viewerTitle.textContent = button.dataset.title || '';
        viewerDate.textContent = button.dataset.date || '';
        viewerContext.textContent = button.dataset.context || '';
        viewerCredit.textContent = button.dataset.credit || '';
        viewerSource.href = button.dataset.source || '#';
        if (typeof dialog.showModal === 'function') dialog.showModal();
      });
    });

    closeButton?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      viewerImage.removeAttribute('src');
    });
  }
})();
