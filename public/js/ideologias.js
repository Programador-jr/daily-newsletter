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
    { id: "economia", name: "Economia", start: "Mais Estado", end: "Mais mercado" },
    { id: "sociedade", name: "Sociedade", start: "Mais mudança", end: "Mais tradição" },
    { id: "poder", name: "Poder", start: "Mais liberdade", end: "Mais autoridade" }
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
      <div class="idea-axis-title"><label for="idea-axis-${axis.id}">${axis.name}</label><output for="idea-axis-${axis.id}">Centro</output></div>
      <div class="idea-axis-scale"><span>${axis.start}</span><input id="idea-axis-${axis.id}" type="range" min="0" max="100" value="50" aria-valuetext="Centro"><span>${axis.end}</span></div>`;
    const input = field.querySelector("input");
    const output = field.querySelector("output");
    const update = () => {
      const value = Number(input.value);
      const position = value < 35 ? axis.start : value > 65 ? axis.end : "Centro";
      output.value = position;
      input.setAttribute("aria-valuetext", position);
    };
    input.addEventListener("input", update);
    controls.append(field);
  });
  axisGrid.after(explorer);
});