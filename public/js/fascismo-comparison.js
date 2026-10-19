(() => {
  "use strict";

  const tabs = Array.from(document.querySelectorAll("[data-comparison-tab]"));
  const panel = document.getElementById("comparison-panel");
  if (!tabs.length || !panel) return;

  const comparisons = {
    power: {
      label: "Poder e democracia",
      italy: "O regime de Mussolini desmontou as instituições democráticas gradualmente, proibiu a oposição e consolidou uma ditadura de partido único.",
      germany: "Após Hitler ser nomeado chanceler em 1933, o regime destruiu rapidamente as garantias democráticas e concentrou o poder no partido e no líder.",
      common: "Ambos eliminaram a competição política e perseguiram opositores.",
      sources: [
        ["Marcha sobre Roma · Britannica", "https://www.britannica.com/event/March-on-Rome"],
        ["Ascensão nazista ao poder · USHMM", "https://encyclopedia.ushmm.org/content/en/article/the-nazi-rise-to-power"]
      ]
    },
    nationalism: {
      label: "Nacionalismo e propaganda",
      italy: "O fascismo exaltava a unidade nacional, a disciplina, o líder e a ideia de restaurar a grandeza italiana. Propaganda, cerimônias e organizações de massa ajudavam a mobilizar a população.",
      germany: "O nazismo ligava a nação a uma suposta comunidade racial. A propaganda apresentava Hitler como salvador e difundia antissemitismo e teorias conspiratórias.",
      common: "Culto ao líder, propaganda e mobilização de massas foram instrumentos de poder nos dois regimes.",
      sources: [
        ["Fascismo · Britannica", "https://www.britannica.com/topic/fascism"],
        ["Propaganda nazista · USHMM", "https://encyclopedia.ushmm.org/content/en/article/nazi-propaganda"]
      ]
    },
    economy: {
      label: "Economia e trabalho",
      italy: "A economia manteve a propriedade privada, mas o Estado ampliou a direção política, reprimiu sindicatos independentes e promoveu estruturas corporativistas que subordinavam trabalhadores e empregadores ao regime.",
      germany: "O regime manteve empresas privadas, direcionou a economia para o rearmamento e a guerra, destruiu sindicatos independentes e colocou o trabalho sob organizações controladas pelo Estado.",
      common: "Nenhum dos regimes substituiu toda a propriedade privada por uma economia socialista; ambos subordinaram o trabalho e a produção aos objetivos do regime.",
      sources: [
        ["Fascismo · Britannica", "https://www.britannica.com/topic/fascism"],
        ["Ascensão nazista ao poder · USHMM", "https://encyclopedia.ushmm.org/content/en/article/the-nazi-rise-to-power"]
      ]
    },
    race: {
      label: "Racismo e perseguição",
      italy: "O fascismo italiano perseguiu opositores e grupos colonizados. Em 1938, o regime adotou leis raciais antissemitas, aprofundando a perseguição aos judeus.",
      germany: "O racismo biológico e o antissemitismo eram centrais desde a ideologia nazista. As Leis de Nuremberg retiraram direitos dos judeus; a perseguição culminou no Holocausto.",
      common: "Os dois regimes praticaram repressão, mas a ideologia racial e o projeto genocida nazista tiveram papel central e escala própria.",
      sources: [
        ["Leis de Nuremberg · USHMM", "https://encyclopedia.ushmm.org/content/en/article/nuremberg-laws"],
        ["Introdução ao Holocausto · USHMM", "https://encyclopedia.ushmm.org/content/en/article/introduction-to-the-holocaust"]
      ]
    },
    war: {
      label: "Guerra e violência",
      italy: "Milícias fascistas usaram violência para intimidar adversários. O regime também adotou políticas expansionistas, incluindo a invasão da Etiópia em 1935, e entrou na Segunda Guerra Mundial ao lado da Alemanha.",
      germany: "O regime nazista promoveu expansão territorial, iniciou a guerra europeia com a invasão da Polônia em 1939 e organizou perseguições, deportações e assassinatos em massa, incluindo o Holocausto.",
      common: "A violência política e a expansão militar fizeram parte dos dois regimes; os objetivos e os crimes não foram idênticos.",
      sources: [
        ["Fascismo · Britannica", "https://www.britannica.com/topic/fascism"],
        ["Introdução ao Holocausto · USHMM", "https://encyclopedia.ushmm.org/content/en/article/introduction-to-the-holocaust"]
      ]
    }
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function render(key) {
    const item = comparisons[key];
    if (!item) return;
    tabs.forEach(tab => {
      const selected = tab.dataset.comparisonTab === key;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", "comparison-tab-" + key);
    panel.innerHTML =
      '<div class="comparison-regimes">' +
        '<article class="comparison-regime"><span class="eyebrow"><i class="fas fa-landmark" aria-hidden="true"></i> Itália</span><h3>Fascismo</h3><p>' + escapeHtml(item.italy) + '</p></article>' +
        '<article class="comparison-regime"><span class="eyebrow"><i class="fas fa-landmark" aria-hidden="true"></i> Alemanha</span><h3>Nazismo</h3><p>' + escapeHtml(item.germany) + '</p></article>' +
      '</div><p class="comparison-takeaway"><strong>Em comum ou em contraste:</strong> ' + escapeHtml(item.common) + '</p>' +
      '<div class="comparison-sources"><span>Fontes:</span>' + item.sources.map(source => '<a href="' + escapeHtml(source[1]) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(source[0]) + '</a>').join("") + '</div>';
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => render(tab.dataset.comparisonTab));
    tab.addEventListener("keydown", event => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[nextIndex].focus();
      render(tabs[nextIndex].dataset.comparisonTab);
    });
  });

  render("power");
})();