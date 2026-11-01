/**
 * Guia de ideologias — renderiza os doze eixos a partir da base compartilhada.
 */
(function () {
  const grid = document.getElementById("guide-axis-grid");
  const eixos = globalThis.AtlasData?.eixos;
  const icons = globalThis.AxisIcons;
  if (!grid || !Array.isArray(eixos)) return;

  const poleNode = (eixo, pole, text, iconFirst) => {
    const node = document.createElement("span");
    node.className = `axis-pole axis-pole-${pole}`;
    const icon = icons ? icons.create(eixo.id, pole, 16) : null;
    if (icon && iconFirst) node.append(icon);
    node.append(document.createTextNode(text));
    if (icon && !iconFirst) node.append(icon);
    return node;
  };

  const separator = () => {
    const node = document.createElement("span");
    node.className = "axis-pole-sep";
    node.setAttribute("aria-hidden", "true");
    node.textContent = "↔";
    return node;
  };

  grid.replaceChildren(
    ...eixos.map((eixo) => {
      const card = document.createElement("article");
      const label = document.createElement("span");
      label.textContent = eixo.rotulo;
      const poles = document.createElement("strong");
      poles.className = "axis-poles";
      poles.append(
        poleNode(eixo, "a", eixo.a, true),
        separator(),
        poleNode(eixo, "b", eixo.b, false)
      );
      const question = document.createElement("p");
      question.textContent = eixo.pergunta;
      card.append(label, poles, question);
      return card;
    })
  );
})();
