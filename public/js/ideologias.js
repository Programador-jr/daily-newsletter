/**
 * Guia de ideologias — renderiza os doze eixos a partir da base compartilhada.
 */
(function () {
  const grid = document.getElementById("guide-axis-grid");
  const eixos = globalThis.AtlasData?.eixos;
  if (!grid || !Array.isArray(eixos)) return;

  grid.replaceChildren(
    ...eixos.map((eixo) => {
      const card = document.createElement("article");
      const label = document.createElement("span");
      label.textContent = eixo.rotulo;
      const poles = document.createElement("strong");
      poles.textContent = eixo.a + " ↔ " + eixo.b;
      const question = document.createElement("p");
      question.textContent = eixo.pergunta;
      card.append(label, poles, question);
      return card;
    })
  );
})();
