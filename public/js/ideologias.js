document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ideology-accordion").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      document.querySelectorAll(".ideology-accordion[open]").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  const axisGrid = document.querySelector("#esquerda-direita .axis-grid");
  if (!axisGrid) return;

  const axes = [
    {
      id: "economia", name: "Economia", icon: "fa-landmark",
      start: "Mais Estado", end: "Mais mercado",
      leftTitle: "Maior participação do Estado",
      leftText: "A proposta tende a ampliar a atuação pública, por exemplo por meio de serviços, investimento estatal ou regulação econômica.",
      centerTitle: "Combinação de instrumentos",
      centerText: "A proposta pode combinar atuação estatal e mecanismos de mercado. O contexto e a forma de execução fazem diferença.",
      rightTitle: "Maior espaço para o mercado",
      rightText: "A proposta tende a priorizar iniciativa privada, concorrência e decisões descentralizadas, com menor intervenção direta do Estado.",
      example: "Exemplo: ampliar a oferta de saúde pública pode indicar maior atuação estatal; facilitar a entrada de empresas privadas pode dar mais espaço ao mercado."
    },
    {
      id: "sociedade", name: "Sociedade", icon: "fa-people-arrows-left-right",
      start: "Mais mudança", end: "Mais tradição",
      leftTitle: "Maior abertura a mudanças",
      leftText: "A proposta tende a apoiar reformas de costumes, normas sociais ou instituições para responder a novas demandas.",
      centerTitle: "Mudanças seletivas",
      centerText: "A proposta pode preservar algumas práticas e apoiar mudanças em outras. A posição depende do tema específico.",
      rightTitle: "Maior valorização da tradição",
      rightText: "A proposta tende a priorizar continuidade cultural, costumes e instituições existentes, preferindo mudanças graduais ou limitadas.",
      example: "Exemplo: reformar uma regra social pode se aproximar do lado da mudança; manter uma prática tradicional pode se aproximar do lado da tradição."
    },
    {
      id: "poder", name: "Poder", icon: "fa-scale-balanced",
      start: "Mais liberdade", end: "Mais autoridade",
      leftTitle: "Maior ênfase nas liberdades",
      leftText: "A proposta tende a limitar poderes coercitivos e proteger escolhas individuais, direitos civis e mecanismos de controle das autoridades.",
      centerTitle: "Equilíbrio entre direitos e autoridade",
      centerText: "A proposta procura combinar liberdades individuais com poderes públicos limitados por regras, fiscalização e garantias.",
      rightTitle: "Maior ênfase na autoridade",
      rightText: "A proposta tende a ampliar a capacidade de ação das autoridades para impor regras ou manter a ordem. É importante avaliar os limites e controles previstos.",
      example: "Exemplo: ampliar a fiscalização judicial sobre o governo reforça controles; ampliar poderes policiais exige avaliar salvaguardas e responsabilização."
    }
  ];
  const explorer = document.createElement("section");
  explorer.className = "idea-explorer";
  explorer.setAttribute("aria-labelledby", "idea-explorer-title");
  explorer.innerHTML = `
    <div class="idea-explorer-heading">
      <span class="eyebrow">Ferramenta visual</span>
      <h3 id="idea-explorer-title">Entenda a posição de uma ideia</h3>
      <p>Explore dimensões diferentes de uma proposta. Ajuste cada eixo conforme a ideia que está analisando; não existe uma pontuação única que defina toda a posição política.</p>
    </div>
    <div class="idea-explorer-controls"></div>
    <p class="idea-explorer-note" aria-live="polite">As posições são independentes: uma ideia pode combinar tendências diferentes em cada eixo.</p>`;

  const controls = explorer.querySelector(".idea-explorer-controls");
  axes.forEach((axis) => {
    const field = document.createElement("div");
    field.className = "idea-axis-control";
    field.innerHTML = `
      <div class="idea-axis-title">
        <span class="idea-axis-name"><i class="fas ${axis.icon}" aria-hidden="true"></i><label for="idea-axis-${axis.id}">${axis.name}</label></span>
        <output for="idea-axis-${axis.id}">Centro</output>
      </div>
      <div class="idea-axis-scale"><span>${axis.start}</span><input id="idea-axis-${axis.id}" type="range" min="0" max="100" value="50" aria-valuetext="Centro"><span>${axis.end}</span></div>
      <div class="idea-axis-context" aria-live="polite">
        <div class="idea-context-heading"><i class="fas fa-circle-info" aria-hidden="true"></i><strong>${axis.centerTitle}</strong></div>
        <p>${axis.centerText}</p>
        <div class="idea-context-example"><i class="fas fa-lightbulb" aria-hidden="true"></i><p>${axis.example}</p></div>
      </div>`;
    const input = field.querySelector("input");
    const output = field.querySelector("output");
    const contextTitle = field.querySelector(".idea-context-heading strong");
    const contextText = field.querySelector(".idea-axis-context > p");
    const update = () => {
      const value = Number(input.value);
      const side = value < 35 ? "left" : value > 65 ? "right" : "center";
      const position = side === "left" ? axis.start : side === "right" ? axis.end : "Centro";
      output.value = position;
      input.setAttribute("aria-valuetext", position);
      contextTitle.textContent = axis[side + "Title"];
      contextText.textContent = axis[side + "Text"];
    };
    input.addEventListener("input", update);
    controls.append(field);
  });
  axisGrid.after(explorer);
});