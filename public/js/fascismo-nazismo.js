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
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTopic(tabs[nextIndex], true);
    });
  });
})();
