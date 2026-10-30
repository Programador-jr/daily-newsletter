document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("ideology-quiz");
  if (!root) return;

  const intro = root.querySelector(".quiz-intro");
  const questionView = document.getElementById("quiz-question-view") || root.querySelector(".quiz-question-view");
  const resultsView = document.getElementById("quiz-results");
  const error = document.getElementById("quiz-error");
  const progress = document.getElementById("quiz-progress");
  const progressSegments = document.getElementById("quiz-progress-segments");
  const progressPercent = document.getElementById("quiz-progress-percent");
  const progressLabel = document.getElementById("quiz-progress-label");
  const axisLabel = document.getElementById("quiz-axis-label");
  const axisIcon = document.getElementById("quiz-axis-icon");
  const questionCard = document.getElementById("quiz-question-card");
  const questionNumber = document.getElementById("quiz-question-number");
  const questionText = document.getElementById("quiz-question");
  const answersField = document.getElementById("quiz-answers");
  const answersLegend = document.getElementById("quiz-answers-legend");
  const backButton = document.getElementById("quiz-back");
  const nextButton = document.getElementById("quiz-next");
  const skipButton = document.getElementById("quiz-skip");
  const autoAdvance = document.getElementById("quiz-auto-advance");
  const autoAdvanceLabel = document.getElementById("quiz-auto-advance-label");
  const helpButton = document.getElementById("quiz-help-button");
  const helpDialog = document.getElementById("quiz-help-dialog");
  const helpContent = document.getElementById("quiz-help-content");
  const helpClose = document.getElementById("quiz-help-close");
  const resultHelpDialog = document.getElementById("result-help-dialog");
  const resultHelpTitle = document.getElementById("result-help-dialog-title");
  const resultHelpContent = document.getElementById("result-help-content");
  const resultHelpClose = document.getElementById("result-help-close");
  const archetypeQuestions = Array.isArray(window.KINGS_ARCHETYPE_QUESTIONS)
    ? window.KINGS_ARCHETYPE_QUESTIONS
    : [];
  const answerChoices = [
    { value: 100, label: "Concordo totalmente", tone: "agree" },
    { value: 75, label: "Concordo", tone: "agree" },
    { value: 50, label: "Nem concordo nem discordo" },
    { value: 25, label: "Discordo", tone: "disagree" },
    { value: 0, label: "Discordo totalmente", tone: "disagree" }
  ];
  let catalog;
  let selectedQuestions = [];
  let answers = [];
  let current = 0;
  let selectedMode = "short";
  let stage = "questions";
  let archetypeIndex = 0;
  let archetypeAnswers = {};
  let archetypeTimer = 0;

  const questionsPerAxis = (mode) => mode === "short" ? 3 : mode === "standard" ? 5 : 20;

  const clearAnswerOptions = () => {
    answersField.querySelectorAll(".quiz-answer-option, .quiz-archetype-option, .quiz-archetype-tile")
      .forEach((option) => option.remove());
  };

  const setOverlayState = (state) => {
    root.dataset.state = state;
  };


  const roundProfile = (values) => values.map((value) => Math.round(value * 10) / 10);

  const legacyToAtlas = (values) => catalog.axes.map((axis, index) =>
    axis.invert ? 100 - values[index] : values[index]);

  const safeDecodeProfile = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("perfil");
      if (!encoded || !/^[A-Za-z0-9_-]{16,160}$/.test(encoded)) return null;
      const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
      const values = JSON.parse(decodeURIComponent(Array.from(binary, (char) =>
        `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")));
      if (!Array.isArray(values) || values.length !== 12 || !values.every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) return null;
      const isAtlasScale = params.get("v") === "2";
      return roundProfile(isAtlasScale ? values : legacyToAtlas(values));
    } catch {
      return null;
    }
  };

  const referenceProfile = () => {
    const params = new URLSearchParams(window.location.search);
    const keys = ["est", "rep", "pod", "imi", "dip", "int", "eco", "con", "com", "rel", "mor", "tec"];
    const values = keys.map((key) => Number(params.get(key)));
    if (keys.some((key) => !params.has(key)) || values.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) return null;
    return roundProfile(legacyToAtlas(values));
  };

  const encodeProfile = (values) => {
    const bytes = new TextEncoder().encode(JSON.stringify(values));
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  };

  const evenlySpaced = (items, count) => {
    if (count >= items.length) return [...items];
    if (count <= 1) return items.length ? [items[Math.floor(items.length / 2)]] : [];
    return Array.from({ length: count }, (_, index) =>
      items[Math.round((index * (items.length - 1)) / (count - 1))]);
  };

  const questionSet = (mode) => {
    const perAxis = questionsPerAxis(mode);
    return catalog.axes.flatMap((axis) => {
      const axisQuestions = catalog.questions.filter((question) => question.axis === axis.id);
      const towardLow = axisQuestions.filter((question) => question.polarity < 0);
      const towardHigh = axisQuestions.filter((question) => question.polarity > 0);
      const lowCount = Math.ceil(perAxis / 2);
      const highCount = perAxis - lowCount;
      const lows = evenlySpaced(towardLow, lowCount);
      const highs = evenlySpaced(towardHigh, highCount);
      const chosen = [];
      for (let index = 0; index < perAxis; index += 1) {
        if (index % 2 === 0 && lows.length) chosen.push(lows.shift());
        else if (highs.length) chosen.push(highs.shift());
        else if (lows.length) chosen.push(lows.shift());
      }
      return chosen.map((question) => ({ ...question, axisName: axis.name }));
    });
  };

  const resultsEmpty = document.getElementById("results-empty");

  const renderAxisGuide = (axes) => {
    const grid = document.getElementById("quiz-axis-guide-grid");
    if (!grid || !Array.isArray(axes)) return;
    const icons = [
      "fa-city", "fa-landmark", "fa-shield-halved", "fa-people-group",
      "fa-jet-fighter", "fa-flag", "fa-building-columns", "fa-sliders",
      "fa-earth-americas", "fa-atom", "fa-heart", "fa-microchip"
    ];
    grid.replaceChildren(...axes.map((axis, index) => {
      const card = document.createElement("article");
      card.className = "quiz-axis-card";
      if (axis.id) card.id = `eixo-${axis.id}`;
      const number = document.createElement("span");
      number.className = "quiz-axis-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("h3");
      title.textContent = axis.name;
      const poles = document.createElement("div");
      poles.className = "quiz-axis-poles";
      const low = document.createElement("span");
      const lowIcon = document.createElement("i");
      lowIcon.className = `fas ${icons[index] || "fa-compass"}`;
      lowIcon.setAttribute("aria-hidden", "true");
      low.append(lowIcon, document.createTextNode(axis.a));
      const arrow = document.createElement("span");
      arrow.textContent = "↔";
      const high = document.createElement("span");
      const highIcon = document.createElement("i");
      highIcon.className = `fas ${icons[(index + 1) % icons.length] || "fa-compass"}`;
      highIcon.setAttribute("aria-hidden", "true");
      high.append(highIcon, document.createTextNode(axis.b));
      poles.append(low, arrow, high);
      const description = document.createElement("p");
      description.textContent = axis.aDesc || axis.description || "Compara duas formas de organizar a vida política.";
      card.append(number, title, poles, description);
      return card;
    }));
  };

  const setError = () => {
    root.hidden = false;
    error.hidden = false;
    intro.hidden = true;
    questionView.hidden = true;
    resultsView.hidden = true;
    if (resultsEmpty) resultsEmpty.hidden = true;
    root.dataset.state = "error";
  };

  const showEmptyState = () => {
    if (!resultsEmpty) return;
    root.hidden = true;
    resultsEmpty.hidden = false;
    root.dataset.state = "empty";
  };

  const renderProgressSegments = (completed, total) => {
    if (!progressSegments) return;
    const segmentCount = Math.min(total, 60);
    const perSegment = total / segmentCount;
    progressSegments.replaceChildren(...Array.from({ length: segmentCount }, (_, index) => {
      const start = index * perSegment;
      const end = start + perSegment;
      const segment = document.createElement("span");
      if (completed >= end) {
        segment.className = "is-complete";
      } else if (completed >= start) {
        if (perSegment > 1) {
          segment.className = "is-partial";
          const fill = document.createElement("i");
          fill.style.width = `${Math.max(6, ((completed - start) / perSegment) * 100)}%`;
          segment.append(fill);
        } else {
          segment.className = "is-current";
        }
      }
      return segment;
    }));
  };

  const renderQuestion = () => {
    const question = selectedQuestions[current];
    stage = "questions";
    progress.max = selectedQuestions.length;
    progress.value = current + 1;
    progressLabel.textContent = `Pergunta ${current + 1} de ${selectedQuestions.length}`;
    progressPercent.textContent = `${Math.round((current / selectedQuestions.length) * 100)}% concluído`;
    questionNumber.textContent = String(current + 1).padStart(2, "0");
    renderProgressSegments(current, selectedQuestions.length);
    axisLabel.textContent = question.axisName;
    axisIcon.className = "fas fa-compass";
    questionText.textContent = question.text;
    backButton.disabled = current === 0;
    nextButton.innerHTML = current === selectedQuestions.length - 1
      ? 'Ver meu perfil <i class="fas fa-arrow-right" aria-hidden="true"></i>'
      : 'Próxima <i class="fas fa-arrow-right" aria-hidden="true"></i>';
    nextButton.disabled = answers[current] === undefined;
    nextButton.hidden = false;
    if (skipButton) skipButton.hidden = true;
    if (autoAdvanceLabel) autoAdvanceLabel.hidden = false;
    questionView?.classList.remove("is-archetype");
    questionCard?.classList.remove("is-archetype");
    answersField.classList.remove("quiz-archetype-options", "is-tiles");
    if (answersLegend) answersLegend.textContent = "Selecione seu grau de concordância";
    clearAnswerOptions();
    progress.setAttribute("aria-label", selectedMode === "short"
      ? "Progresso do questionário rápido"
      : "Progresso do questionário");

    answerChoices.forEach((choice, index) => {
      const label = document.createElement("label");
      label.className = "quiz-answer-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `answer-${current}`;
      input.value = String(choice.value);
      input.checked = answers[current] === choice.value;
      input.setAttribute("aria-label", choice.label);
      input.addEventListener("change", () => {
        answers[current] = choice.value;
        nextButton.disabled = false;
        if (autoAdvance.checked) window.setTimeout(() => nextButton.click(), 180);
      });
      const visibleLabel = document.createElement("span");
      visibleLabel.className = `quiz-answer-label ${choice.tone || "neutral"}`;
      const answerIcon = document.createElement("i");
      answerIcon.className = `fas ${choice.tone === "agree" ? "fa-check" : choice.tone === "disagree" ? "fa-xmark" : "fa-minus"}`;
      answerIcon.setAttribute("aria-hidden", "true");
      const answerText = document.createElement("b");
      answerText.textContent = choice.label;
      visibleLabel.append(answerIcon, answerText);
      label.append(input, visibleLabel);
      answersField.append(label);
      if (index === 0 && answers[current] === undefined) input.tabIndex = 0;
    });
    if (helpButton) helpButton.hidden = !question.help;
    if (helpButton) helpButton.onclick = () => {
      if (!question.help) return;
      helpContent.replaceChildren();
      [["Se você concorda", question.help.agree, question.help.agreeExample, "agree"], ["Se você discorda", question.help.disagree, question.help.disagreeExample, "disagree"], ["Vale lembrar", question.help.note, "", "note"]]
        .filter(([, text]) => text)
        .forEach(([title, text, example, tone]) => {
          const block = document.createElement("article");
          block.className = `quiz-help-block ${tone}`;
          const heading = document.createElement("h3");
          heading.textContent = title;
          const paragraph = document.createElement("p");
          paragraph.textContent = text;
          block.append(heading, paragraph);
          if (example) {
            const exampleText = document.createElement("p");
            const exampleLabel = document.createElement("strong");
            exampleLabel.textContent = "Exemplo: ";
            exampleText.className = "quiz-help-example";
            exampleText.append(exampleLabel, document.createTextNode(example));
            block.append(exampleText);
          }
          helpContent.append(block);
        });
      if (typeof helpDialog.showModal === "function") helpDialog.showModal();
      else helpDialog.setAttribute("open", "");
      helpClose.focus();
    };
    setOverlayState("question");
    requestAnimationFrame(() => questionText.focus());
  };

  const renderArchetypeProgress = () => {
    if (!progressSegments) return;
    const axisSegments = catalog.axes.map(() => {
      const segment = document.createElement("span");
      segment.className = "is-complete";
      return segment;
    });
    const extra = document.createElement("span");
    extra.className = "is-partial";
    const fill = document.createElement("i");
    fill.style.width = `${((archetypeIndex + 1) / archetypeQuestions.length) * 100}%`;
    extra.append(fill);
    progressSegments.replaceChildren(...axisSegments, extra);
  };

  const renderArchetype = () => {
    const question = archetypeQuestions[archetypeIndex];
    if (!question) return;
    stage = "archetype";
    progress.max = selectedQuestions.length + archetypeQuestions.length;
    progress.value = selectedQuestions.length + archetypeIndex + 1;
    progressLabel.textContent = "Identificando seu arquétipo";
    progressPercent.textContent = `${archetypeIndex + 1} de ${archetypeQuestions.length}`;
    progress.setAttribute("aria-label", "Progresso da etapa de arquétipo");
    questionNumber.textContent = String(archetypeIndex + 1).padStart(2, "0");
    renderArchetypeProgress();
    axisLabel.textContent = question.label;
    axisIcon.className = `fas ${question.icon || "fa-compass"}`;
    questionText.textContent = question.text;
    questionView?.classList.add("is-archetype");
    questionCard?.classList.add("is-archetype");
    answersField.classList.add("quiz-archetype-options");
    answersField.classList.toggle("is-tiles", question.layout === "tiles");
    if (answersLegend) answersLegend.textContent = "Escolha uma alternativa";
    if (helpButton) helpButton.hidden = true;
    if (nextButton) nextButton.hidden = true;
    if (skipButton) skipButton.hidden = false;
    if (autoAdvanceLabel) autoAdvanceLabel.hidden = true;
    backButton.disabled = false;
    clearAnswerOptions();

    question.options.forEach((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `archetype-${question.id}`;
      input.value = option.id;
      input.checked = archetypeAnswers[question.id] === option.id;
      const chooseOption = () => {
        archetypeAnswers[question.id] = option.id;
        scheduleArchetypeAdvance();
      };
      // O clique cobre o caso de voltar a uma pergunta já respondida, em que
      // marcar a mesma opção não dispara "change".
      input.addEventListener("click", chooseOption);
      input.addEventListener("change", chooseOption);

      if (question.layout === "tiles") {
        label.className = `quiz-archetype-tile${option.wide ? " is-wide" : ""}`;
        const content = document.createElement("span");
        content.className = "quiz-archetype-tile-content";
        const iconHost = document.createElement("span");
        iconHost.className = "quiz-archetype-tile-icon";
        const icon = document.createElement("i");
        icon.className = `fas ${option.icon || "fa-place-of-worship"}`;
        icon.setAttribute("aria-hidden", "true");
        iconHost.append(icon);
        const text = document.createElement("b");
        text.textContent = option.text;
        content.append(iconHost, text);
        label.append(input, content);
      } else {
        label.className = "quiz-archetype-option";
        const row = document.createElement("span");
        row.className = "quiz-archetype-option-row";
        const letter = document.createElement("span");
        letter.className = "quiz-archetype-letter";
        letter.textContent = option.id;
        letter.setAttribute("aria-hidden", "true");
        const text = document.createElement("b");
        text.className = "quiz-archetype-option-text";
        text.textContent = option.text;
        const indicator = document.createElement("span");
        indicator.className = "quiz-archetype-indicator";
        indicator.setAttribute("aria-hidden", "true");
        row.append(letter, text, indicator);
        label.append(input, row);
      }
      answersField.append(label);
    });
    setOverlayState("archetype");
    requestAnimationFrame(() => questionText.focus());
  };

  const scheduleArchetypeAdvance = () => {
    window.clearTimeout(archetypeTimer);
    archetypeTimer = window.setTimeout(() => {
      archetypeTimer = 0;
      advanceArchetype();
    }, 220);
  };

  const advanceArchetype = () => {
    window.clearTimeout(archetypeTimer);
    archetypeTimer = 0;
    if (archetypeIndex < archetypeQuestions.length - 1) {
      archetypeIndex += 1;
      renderArchetype();
      return;
    }
    finishQuiz();
  };

  const skipArchetype = () => {
    const question = archetypeQuestions[archetypeIndex];
    if (question) delete archetypeAnswers[question.id];
    window.clearTimeout(archetypeTimer);
    archetypeTimer = 0;
    advanceArchetype();
  };

  const enterArchetype = () => {
    if (!archetypeQuestions.length) {
      finishQuiz();
      return;
    }
    archetypeIndex = 0;
    renderArchetype();
  };

  const finishQuiz = () => {
    window.clearTimeout(archetypeTimer);
    archetypeTimer = 0;
    showResults(calculateProfile());
  };

  const calculateProfile = () => {
    const perAxis = questionsPerAxis(selectedMode);
    const legacyProfile = catalog.axes.map((axis) => {
      const axisQuestions = selectedQuestions
        .map((question, index) => ({ question, answer: answers[index] }))
        .filter(({ question }) => question.axis === axis.id);
      const towardHigh = axisQuestions.filter(({ question }) => question.polarity > 0).map(({ answer }) => answer);
      const towardLow = axisQuestions.filter(({ question }) => question.polarity < 0).map(({ answer }) => 100 - answer);
      const groupAverage = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
      const balanced = [groupAverage(towardHigh), groupAverage(towardLow)].filter((value) => value !== null);
      return balanced.length
        ? balanced.reduce((sum, value) => sum + value, 0) / balanced.length
        : 50;
    });

    // No 12 Axes, cada alternativa de arquétipo vale como uma resposta adicional
    // em cada eixo que toca. Os efeitos originais apontam para o polo esquerdo
    // do eixo canônico; a régua interna do questionário usa o complemento.
    // A pergunta de religião não tem efeitos e, por isso, fica fora do cálculo.
    const archetypeEffects = catalog.axes.map(() => []);
    archetypeQuestions.forEach((question) => {
      const selected = question.options.find((option) => option.id === archetypeAnswers[question.id]);
      if (!selected || !selected.effects) return;
      Object.entries(selected.effects).forEach(([axisId, effect]) => {
        const index = catalog.axes.findIndex((axis) => axis.id === axisId);
        if (index >= 0) archetypeEffects[index].push(100 - effect);
      });
    });
    const blendedProfile = legacyProfile.map((value, index) => {
      const effects = archetypeEffects[index];
      if (!effects.length) return value;
      const effectTotal = effects.reduce((sum, effect) => sum + effect, 0);
      return (value * perAxis + effectTotal) / (perAxis + effects.length);
    });
    return roundProfile(legacyToAtlas(blendedProfile));
  };

  const matchScore = (profile, vector) => {
    const center = 50;
    let axisSimilarity = 0;
    let dot = 0;
    let userNorm = 0;
    let targetNorm = 0;
    let userIntensity = 0;
    let targetIntensity = 0;
    let maxDiff = 0;
    profile.forEach((value, index) => {
      const target = vector[index] ?? center;
      const diff = Math.abs(value - target);
      let similarity = Math.max(0, 1 - (diff / 50) ** 2);
      if ((value - center) * (target - center) < 0) {
        similarity *= 1 - 0.45 * Math.tanh(Math.abs(value - center) / 25) * Math.tanh(Math.abs(target - center) / 25);
      }
      axisSimilarity += similarity;
      const userCentered = value - center;
      const targetCentered = target - center;
      dot += userCentered * targetCentered;
      userNorm += userCentered ** 2;
      targetNorm += targetCentered ** 2;
      userIntensity += Math.abs(userCentered);
      targetIntensity += Math.abs(targetCentered);
      maxDiff = Math.max(maxDiff, diff);
    });
    const count = profile.length;
    const augment = count * 8 ** 2;
    const direction = 50 + 50 * ((dot + augment) / Math.sqrt((userNorm + augment) * (targetNorm + augment)));
    const magnitude = 100 - 2 * Math.abs((userIntensity - targetIntensity) / count);
    const outlier = 100 * Math.max(0, 1 - (maxDiff / 100) ** 2.5);
    const score = 0.42 * (100 * axisSimilarity / count) + 0.33 * direction + 0.18 * magnitude + 0.07 * outlier;
    return Math.round(Math.max(0, Math.min(100, score)) * 10) / 10;
  };

  const formatPercent = (value) => `${Number(value.toFixed(1)).toLocaleString("pt-BR")}%`;

  const quantile = (values, position) => {
    if (!values.length) return 50;
    const sorted = [...values].sort((first, second) => first - second);
    const index = (sorted.length - 1) * position;
    const base = Math.floor(index);
    const rest = index - base;
    return sorted[base] + (sorted[base + 1] !== undefined ? (sorted[base + 1] - sorted[base]) * rest : 0);
  };

  const axisDistribution = (axisIndex, value) => {
    const axis = catalog.axes[axisIndex];
    const samples = catalog.profiles.ideologies
      .map((item) => item.axes[axisIndex])
      .filter((sample) => Number.isFinite(sample));
    const median = quantile(samples, 0.5);
    const iqr = quantile(samples, 0.75) - quantile(samples, 0.25);
    const poleHigh = value >= 50;
    return {
      axis,
      value,
      median,
      iqr,
      relative: Math.abs(value - median) / Math.max(iqr, 1),
      pole: poleHigh ? axis.a : axis.b,
      intensity: poleHigh ? value : 100 - value,
      percentile: samples.length
        ? (poleHigh
          ? samples.filter((sample) => sample < value).length
          : samples.filter((sample) => sample > value).length) / samples.length * 100
        : 0
    };
  };

  const valueScore = (item, profile) => {
    const indices = (item.knownAxes || [])
      .map((axisId) => catalog.axes.findIndex((axis) => axis.id === axisId))
      .filter((index) => index >= 0);
    if (!indices.length) return 0;
    // No 12 Axes, valor e perfil compartilham a mesma régua e orientação
    // depois da conversão para o atlas. A comparação é direta e considera
    // apenas os eixos que o valor declara.
    const similarity = indices.reduce((sum, index) => {
      const target = item.axes[index];
      const diff = Math.abs(profile[index] - target);
      return sum + Math.max(0, 1 - (diff / 50) ** 2);
    }, 0);
    return Math.round((100 * similarity / indices.length) * 10) / 10;
  };

  const isUnverifiedImage = (item) => Boolean(item.imageLicenseUnverified) ||
    /não verificada|deve ser conferida/i.test(`${item.imageNote || ""} ${item.logoNote || ""}`);

  const countryName = (id) => {
    if (!id) return "";
    const record = [...catalog.profiles.countries, ...catalog.profiles.regimes].find((item) => item.id === id);
    return record?.name || id.replaceAll("-", " ");
  };

  const CATALOG_TABS = {
    countries: "paises",
    regimes: "paises",
    figures: "personalidades",
    parties: "partidos",
    ideologies: "ideologias",
    values: "valores"
  };

  const catalogProfileUrl = (group, item) => {
    const tab = CATALOG_TABS[group] || "ideologias";
    return `/catalogo-politico?catalogo=${tab}#${encodeURIComponent(item.id)}`;
  };

  const appendRichText = (container, text) => {
    const value = String(text ?? "");
    const normalized = value && /^[a-zà-ÿ]/.test(value)
      ? value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1)
      : value;
    normalized.split(/(\*\*[^*]+\*\*)/g).forEach((part) => {
      if (!part) return;
      if (part.startsWith("**") && part.endsWith("**")) {
        const strong = document.createElement("strong");
        strong.textContent = part.slice(2, -2);
        container.append(strong);
        return;
      }
      container.append(document.createTextNode(part));
    });
  };

  const openResultHelp = ({ title, blocks = [], content = null, link = null }) => {
    if (!resultHelpDialog || !resultHelpTitle || !resultHelpContent) return;
    resultHelpTitle.textContent = title;
    const nodes = blocks.filter(Boolean).map(({ heading, text }) => {
      const block = document.createElement("section");
      block.className = "quiz-help-block";
      if (heading) {
        const headingNode = document.createElement("h3");
        headingNode.textContent = heading;
        block.append(headingNode);
      }
      const paragraph = document.createElement("p");
      appendRichText(paragraph, text);
      block.append(paragraph);
      return block;
    });
    if (content) nodes.push(content);
    if (link) {
      const anchor = document.createElement("a");
      anchor.className = "quiz-result-help-link";
      anchor.href = link.href;
      anchor.textContent = link.label;
      nodes.push(anchor);
    }
    resultHelpContent.replaceChildren(...nodes);
    if (!resultHelpDialog.open) {
      if (typeof resultHelpDialog.showModal === "function") resultHelpDialog.showModal();
      else resultHelpDialog.setAttribute("open", "");
    }
    resultHelpClose?.focus();
  };

  if (resultHelpDialog && resultHelpClose) {
    resultHelpClose.addEventListener("click", () => resultHelpDialog.close());
    resultHelpDialog.addEventListener("click", (event) => {
      if (event.target === resultHelpDialog) resultHelpDialog.close();
    });
  }

  const rankedProfiles = (profile, group) => catalog.profiles[group]
    .map((item) => ({ item, score: matchScore(profile, item.axes) }))
    .sort((first, second) => second.score - first.score);

  const setupManualExplorer = () => {
    const host = document.getElementById("manual-explorer");
    const sliderHost = document.getElementById("manual-sliders");
    const matchHost = document.getElementById("manual-matches");
    const resetButton = document.getElementById("manual-reset");
    if (!host || !sliderHost || !matchHost) return;

    const familyById = new Map((catalog.families || []).map((family) => [family.id, family]));
    const profile = catalog.axes.map(() => 50);

    const renderMatches = () => {
      const ranked = rankedProfiles(profile, "ideologies").slice(0, 5);
      matchHost.replaceChildren(...ranked.map(({ item, score }, index) => {
        const family = familyById.get(item.familia);
        const row = document.createElement("li");
        row.className = "manual-match";
        const link = document.createElement("a");
        link.href = `/catalogo-politico?catalogo=ideologias#${encodeURIComponent(item.id)}`;
        const position = document.createElement("span");
        position.className = "manual-match-position";
        position.textContent = String(index + 1).padStart(2, "0");
        const name = document.createElement("strong");
        name.textContent = item.name || item.nome;
        const meta = document.createElement("span");
        meta.className = "manual-match-family";
        meta.textContent = family?.rotulo || "Corrente política";
        if (family?.cor) meta.style.setProperty("--family", family.cor);
        const value = document.createElement("span");
        value.className = "manual-match-score";
        value.textContent = formatPercent(score);
        link.append(position, name, meta, value);
        row.append(link);
        return row;
      }));
    };

    const sliders = catalog.axes.map((axis, index) => {
      const row = document.createElement("div");
      row.className = "manual-axis";
      const heading = document.createElement("div");
      heading.className = "manual-axis-head";
      const label = document.createElement("label");
      label.htmlFor = `manual-axis-${axis.id}`;
      label.textContent = axis.name;
      const output = document.createElement("output");
      output.htmlFor = label.htmlFor;
      output.textContent = `50% · ${axis.a}`;
      heading.append(label, output);

      const input = document.createElement("input");
      input.type = "range";
      input.id = label.htmlFor;
      input.min = "0";
      input.max = "100";
      input.step = "1";
      input.value = "50";
      input.setAttribute("aria-label", `${axis.name}: de ${axis.a} a ${axis.b}`);
      input.addEventListener("input", () => {
        const value = Number(input.value);
        profile[index] = value;
        output.textContent = `${formatPercent(value)} · ${value >= 50 ? axis.a : axis.b}`;
        renderMatches();
      });

      const poles = document.createElement("div");
      poles.className = "manual-axis-poles";
      const low = document.createElement("span");
      low.textContent = axis.a;
      const high = document.createElement("span");
      high.textContent = axis.b;
      poles.append(low, high);

      row.append(heading, input, poles);
      sliderHost.append(row);
      return input;
    });

    resetButton?.addEventListener("click", () => {
      sliders.forEach((input, index) => {
        input.value = "50";
        profile[index] = 50;
        const output = input.parentElement.querySelector("output");
        if (output) output.textContent = `50% · ${catalog.axes[index].a}`;
      });
      renderMatches();
      sliders[0]?.focus();
    });

    host.hidden = false;
    renderMatches();
  };

  const createProfileHighlights = (profile) => {
    const section = document.createElement("section");
    section.className = "quiz-profile-summary";
    section.setAttribute("aria-label", "Resumo do perfil");

    const closest = rankedProfiles(profile, "ideologies")[0];
    const affinity = document.createElement("article");
    affinity.className = "quiz-profile-affinity";

    const head = document.createElement("div");
    head.className = "quiz-profile-head";
    const identity = document.createElement("div");
    identity.className = "quiz-profile-identity";
    const kicker = document.createElement("div");
    kicker.className = "quiz-profile-kicker";
    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Maior proximidade nesta seleção";
    kicker.append(eyebrow);
    if (closest.item.category) {
      const tag = document.createElement("span");
      tag.className = "quiz-profile-tag";
      tag.textContent = closest.item.category;
      kicker.append(tag);
    }
    const name = document.createElement("h4");
    name.textContent = closest.item.name;
    identity.append(kicker, name);

    const ring = document.createElement("div");
    ring.className = "quiz-profile-ring";
    ring.setAttribute("role", "img");
    ring.setAttribute("aria-label", `Proximidade de ${formatPercent(closest.score)} com ${closest.item.name}`);
    const ringSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ringSvg.setAttribute("viewBox", "0 0 120 120");
    ringSvg.setAttribute("aria-hidden", "true");
    const ringTrack = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ringTrack.setAttribute("class", "quiz-ring-track");
    ["cx", "cy"].forEach((attribute) => ringTrack.setAttribute(attribute, "60"));
    ringTrack.setAttribute("r", "52");
    ringTrack.setAttribute("pathLength", "100");
    const ringValue = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ringValue.setAttribute("class", "quiz-ring-value");
    ["cx", "cy"].forEach((attribute) => ringValue.setAttribute(attribute, "60"));
    ringValue.setAttribute("r", "52");
    ringValue.setAttribute("pathLength", "100");
    ringValue.style.strokeDasharray = `${Math.max(0, Math.min(100, Number(closest.score) || 0))} 100`;
    ringSvg.append(ringTrack, ringValue);
    const ringText = document.createElement("div");
    const percentage = document.createElement("strong");
    percentage.textContent = formatPercent(closest.score);
    const ringLabel = document.createElement("small");
    ringLabel.textContent = "match";
    ringText.append(percentage, ringLabel);
    ring.append(ringSvg, ringText);
    head.append(identity, ring);

    const body = document.createElement("div");
    body.className = "quiz-profile-body";
    const quote = document.createElement("figure");
    quote.className = "quiz-profile-quote";
    const quoteMark = document.createElement("span");
    quoteMark.className = "quiz-profile-quote-mark";
    quoteMark.setAttribute("aria-hidden", "true");
    quoteMark.textContent = "“";
    const quoteBody = document.createElement("div");
    const quoteLabel = document.createElement("p");
    quoteLabel.className = "eyebrow";
    quoteLabel.textContent = "Uma frase que descreve";
    const blockquote = document.createElement("blockquote");
    blockquote.textContent = closest.item.phrase || closest.item.summary || closest.item.description || "";
    quoteBody.append(quoteLabel, blockquote);
    quote.append(quoteMark, quoteBody);
    body.append(quote);

    const catalogLink = document.createElement("a");
    catalogLink.className = "quiz-profile-source";
    catalogLink.href = catalogProfileUrl("ideologies", closest.item);
    catalogLink.textContent = "Ver ficha completa no catálogo";
    body.append(catalogLink);

    affinity.append(head, body);
    section.append(affinity);
    return section;
  };

  const createDistinctionScale = (entry) => {
    const { axis, value, median, pole, intensity } = entry;
    const scale = document.createElement("div");
    scale.className = "quiz-distinction-scale";
    scale.setAttribute("role", "img");
    scale.setAttribute("aria-label", `${axis.name}: você em ${formatPercent(intensity)} rumo a ${pole}; mediana das ideologias em ${formatPercent(100 - median)} rumo a ${axis.b}.`);

    const medianPosition = Math.max(0, Math.min(100, 100 - median));
    const userPosition = Math.max(0, Math.min(100, 100 - value));
    const track = document.createElement("span");
    track.className = "quiz-distinction-track";
    const fill = document.createElement("span");
    fill.className = "quiz-distinction-bar";
    fill.style.left = `${Math.min(medianPosition, userPosition)}%`;
    fill.style.width = `${Math.abs(medianPosition - userPosition)}%`;
    const medianMark = document.createElement("span");
    medianMark.className = "quiz-distinction-median";
    medianMark.style.left = `${medianPosition}%`;
    medianMark.setAttribute("aria-hidden", "true");
    const userMark = document.createElement("span");
    userMark.className = "quiz-distinction-you";
    userMark.style.left = `${userPosition}%`;
    userMark.setAttribute("aria-hidden", "true");
    track.append(fill, medianMark, userMark);

    const legend = document.createElement("div");
    legend.className = "quiz-distinction-legend";
    const medianLabel = document.createElement("span");
    const medianDot = document.createElement("i");
    medianDot.className = "is-median";
    medianDot.setAttribute("aria-hidden", "true");
    medianLabel.append(medianDot, document.createTextNode("Mediana das ideologias"));
    const youLabel = document.createElement("span");
    const youDot = document.createElement("i");
    youDot.className = "is-you";
    youDot.setAttribute("aria-hidden", "true");
    youLabel.append(youDot, document.createTextNode("Você"));
    legend.append(medianLabel, youLabel);

    const poles = document.createElement("div");
    poles.className = "quiz-distinction-poles";
    const low = document.createElement("span");
    low.textContent = axis.a;
    const high = document.createElement("span");
    high.textContent = axis.b;
    poles.append(low, high);

    scale.append(track, legend, poles);
    return scale;
  };

  const createDistinctionCard = (entry, kind, rank) => {
    const card = document.createElement("article");
    card.className = `quiz-distinction-card${kind === "unusual" ? " is-strong" : ""}`;

    const top = document.createElement("div");
    top.className = "quiz-distinction-top";
    const kicker = document.createElement("span");
    kicker.className = "quiz-distinction-kicker";
    kicker.textContent = kind === "unusual" ? "Sua posição mais incomum" : "Sua posição mais comum";
    const pole = document.createElement("span");
    pole.className = "quiz-distinction-pole";
    pole.textContent = `${entry.pole} ${formatPercent(entry.intensity)}`;
    top.append(kicker, pole);

    const title = document.createElement("h3");
    title.textContent = entry.axis.name;

    const body = document.createElement("div");
    body.className = "quiz-distinction-body";
    const highlighted = document.createElement("p");
    highlighted.className = "quiz-distinction-big";
    const balanced = Math.abs(entry.value - 50) < 2.5;
    const atMedian = Math.abs(entry.value - entry.median) <= 2.5;

    if (kind === "unusual") {
      if (balanced) {
        const label = document.createElement("strong");
        label.textContent = "No centro";
        highlighted.append(label);
      } else {
        const number = document.createElement("strong");
        number.textContent = entry.percentile >= 99.5 ? "100" : String(Math.round(entry.percentile));
        const suffix = document.createElement("small");
        suffix.textContent = "%";
        highlighted.append(number, suffix);
      }
    } else {
      const label = document.createElement("strong");
      label.textContent = atMedian ? "Na mediana" : balanced ? "No centro" : "Perto da mediana";
      highlighted.append(label);
    }

    const caption = document.createElement("p");
    caption.className = "quiz-distinction-cap";
    if (kind === "unusual") {
      if (balanced) {
        caption.textContent = `Sua posição em ${entry.axis.name} é de meio-termo. Mesmo assim, ela está mais para ${entry.pole.toLowerCase()} do que ${Math.round(entry.percentile)}% das ideologias do catálogo.`;
      } else if (entry.percentile >= 99.5) {
        caption.textContent = `Nenhuma ideologia do catálogo puxa tanto para ${entry.pole.toLowerCase()} quanto você.`;
      } else {
        caption.textContent = `Você puxa mais para ${entry.pole.toLowerCase()} do que ${Math.round(entry.percentile)}% das ideologias do catálogo.`;
      }
    } else {
      caption.textContent = balanced
        ? `Você fica no centro em ${entry.axis.name}, e o catálogo também. É onde seu perfil menos se distingue.`
        : `Sua posição em ${entry.axis.name} é praticamente a mediana do catálogo.`;
    }

    const note = document.createElement("p");
    note.className = "quiz-distinction-note";
    if (kind === "unusual") {
      note.textContent = rank === 1
        ? `De todos os 12 eixos, ${entry.axis.name} é onde você mais se afasta do conjunto. É o traço que mais te diferencia.`
        : "";
    } else {
      note.textContent = `Aqui você está em terreno comum. Não puxa para ${entry.pole.toLowerCase()} nem para o polo oposto.`;
    }
    if (!note.textContent) note.remove();

    body.append(highlighted, caption, note);
    card.append(top, title, body, createDistinctionScale(entry));
    return card;
  };

  const createDistinction = (profile) => {
    const entries = profile.map((value, index) => axisDistribution(index, value));
    const unusual = [...entries].sort((first, second) => second.relative - first.relative)[0];
    const common = [...entries].sort((first, second) => first.relative - second.relative)[0];

    const section = document.createElement("section");
    section.className = "quiz-panel quiz-distinction";
    section.id = "assinatura";
    section.setAttribute("aria-labelledby", "assinatura-title");

    const title = document.createElement("h2");
    title.className = "quiz-panel-title";
    title.id = "assinatura-title";
    title.textContent = "O que te distingue";

    const lead = document.createElement("p");
    lead.className = "quiz-panel-lead";
    lead.textContent = "Onde seu perfil mais se afasta — e onde ele mais se aproxima — do conjunto das ideologias do catálogo.";

    const grid = document.createElement("div");
    grid.className = "quiz-distinction-grid";
    grid.append(
      createDistinctionCard(unusual, "unusual", 1),
      createDistinctionCard(common, "common", 2)
    );

    const method = document.createElement("p");
    method.className = "quiz-distinction-caption";
    method.textContent = `Mediana e intervalo interquartil calculados sobre ${catalog.profiles.ideologies.length} ideologias. O percentil indica quantas delas estão menos próximas do polo destacado.`;

    section.append(title, lead, grid, method);
    return section;
  };

  const createAreasSection = (profile) => {
    const areaById = new Map((catalog.areas || []).map((area) => [area.id, area]));
    const ranked = rankedProfiles(profile, "figures");
    const general = ranked.slice(0, 8);
    const byArea = new Map();
    ranked.forEach((entry) => {
      if (!byArea.has(entry.item.area)) byArea.set(entry.item.area, entry);
    });
    const byAreaRanked = [...byArea.values()].sort((first, second) => second.score - first.score);

    const section = document.createElement("section");
    section.className = "quiz-panel quiz-areas";
    section.id = "areas";
    section.setAttribute("aria-labelledby", "areas-title");

    const title = document.createElement("h2");
    title.className = "quiz-panel-title";
    title.id = "areas-title";
    const lead = document.createElement("p");
    lead.className = "quiz-panel-lead";

    const tabs = document.createElement("div");
    tabs.className = "quiz-areas-tabs";
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Modo de exibição das personalidades");

    const panel = document.createElement("div");
    panel.className = "quiz-areas-panel";
    panel.id = "areas-panel";
    panel.setAttribute("role", "tabpanel");
    panel.tabIndex = 0;
    const list = document.createElement("ol");
    list.className = "quiz-rank";
    panel.append(list);

    const renderRows = (entries) => {
      list.replaceChildren(...entries.map((entry, index) => {
        const area = areaById.get(entry.item.area);
        const row = document.createElement("li");
        row.className = "quiz-rank-row";
        if (area?.cor) row.style.setProperty("--area-color", area.cor);

        const number = document.createElement("span");
        number.className = "quiz-rank-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const avatar = document.createElement("span");
        avatar.className = "quiz-rank-avatar";
        const fallback = document.createElement("span");
        fallback.textContent = cardInitials(entry.item.name);
        fallback.setAttribute("aria-hidden", "true");
        if (entry.item.imagePath && !isUnverifiedImage(entry.item)) {
          const image = document.createElement("img");
          image.src = entry.item.imagePath;
          image.alt = `Retrato de ${entry.item.name}`;
          image.loading = "lazy";
          image.decoding = "async";
          image.addEventListener("error", () => image.replaceWith(fallback), { once: true });
          avatar.append(image);
        } else {
          avatar.append(fallback);
        }

        const info = document.createElement("div");
        info.className = "quiz-rank-info";
        const name = document.createElement("strong");
        name.textContent = entry.item.name;
        const areaLabel = document.createElement("small");
        areaLabel.textContent = entry.item.areaLabel || area?.rotulo || "Personalidade";
        const bar = document.createElement("span");
        bar.className = "quiz-rank-bar";
        bar.setAttribute("role", "img");
        bar.setAttribute("aria-label", `${entry.item.name}: ${formatPercent(entry.score)} de compatibilidade`);
        const fill = document.createElement("i");
        fill.style.width = `${Math.max(0, Math.min(100, entry.score))}%`;
        bar.append(fill);
        info.append(name, areaLabel, bar);

        const score = document.createElement("span");
        score.className = "quiz-rank-score";
        score.textContent = formatPercent(entry.score);

        row.append(number, avatar, info, score);
        return row;
      }));
    };

    const modes = [
      { key: "general", label: "Compatibilidade geral" },
      { key: "area", label: "Área de atuação" }
    ];
    const buttons = modes.map((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-areas-tab";
      button.id = `areas-tab-${mode.key}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "areas-panel");
      button.textContent = mode.label;
      return button;
    });

    const selectMode = (key, focus = false) => {
      const activeIndex = modes.findIndex((mode) => mode.key === key);
      buttons.forEach((button, index) => {
        const active = index === activeIndex;
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        if (active && focus) button.focus();
      });
      panel.setAttribute("aria-labelledby", buttons[activeIndex].id);
      if (key === "general") {
        title.textContent = "Os mais próximos dos seus resultados";
        lead.textContent = "As oito personalidades de maior compatibilidade com o seu perfil.";
        renderRows(general);
      } else {
        title.textContent = "Os mais próximos por área de atuação";
        lead.textContent = "A personalidade mais próxima em cada uma das oito áreas de atuação.";
        renderRows(byAreaRanked);
      }
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => selectMode(modes[index].key));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = buttons.length - 1;
        if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
        else if (event.key === "Home") next = 0;
        selectMode(modes[next].key, true);
      });
    });

    tabs.append(...buttons);
    section.append(title, lead, tabs, panel);
    selectMode("general");
    return section;
  };

  const createValuesSection = (profile) => {
    const groups = Array.isArray(catalog.valueGroups) ? catalog.valueGroups : [];
    const picks = groups.map((group) => {
      const candidates = catalog.profiles.values
        .filter((item) => item.groupId === group.id)
        .map((item) => ({ item, score: valueScore(item, profile) }))
        .sort((first, second) => second.score - first.score);
      return candidates[0] ? { group, ...candidates[0] } : null;
    }).filter(Boolean);
    if (!picks.length) return null;

    const section = document.createElement("section");
    section.className = "quiz-panel quiz-values";
    section.id = "valores";
    section.setAttribute("aria-labelledby", "valores-title");

    const title = document.createElement("h2");
    title.className = "quiz-panel-title";
    title.id = "valores-title";
    title.textContent = "Seus valores";

    const lead = document.createElement("p");
    lead.className = "quiz-panel-lead";
    lead.textContent = "Em cada família de valores, a posição que mais se aproxima das suas respostas.";

    const grid = document.createElement("div");
    grid.className = "quiz-values-grid";
    picks.forEach(({ group, item, score }) => {
      const card = document.createElement("article");
      card.className = "quiz-value-card";
      const groupLabel = document.createElement("span");
      groupLabel.className = "quiz-value-group";
      groupLabel.textContent = group.label;
      const name = document.createElement("h3");
      name.textContent = item.name;
      const summary = document.createElement("p");
      summary.textContent = item.summary || item.description || "";
      const foot = document.createElement("div");
      foot.className = "quiz-value-foot";
      const bar = document.createElement("span");
      bar.className = "quiz-value-bar";
      bar.setAttribute("role", "img");
      bar.setAttribute("aria-label", `${group.label}: ${item.name}, ${formatPercent(score)} de afinidade`);
      const fill = document.createElement("span");
      fill.style.width = `${Math.max(0, Math.min(100, score))}%`;
      bar.append(fill);
      const scoreLabel = document.createElement("span");
      scoreLabel.className = "quiz-value-score";
      const strong = document.createElement("strong");
      strong.textContent = formatPercent(score);
      scoreLabel.append(strong, document.createTextNode(" de afinidade"));
      foot.append(bar, scoreLabel);
      card.append(groupLabel, name, summary, foot);
      grid.append(card);
    });

    const method = document.createElement("p");
    method.className = "quiz-values-caption";
    method.textContent = "Cada valor é comparado apenas nos eixos que declara; os demais ficam de fora. O percentual resume a proximidade entre suas respostas e o valor.";

    section.append(title, lead, grid, method);
    return section;
  };

  const createAxisRow = (axis, value) => {
    const row = document.createElement("div");
    row.className = "quiz-result-axis";
    if (axis.id) row.dataset.axis = axis.id;
    const balanced = Math.abs(value - 50) < 7.5;
    const leansA = value >= 50;
    const axisColor = balanced ? "#94a3b8" : (leansA ? axis.aColor : axis.bColor) || "var(--primary)";
    row.style.setProperty("--axis-color", axisColor);
    row.classList.add(balanced ? "is-balanced" : leansA ? "leans-a" : "leans-b");

    const heading = document.createElement("div");
    heading.className = "quiz-result-axis-heading";
    const name = document.createElement("strong");
    name.textContent = axis.name;
    const help = document.createElement("button");
    help.type = "button";
    help.className = "quiz-help-trigger quiz-axis-help";
    help.setAttribute("aria-label", `Entender o eixo ${axis.name}`);
    help.title = "Entender este eixo";
    const helpIcon = document.createElement("span");
    helpIcon.className = "quiz-help-icon";
    helpIcon.setAttribute("aria-hidden", "true");
    helpIcon.textContent = "?";
    help.append(helpIcon);
    help.addEventListener("click", () => {
      openResultHelp({
        title: `Eixo · ${axis.name}`,
        blocks: [
          axis.description ? { heading: "O que mede", text: axis.description } : null,
          axis.explanation?.topics ? { heading: "Temas avaliados", text: axis.explanation.topics } : null,
          axis.explanation?.operationalization
            ? { heading: "Como as afirmações medem o eixo", text: axis.explanation.operationalization }
            : null
        ],
        link: {
          href: `/teste-politico${axis.id ? `#eixo-${encodeURIComponent(axis.id)}` : "#guia-eixos"}`,
          label: "Ver no guia dos 12 eixos"
        }
      });
    });
    const nameWrap = document.createElement("span");
    nameWrap.className = "quiz-result-axis-name";
    nameWrap.append(name, help);
    const percent = document.createElement("span");
    percent.className = "quiz-result-axis-percent";
    percent.textContent = formatPercent(value);
    heading.append(nameWrap, percent);

    const scale = document.createElement("div");
    scale.className = "quiz-result-scale";
    scale.setAttribute("role", "img");
    scale.setAttribute("aria-label", `${axis.name}: ${formatPercent(value)} entre ${axis.a} e ${axis.b}`);
    const position = 100 - value;
    const fill = document.createElement("span");
    fill.className = "quiz-result-scale-fill";
    fill.style.left = `${Math.min(50, position)}%`;
    fill.style.width = `${Math.abs(50 - position)}%`;
    const marker = document.createElement("span");
    marker.className = "quiz-result-scale-marker";
    marker.style.left = `${position}%`;
    scale.append(fill, marker);

    const poles = document.createElement("div");
    poles.className = "quiz-result-poles";
    const a = document.createElement("span");
    a.textContent = axis.a;
    const b = document.createElement("span");
    b.textContent = axis.b;
    if (!balanced && leansA) a.classList.add("is-win");
    if (!balanced && !leansA) b.classList.add("is-win");
    poles.append(a, b);

    row.append(heading, scale, poles);
    return row;
  };

  const COMPASS_REGION_META = {
    "esq-radical": { base: "#830214", bg: "#ECD5D8", saturation: 85, lightness: 74 },
    terceira: { base: "#4B2A63", bg: "#E2D5EC", saturation: 65, lightness: 78 },
    "ext-direita": { base: "#001743", bg: "#D5DAE6", saturation: 85, lightness: 66 },
    esquerda: { base: "#035732", bg: "#D5ECE2", saturation: 65, lightness: 72 },
    centro: { base: "#4B5058", bg: "#DDE0E3", saturation: 10, lightness: 80 },
    direita: { base: "#2D4778", bg: "#D6E0F2", saturation: 90, lightness: 77 },
    anarquismo: { base: "#2B2B2B", bg: "#E2DFD8", saturation: 0, lightness: 72 },
    libertario: { base: "#946201", bg: "#F0E4C8", saturation: 90, lightness: 68, hue: 47 }
  };
  const COMPASS_SPECTRUM_LABELS = {
    "esq-radical": "Esquerda radical",
    esquerda: "Esquerda",
    centro: "Centrista",
    direita: "Direita",
    "ext-direita": "Extrema direita",
    terceira: "Terceira posição",
    libertario: "Libertário",
    anarquismo: "Anarquista"
  };
  const COMPASS_SOCIAL_LABELS = {
    veryProgressive: "Fortemente progressistas",
    progressive: "Progressistas",
    moderate: "Moderados",
    traditional: "Tradicionalistas",
    veryTraditional: "Fortemente tradicionalistas"
  };
  const COMPASS_NOTE_HINTS = {
    terceira: "A Terceira posição une Estado forte a nação e tradição. A bússola mede economia e poder; nação, moral e religião ficam de fora.",
    "ext-direita": "A Extrema direita se define por hierarquia e identidade. A bússola mede economia e poder; moral, religião e nação ficam de fora.",
    "esq-radical": "A Esquerda radical se define por revolução e coletivização. A bússola mede economia e poder; o projeto revolucionário fica de fora.",
    libertarian: "Sua ideologia fica na divisa entre duas regiões. A bússola mede economia e poder, e uma diferença pequena em um deles decide o lado.",
    generic: "A bússola mede 5 dos 12 eixos; os outros 7 ficam de fora."
  };
  const COMPASS_REGION_RECTS = [
    { key: "esq-radical", x: [0, 3], y: [0, 3] },
    { key: "terceira", x: [3, 6], y: [0, 3] },
    { key: "ext-direita", x: [6, 9], y: [0, 3] },
    { key: "esquerda", x: [0, 3], y: [3, 7] },
    { key: "centro", x: [3, 6], y: [3, 7] },
    { key: "direita", x: [6, 9], y: [3, 7] },
    { key: "anarquismo", x: [0, 4.5], y: [7, 9] },
    { key: "libertario", x: [4.5, 9], y: [7, 9] }
  ];

  const compassHexToRgb = (value) => {
    const match = /^#([0-9a-f]{6})$/i.exec(value || "");
    if (!match) return [16, 16, 16];
    const number = parseInt(match[1], 16);
    return [16, 8, 0].map((shift) => (number >> shift) & 255);
  };

  const compassRgb = (channels) => `rgb(${channels.map((value) => Math.round(value)).join(",")})`;

  const compassMix = (first, second, amount) => first.map((value, index) =>
    value + (second[index] - value) * amount);

  const compassMixMany = (first, second, third, amount) => amount < 0.5
    ? compassMix(first, second, amount * 2)
    : compassMix(second, third, (amount - 0.5) * 2);

  const compassHue = ([red, green, blue]) => {
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    if (max === min) return 0;
    const delta = max - min;
    const result = max === red
      ? ((green - blue) / delta) % 6
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;
    return ((result * 60) + 360) % 360;
  };

  const compassHslToRgb = (hue, saturation, lightness) => {
    const chroma = (saturation / 100) * Math.min(lightness / 100, 1 - lightness / 100);
    const channel = (offset) => {
      const position = (offset + hue / 30) % 12;
      return (lightness / 100 - chroma * Math.max(-1, Math.min(position - 3, Math.min(9 - position, 1)))) * 255;
    };
    return [channel(0), channel(8), channel(4)];
  };

  const compassRegionColor = (key) => {
    const meta = COMPASS_REGION_META[key] || COMPASS_REGION_META.centro;
    const hue = meta.hue ?? compassHue(compassHexToRgb(meta.base));
    return compassHslToRgb(hue, meta.saturation, meta.lightness);
  };

  const compassGridColor = (x, y) => {
    const [centerX, centerY] = [x + 0.5, y + 0.5];
    const total = [0, 0, 0];
    let weight = 0;
    COMPASS_REGION_RECTS.forEach((region) => {
      const distanceX = Math.max(region.x[0] - centerX, 0, centerX - region.x[1]);
      const distanceY = Math.max(region.y[0] - centerY, 0, centerY - region.y[1]);
      const influence = Math.exp(-(distanceX ** 2 + distanceY ** 2) / (2 * 0.45 ** 2));
      if (influence < 0.03) return;
      weight += influence;
      compassRegionColor(region.key).forEach((channel, index) => {
        total[index] += channel * influence;
      });
    });
    return compassRgb(total.map((channel) => channel / weight));
  };

  const COMPASS_GRID_COLORS = Array.from({ length: 81 }, (_, index) =>
    compassGridColor(index % 9, Math.floor(index / 9)));
  const COMPASS_STRIP_COLORS = Array.from({ length: 9 }, (_, index) => {
    const pink = compassMix(compassHexToRgb("#D23E84"), [255, 255, 255], 0.72);
    const gray = compassMix([123, 127, 134], [255, 255, 255], 0.72);
    const brown = compassMix(compassHexToRgb("#74502C"), [255, 255, 255], 0.72);
    return compassRgb(compassMixMany(pink, gray, brown, index / 8));
  });

  const normalizeCompassRegion = (value) => {
    const key = String(value || "").trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const map = {
      "esquerda radical": "esq-radical",
      esquerda: "esquerda",
      centro: "centro",
      direita: "direita",
      "extrema-direita": "ext-direita",
      "extrema direita": "ext-direita",
      "terceira posicao": "terceira",
      libertario: "libertario",
      anarquismo: "anarquismo",
      anarquista: "anarquismo"
    };
    return map[key] || "centro";
  };

  const compassCell = (value) => Math.max(0, Math.min(8, Math.floor((value / 100) * 9)));

  const compassRegionFor = (right, authoritarian) => {
    const x = compassCell(right);
    const y = compassCell(100 - authoritarian);
    if (y <= 2) return x <= 2 ? "esq-radical" : x <= 5 ? "terceira" : "ext-direita";
    if (y <= 6) return x <= 2 ? "esquerda" : x <= 5 ? "centro" : "direita";
    return x <= 3 ? "anarquismo" : x >= 5 ? "libertario" : right < 50 ? "anarquismo" : "libertario";
  };

  const compassCenterSide = (spectrumKey, regionKey) => {
    if (spectrumKey === regionKey) return null;
    const pair = [spectrumKey, regionKey];
    if (!pair.includes("centro")) return null;
    if (pair.includes("esquerda")) return "esquerda";
    if (pair.includes("direita")) return "direita";
    return null;
  };

  const compassSocialKey = (traditional) => {
    if (traditional < 20) return "veryProgressive";
    if (traditional < 40) return "progressive";
    if (traditional <= 60) return "moderate";
    if (traditional <= 80) return "traditional";
    return "veryTraditional";
  };

  const compassSocialColor = (traditional) => compassRgb(compassMixMany(
    compassHexToRgb("#D23E84"),
    [123, 127, 134],
    compassHexToRgb("#74502C"),
    traditional / 100
  ));

  const compassMarkerColor = (spectrumKey, regionKey) => {
    if (spectrumKey === regionKey) return null;
    if (spectrumKey !== "centro" && regionKey !== "centro") return null;
    const other = spectrumKey === "centro" ? regionKey : spectrumKey;
    return compassRgb(compassMix(
      compassHexToRgb(COMPASS_REGION_META.centro.base),
      compassHexToRgb((COMPASS_REGION_META[other] || COMPASS_REGION_META.centro).base),
      0.5
    ));
  };

  const compassNoteHint = (spectrumKey, regionKey) => {
    if (spectrumKey === regionKey || compassCenterSide(spectrumKey, regionKey)) return null;
    const pair = [spectrumKey, regionKey];
    if (pair.includes("terceira")) return "terceira";
    if (pair.includes("ext-direita")) return "ext-direita";
    if (pair.includes("esq-radical")) return "esq-radical";
    if (pair.includes("anarquismo") || pair.includes("libertario")) return "libertarian";
    return "generic";
  };

  const computeCompass = (profile, category) => {
    const axisValue = (id) => {
      const index = catalog.axes.findIndex((axis) => axis.id === id);
      return index >= 0 ? profile[index] : 50;
    };
    const economy = axisValue("economia");
    const control = axisValue("controle");
    const power = axisValue("poder");
    const representation = axisValue("representacao");
    const structure = axisValue("estrutura");
    const moral = axisValue("moral");
    const right = Math.max(0, Math.min(100, 0.6 * economy + 0.4 * control));
    const authoritarian = Math.max(0, Math.min(100, ((100 - power) + representation + structure) / 3));
    const traditional = Math.max(0, Math.min(100, moral));
    const regionKey = compassRegionFor(right, authoritarian);
    const spectrumKey = normalizeCompassRegion(category);
    const centerSideKey = compassCenterSide(spectrumKey, regionKey);
    const socialKey = compassSocialKey(traditional);
    const markerColor = compassMarkerColor(spectrumKey, regionKey) || COMPASS_REGION_META[spectrumKey].base;
    return {
      right,
      authoritarian,
      traditional,
      regionKey,
      region: COMPASS_REGION_META[regionKey],
      spectrumKey,
      spectrum: COMPASS_REGION_META[spectrumKey],
      centerSideKey,
      sentenceLabel: centerSideKey === "esquerda"
        ? "Centro-esquerda"
        : centerSideKey === "direita"
          ? "Centro-direita"
          : COMPASS_SPECTRUM_LABELS[spectrumKey],
      sentenceColor: COMPASS_REGION_META[centerSideKey || spectrumKey].base,
      socialKey,
      socialLabel: COMPASS_SOCIAL_LABELS[socialKey],
      socialColor: compassSocialColor(traditional),
      markerColor,
      noteHint: compassNoteHint(spectrumKey, regionKey)
    };
  };

  const createCompassSection = (compass) => {
    const section = document.createElement("section");
    section.className = "quiz-panel quiz-compass";
    section.id = "bussola";
    section.setAttribute("aria-labelledby", "bussola-title");

    const title = document.createElement("h2");
    title.className = "quiz-panel-title";
    title.id = "bussola-title";
    title.textContent = "Bússola política";

    const body = document.createElement("div");
    body.className = "quiz-compass-body";

    const chart = document.createElement("div");
    chart.className = "quiz-compass-chart";
    chart.setAttribute("role", "img");
    chart.setAttribute("aria-label", `Sua posição: ${Math.round(compass.right)}% rumo à direita, ${Math.round(compass.authoritarian)}% rumo ao autoritarismo e ${Math.round(compass.traditional)}% rumo ao tradicionalismo.`);
    const label = (text, modifier) => {
      const node = document.createElement("span");
      node.className = `quiz-compass-lbl ${modifier}`;
      node.textContent = text;
      return node;
    };
    const grid = document.createElement("div");
    grid.className = "quiz-compass-grid";
    COMPASS_GRID_COLORS.forEach((color) => {
      const cell = document.createElement("span");
      cell.style.background = color;
      grid.append(cell);
    });
    const xAxis = document.createElement("i");
    xAxis.className = "quiz-compass-axis is-x";
    xAxis.setAttribute("aria-hidden", "true");
    const yAxis = document.createElement("i");
    yAxis.className = "quiz-compass-axis is-y";
    yAxis.setAttribute("aria-hidden", "true");
    const marker = document.createElement("span");
    marker.className = "quiz-compass-x";
    marker.style.left = `${Math.max(4, Math.min(96, compass.right))}%`;
    marker.style.top = `${Math.max(4, Math.min(96, 100 - compass.authoritarian))}%`;
    marker.style.background = compass.markerColor;
    marker.setAttribute("aria-hidden", "true");
    grid.append(xAxis, yAxis, marker);
    chart.append(
      label("Autoritarismo", "is-top"),
      label("Esquerda", "is-left"),
      grid,
      label("Direita", "is-right"),
      label("Anarquismo", "is-bottom")
    );

    const read = document.createElement("div");
    read.className = "quiz-compass-read";
    const sentence = document.createElement("p");
    sentence.className = "quiz-compass-sentence";
    const spectrum = document.createElement("span");
    spectrum.className = "quiz-compass-spectrum";
    spectrum.style.setProperty("--compass-spectrum", compass.sentenceColor);
    spectrum.textContent = compass.sentenceLabel;
    const connector = document.createElement("span");
    connector.className = "quiz-compass-conn";
    connector.textContent = " com valores sociais ";
    const social = document.createElement("mark");
    social.className = "quiz-compass-mark";
    social.style.background = compass.socialColor;
    social.textContent = compass.socialLabel;
    sentence.append(spectrum, connector, social);

    const bar = document.createElement("div");
    bar.className = "quiz-compass-bar";
    bar.setAttribute("aria-hidden", "true");
    const barLabels = document.createElement("div");
    barLabels.className = "quiz-compass-bar-lbls";
    const progressive = document.createElement("span");
    progressive.textContent = "Progressista";
    const traditional = document.createElement("span");
    traditional.textContent = "Tradicionalista";
    barLabels.append(progressive, traditional);
    const strip = document.createElement("div");
    strip.className = "quiz-compass-strip";
    COMPASS_STRIP_COLORS.forEach((color) => {
      const cell = document.createElement("span");
      cell.style.background = color;
      strip.append(cell);
    });
    const socialMarker = document.createElement("span");
    socialMarker.className = "quiz-compass-x";
    socialMarker.style.left = `${Math.max(4, Math.min(96, compass.traditional))}%`;
    socialMarker.style.background = compass.socialColor;
    socialMarker.setAttribute("aria-hidden", "true");
    strip.append(socialMarker);
    bar.append(barLabels, strip);
    read.append(sentence, bar);

    const method = document.createElement("div");
    method.className = "quiz-compass-method";
    const methodButton = document.createElement("button");
    methodButton.type = "button";
    methodButton.className = "quiz-help-trigger quiz-compass-help";
    const methodIcon = document.createElement("span");
    methodIcon.className = "quiz-help-icon";
    methodIcon.setAttribute("aria-hidden", "true");
    methodIcon.textContent = "?";
    methodButton.append(methodIcon, document.createTextNode("Como a bússola é feita"));
    methodButton.addEventListener("click", () => {
      openResultHelp({
        title: "Como a bússola é feita",
        blocks: [
          { heading: "O eixo autoritário × libertário", text: "Mede o grau de concentração do poder político e de intervenção do Estado sobre a vida dos indivíduos. Considera liberdades individuais, representação política e estrutura do Estado." },
          { heading: "O eixo esquerda × direita", text: "Mede a posição pela organização da economia: de propriedade coletiva e planejamento estatal, de um lado, a propriedade privada e livre mercado, do outro. Considera economia e controle." },
          { heading: "O eixo social", text: "Mede a orientação dos valores entre progressismo e tradicionalismo, refletindo a posição em questões de costumes, cultura e valores sociais." }
        ],
        link: { href: "/teste-politico#guia-eixos", label: "Ver o guia dos 12 eixos" }
      });
    });
    method.append(methodButton);

    body.append(chart, read);
    section.append(title, body);

    if (compass.noteHint) {
      const note = document.createElement("aside");
      note.className = "quiz-compass-note";
      note.setAttribute("role", "note");
      note.style.setProperty("--note-bg", compass.region.bg);
      note.style.setProperty("--note-ink", compass.region.base);
      note.style.setProperty("--note-dot", compass.region.base);
      const noteTitle = document.createElement("strong");
      const dot = document.createElement("i");
      dot.setAttribute("aria-hidden", "true");
      noteTitle.append(dot, document.createTextNode(`Na bússola: ${COMPASS_SPECTRUM_LABELS[compass.regionKey]}`));
      const noteText = document.createElement("span");
      noteText.textContent = COMPASS_NOTE_HINTS[compass.noteHint];
      note.append(noteTitle, noteText);
      section.append(note);
    }
    section.append(method);
    return section;
  };

  const createMatchCard = (profile, item, index, group) => {
    const card = document.createElement("article");
    card.className = "quiz-match-card";
    const titleLine = document.createElement("div");
    titleLine.className = "quiz-match-title";
    const name = document.createElement("h4");
    name.textContent = item.name;
    const score = document.createElement("span");
    score.textContent = `${formatPercent(matchScore(profile, item.axes))} de proximidade`;
    titleLine.append(name, score);

    const imagePath = item.logoPath || item.imagePath;
    const unverified = isUnverifiedImage(item);
    if (imagePath && !unverified) {
      const isLogo = Boolean(item.logoPath);
      const isFlag = item.imageType === "flag" || group === "countries" || group === "regimes";
      const visual = document.createElement("figure");
      visual.className = `quiz-match-visual${isFlag ? " quiz-match-flag" : ""}${isLogo ? " quiz-match-logo" : ""}`;
      const image = document.createElement("img");
      image.src = imagePath;
      image.alt = isLogo ? `Símbolo de ${item.name}` : isFlag ? `Bandeira ou símbolo de ${item.name}` : `Retrato de ${item.name}`;
      image.loading = "lazy";
      image.decoding = "async";
      if (item.imageNote) image.title = item.imageNote;
      image.addEventListener("error", () => visual.remove(), { once: true });
      visual.append(image);
      const credit = isLogo ? item.logoSourceName : item.imageCredit;
      const creditUrl = isLogo ? item.logoSourceUrl : item.imageSourceUrl;
      if (credit) {
        const caption = document.createElement("figcaption");
        caption.append(document.createTextNode(`Imagem: ${credit}`));
        if (creditUrl) {
          caption.append(document.createTextNode(" · "));
          const sourceLink = document.createElement("a");
          sourceLink.href = creditUrl;
          sourceLink.target = "_blank";
          sourceLink.rel = "noopener noreferrer";
          sourceLink.textContent = "origem";
          caption.append(sourceLink);
        }
        visual.append(caption);
      }
      card.append(visual);
    } else if (unverified) {
      const note = document.createElement("p");
      note.className = "quiz-image-note";
      note.append(document.createTextNode("Imagem não exibida: licença não verificada."));
      if (item.imageSourceUrl) {
        note.append(document.createTextNode(" "));
        const sourceLink = document.createElement("a");
        sourceLink.href = item.imageSourceUrl;
        sourceLink.target = "_blank";
        sourceLink.rel = "noopener noreferrer";
        sourceLink.textContent = "Ver origem";
        note.append(sourceLink);
      }
      card.append(note);
    }

    card.append(titleLine);
    if (item.gender) {
      const gender = document.createElement("span");
      gender.className = "quiz-gender-tag";
      gender.textContent = item.gender;
      card.append(gender);
    }
    const metaParts = [item.detail || item.areaLabel || item.role];
    if (item.period && !String(item.detail || "").includes(item.period)) metaParts.push(item.period);
    if (group === "parties") metaParts.push(countryName(item.paisId));
    const metaText = metaParts.filter(Boolean).join(" · ");
    if (metaText) {
      const detail = document.createElement("span");
      detail.className = "quiz-profile-detail";
      detail.textContent = metaText;
      card.append(detail);
    }
    const description = document.createElement("p");
    description.textContent = item.summary || item.description || item.longDescription || "";
    card.append(description);

    const actions = document.createElement("div");
    actions.className = "quiz-match-actions";
    const catalogLink = document.createElement("a");
    catalogLink.className = "quiz-match-catalog-link";
    catalogLink.href = catalogProfileUrl(group, item);
    catalogLink.textContent = "Ficha no catálogo";
    const compareButton = document.createElement("button");
    compareButton.type = "button";
    compareButton.className = "quiz-help-trigger quiz-match-compare";
    compareButton.setAttribute("aria-label", `Comparar os 12 eixos com ${item.name}`);
    const compareIcon = document.createElement("span");
    compareIcon.className = "quiz-help-icon";
    compareIcon.setAttribute("aria-hidden", "true");
    compareIcon.textContent = "?";
    compareButton.append(compareIcon, document.createTextNode("Comparar 12 eixos"));
    compareButton.addEventListener("click", () => {
      const comparisonList = document.createElement("div");
      comparisonList.className = "quiz-axis-comparison-list";
      catalog.axes.forEach((axis, axisIndex) => {
        const row = document.createElement("div");
        row.className = "quiz-axis-comparison-row";
        const label = document.createElement("strong");
        label.textContent = axis.name;
        const values = document.createElement("span");
        values.textContent = `Você ${formatPercent(profile[axisIndex])} · Perfil ${formatPercent(item.axes[axisIndex])}`;
        const scale = document.createElement("div");
        scale.className = "quiz-axis-comparison-scale";
        scale.setAttribute("role", "img");
        scale.setAttribute("aria-label", `${axis.name}: seu perfil ${formatPercent(profile[axisIndex])}, ${item.name} ${formatPercent(item.axes[axisIndex])}`);
        const userMark = document.createElement("span");
        userMark.className = "quiz-user-mark";
        userMark.style.left = `${100 - profile[axisIndex]}%`;
        const profileMark = document.createElement("span");
        profileMark.className = "quiz-profile-mark";
        profileMark.style.left = `${100 - item.axes[axisIndex]}%`;
        scale.append(userMark, profileMark);
        row.append(label, values, scale);
        comparisonList.append(row);
      });
      openResultHelp({
        title: `Comparar os 12 eixos`,
        blocks: [{
          heading: `Você × ${item.name}`,
          text: `${formatPercent(matchScore(profile, item.axes))} de proximidade. Em cada barra, a marca verde representa seu perfil e a laranja, o perfil do catálogo.`
        }],
        content: comparisonList,
        link: {
          href: catalogProfileUrl(group, item),
          label: `Ver ficha de ${item.name} no catálogo`
        }
      });
    });
    actions.append(catalogLink, compareButton);
    card.append(actions);
    if (index === 0) card.classList.add("quiz-match-top");
    return card;
  };

  const createMatchSection = (profile, key, title, catalogKey, sectionId) => {
    const ranked = rankedProfiles(profile, key);
    const section = document.createElement("section");
    section.className = "quiz-match-group";
    section.id = `resultado-${sectionId}`;
    section.dataset.section = key;
    const heading = document.createElement("h3");
    heading.textContent = `${title} (${ranked.length})`;
    section.append(heading);

    const grid = document.createElement("div");
    grid.className = "quiz-match-grid";
    ranked.slice(0, 3).forEach(({ item }, index) => grid.append(createMatchCard(profile, item, index, key)));
    section.append(grid);

    if (ranked.length > 3) {
      const catalogLink = document.createElement("a");
      catalogLink.className = "quiz-catalog-link";
      catalogLink.href = `/catalogo-politico?catalogo=${catalogKey}`;
      catalogLink.textContent = `Ver os ${ranked.length} no catálogo completo`;
      section.append(catalogLink);
    }
    return section;
  };

  const createCountriesSection = (profile) => {
    const section = createMatchSection(profile, "countries", "Países mais próximos de você", "paises", "paises");
    const regimes = createMatchSection(profile, "regimes", "Regimes e modelos políticos", "paises", "regimes");
    regimes.classList.remove("quiz-match-group");
    regimes.classList.add("quiz-match-subgroup");
    const heading = regimes.querySelector("h3");
    if (heading) {
      const subheading = document.createElement("h4");
      subheading.textContent = heading.textContent;
      heading.replaceWith(subheading);
    }
    section.append(regimes);
    return section;
  };

  const createBooksSection = (profile) => {
    const recommendations = Array.isArray(catalog.bookRecommendations) ? catalog.bookRecommendations : [];
    if (!recommendations.length) return null;
    const byAuthor = new Map(recommendations.map((book) => [book.personalityId, book]));
    const picks = [];
    for (const entry of rankedProfiles(profile, "figures")) {
      const book = byAuthor.get(entry.item.id);
      if (!book) continue;
      picks.push({ book, figure: entry.item, score: entry.score });
      if (picks.length === 6) break;
    }
    if (!picks.length) return null;

    const section = document.createElement("section");
    section.className = "quiz-books";
    section.id = "resultado-livros";
    const heading = document.createElement("h3");
    heading.textContent = "Leituras associadas ao seu perfil";
    const intro = document.createElement("p");
    intro.className = "quiz-books-intro";
    intro.textContent = "Obras indicadas para as figuras mais próximas do seu resultado. São sugestões editoriais do catálogo, não endossos de ideias ou trajetórias.";
    const grid = document.createElement("div");
    grid.className = "quiz-books-grid";
    picks.forEach(({ book, figure, score }) => {
      const card = document.createElement("article");
      card.className = "quiz-book-card";
      const title = document.createElement("strong");
      title.textContent = book.title;
      const byline = document.createElement("span");
      byline.textContent = [book.author, book.year].filter(Boolean).join(" · ");
      const note = document.createElement("small");
      note.textContent = `Associada a ${figure.name} · ${formatPercent(score)} de proximidade`;
      card.append(title, byline, note);
      if (book.url) {
        const link = document.createElement("a");
        link.href = book.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Abrir obra";
        card.append(link);
      } else {
        const link = document.createElement("a");
        link.href = catalogProfileUrl("figures", figure);
        link.textContent = "Perfil do autor no catálogo";
        card.append(link);
      }
      grid.append(card);
    });
    const catalogLink = document.createElement("a");
    catalogLink.className = "quiz-catalog-link";
    catalogLink.href = "/catalogo-politico?catalogo=personalidades";
    catalogLink.textContent = "Explorar todas as personalidades e leituras";
    section.append(heading, intro, grid, catalogLink);
    return section;
  };

  const createComparisonSection = (profile) => {
    const groups = [
      { group: "figures", type: "Personalidade", catalog: "personalidades" },
      { group: "countries", type: "País", catalog: "paises" },
      { group: "ideologies", type: "Ideologia", catalog: "ideologias" }
    ];
    const limit = 2;
    const section = document.createElement("section");
    section.className = "quiz-panel quiz-compare";
    section.id = "comparar";
    section.setAttribute("aria-labelledby", "comparar-title");

    const title = document.createElement("h2");
    title.className = "quiz-panel-title";
    title.id = "comparar-title";
    title.textContent = "Lado a lado, nos 12 eixos";

    const lead = document.createElement("p");
    lead.className = "quiz-panel-lead";
    lead.textContent = "Busque uma personalidade, um país ou uma ideologia e veja, eixo por eixo, onde vocês se aproximam ou se afastam.";

    const normalize = (value) => String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    const initials = (name) => String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    const isVector = (item) => Array.isArray(item.axes) &&
      item.axes.length === catalog.axes.length &&
      item.axes.every((value) => Number.isFinite(value) && value >= 0 && value <= 100);
    const familyById = new Map((catalog.families || []).map((family) => [family.id, family]));
    const describe = (group, item) => {
      if (group === "figures") {
        const primary = item.detail || item.role || item.areaLabel || "";
        const secondary = item.period || item.lifespan || "";
        if (!secondary || primary.includes(secondary)) return primary;
        return [primary, secondary].filter(Boolean).join(" · ");
      }
      if (group === "countries") {
        return [item.detail || item.category, item.period].filter(Boolean).join(" · ");
      }
      return [item.category || item.detail, item.period].filter(Boolean).join(" · ");
    };
    const entries = groups.flatMap(({ group, type, catalog: catalogKey }) =>
      (catalog.profiles[group] || []).filter(isVector).map((item) => ({
        key: `${group}:${item.id}`,
        group,
        type,
        catalogKey,
        item,
        name: item.name || item.nome,
        meta: describe(group, item),
        search: normalize([
          item.name, item.nome, item.sigla, item.regiao, item.period, item.lifespan,
          item.category, item.detail, item.role, item.areaLabel
        ].filter(Boolean).join(" ")),
        score: matchScore(profile, item.axes)
      })));
    const topSuggestions = groups.flatMap(({ group }) => entries
      .filter((entry) => entry.group === group)
      .sort((first, second) => second.score - first.score)
      .slice(0, 2))
      .sort((first, second) => second.score - first.score);
    const selected = [];
    const selectedKeys = () => new Set(selected.map((entry) => entry.key));
    const seriesColor = (index) => index === 0 ? "var(--compare-a)" : "var(--compare-b)";
    const formatPoints = (value) => `${Number(value.toFixed(1)).toLocaleString("pt-BR")} pts`;
    const youEntry = {
      key: "you",
      type: "Você",
      name: "Seu perfil",
      meta: "Resultado deste teste",
      item: { axes: profile }
    };

    const profiles = document.createElement("div");
    profiles.className = "quiz-compare-profiles";

    const picker = document.createElement("div");
    picker.className = "quiz-compare-picker";
    const searchShell = document.createElement("div");
    searchShell.className = "quiz-compare-search";
    const label = document.createElement("label");
    label.className = "sr-only";
    label.htmlFor = "compare-search";
    label.textContent = "Buscar perfil para comparar";
    const field = document.createElement("div");
    field.className = "quiz-compare-field";
    const searchIcon = document.createElement("i");
    searchIcon.className = "fas fa-magnifying-glass";
    searchIcon.setAttribute("aria-hidden", "true");
    const input = document.createElement("input");
    input.className = "quiz-compare-input";
    input.id = "compare-search";
    input.type = "search";
    input.placeholder = "Busque personalidade, país ou ideologia";
    input.autocomplete = "off";
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", "compare-options");
    input.setAttribute("aria-autocomplete", "list");
    field.append(searchIcon, input);
    const listbox = document.createElement("ul");
    listbox.className = "quiz-compare-options";
    listbox.id = "compare-options";
    listbox.setAttribute("role", "listbox");
    listbox.setAttribute("aria-label", "Perfis para comparar");
    listbox.hidden = true;
    searchShell.append(label, field, listbox);
    const hint = document.createElement("p");
    hint.className = "quiz-compare-hint";
    hint.textContent = "Você pode comparar com até dois perfis do catálogo.";
    const limitNote = document.createElement("p");
    limitNote.className = "quiz-compare-limit";
    limitNote.hidden = true;
    limitNote.textContent = "Você já comparou com dois perfis. Remova um para escolher outro.";
    const status = document.createElement("p");
    status.className = "sr-only";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    picker.append(searchShell, hint, limitNote, status);

    const empty = document.createElement("div");
    empty.className = "quiz-compare-empty";
    const emptyIcon = document.createElement("i");
    emptyIcon.className = "fas fa-code-compare";
    emptyIcon.setAttribute("aria-hidden", "true");
    const emptyText = document.createElement("p");
    emptyText.textContent = "Escolha um perfil para ver a comparação lado a lado, os pontos de contato e as diferenças.";
    empty.append(emptyIcon, emptyText);

    const result = document.createElement("div");
    result.className = "quiz-compare-result";
    result.hidden = true;

    const avatarFor = (entry, small = false) => {
      const holder = document.createElement("span");
      holder.className = `quiz-compare-avatar${small ? " is-small" : ""}`;
      if (entry.key === "you") {
        const crown = document.createElement("i");
        crown.className = "fas fa-crown";
        crown.setAttribute("aria-hidden", "true");
        holder.append(crown);
        return holder;
      }
      const item = entry.item;
      const isCountry = entry.group === "countries";
      const isIdeology = entry.group === "ideologies";
      if (isIdeology) {
        const family = familyById.get(item.familia);
        if (family?.cor) holder.style.setProperty("--compare-avatar", family.cor);
      }
      const fallback = document.createElement("span");
      fallback.className = "quiz-compare-avatar-fallback";
      fallback.textContent = isCountry ? (item.sigla || initials(entry.name)) : initials(entry.name);
      fallback.setAttribute("aria-hidden", "true");
      const imagePath = entry.group === "figures" && isUnverifiedImage(item) ? "" : item.imagePath;
      if (imagePath) {
        const image = document.createElement("img");
        image.src = imagePath;
        image.alt = isCountry ? `Bandeira de ${entry.name}` : `Retrato de ${entry.name}`;
        image.loading = "lazy";
        image.decoding = "async";
        if (isCountry) holder.classList.add("is-flag");
        if (item.imageNote) image.title = item.imageNote;
        image.addEventListener("error", () => image.replaceWith(fallback), { once: true });
        holder.append(image);
      } else {
        holder.append(fallback);
      }
      return holder;
    };

    const createProfileCard = (entry, index, removable) => {
      const card = document.createElement("article");
      card.className = "quiz-compare-profile";
      if (!removable) card.classList.add("is-you");
      card.style.setProperty("--compare-color", removable ? seriesColor(index) : "var(--primary)");
      const main = document.createElement("div");
      main.className = "quiz-compare-profile-main";
      main.append(avatarFor(entry));
      const text = document.createElement("div");
      text.className = "quiz-compare-profile-text";
      const type = document.createElement("span");
      type.className = "quiz-compare-type";
      type.textContent = entry.type;
      const name = document.createElement("strong");
      name.className = "quiz-compare-name";
      name.textContent = entry.name;
      text.append(type, name);
      if (entry.meta) {
        const meta = document.createElement("span");
        meta.className = "quiz-compare-meta";
        meta.textContent = entry.meta;
        text.append(meta);
      }
      main.append(text);
      const foot = document.createElement("div");
      foot.className = "quiz-compare-profile-foot";
      if (removable) {
        const score = document.createElement("span");
        score.className = "quiz-compare-score";
        const strong = document.createElement("strong");
        strong.textContent = formatPercent(entry.score);
        score.append(strong, document.createTextNode(" de compatibilidade"));
        foot.append(score);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "quiz-compare-remove";
        remove.setAttribute("aria-label", `Remover ${entry.name} da comparação`);
        remove.title = "Remover";
        const cross = document.createElement("span");
        cross.setAttribute("aria-hidden", "true");
        cross.textContent = "×";
        remove.append(cross);
        remove.addEventListener("click", () => removeEntry(entry.key));
        card.append(remove);
      } else {
        const note = document.createElement("span");
        note.className = "quiz-compare-score is-you";
        note.textContent = "Seu resultado";
        foot.append(note);
      }
      card.append(main, foot);
      return card;
    };

    let activeIndex = -1;
    let optionButtons = [];

    const closeSuggestions = () => {
      listbox.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      activeIndex = -1;
      optionButtons.forEach((button) => button.classList.remove("is-active"));
    };

    const setActive = (index) => {
      if (!optionButtons.length) return;
      activeIndex = (index + optionButtons.length) % optionButtons.length;
      optionButtons.forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === activeIndex);
        button.setAttribute("aria-selected", String(buttonIndex === activeIndex));
      });
      const active = optionButtons[activeIndex];
      input.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView({ block: "nearest" });
    };

    const choose = (entry) => {
      if (!entry || selected.length >= limit || selectedKeys().has(entry.key)) return;
      selected.push(entry);
      status.textContent = `${entry.name} adicionado à comparação.`;
      input.value = "";
      closeSuggestions();
      render();
      if (selected.length >= limit) {
        const removes = profiles.querySelectorAll(".quiz-compare-remove");
        removes[removes.length - 1]?.focus();
      }
    };

    const removeEntry = (key) => {
      const index = selected.findIndex((entry) => entry.key === key);
      if (index < 0) return;
      const [removed] = selected.splice(index, 1);
      status.textContent = `${removed.name} removido da comparação.`;
      render();
      input.focus();
    };

    const findEntries = (query) => {
      const normalized = normalize(query);
      const available = entries.filter((entry) => !selectedKeys().has(entry.key));
      if (!normalized) {
        return topSuggestions.filter((entry) => !selectedKeys().has(entry.key));
      }
      const tokens = normalized.split(/\s+/).filter(Boolean);
      return available
        .map((entry) => {
          const name = normalize(entry.name);
          const haystack = `${name} ${entry.search}`;
          if (!tokens.every((token) => haystack.includes(token))) return null;
          let rank = 3;
          if (name === normalized) rank = 0;
          else if (name.startsWith(normalized)) rank = 1;
          else if (tokens.every((token) => name.includes(token))) rank = 2;
          return { entry, rank, length: name.length };
        })
        .filter(Boolean)
        .sort((first, second) => first.rank - second.rank ||
          first.length - second.length ||
          first.entry.name.localeCompare(second.entry.name, "pt-BR"))
        .slice(0, 8)
        .map(({ entry }) => entry);
    };

    const createOption = (entry, index) => {
      const item = document.createElement("li");
      item.setAttribute("role", "presentation");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-compare-option";
      button.id = `compare-option-${index}`;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      button.tabIndex = -1;
      button.append(avatarFor(entry, true));
      const text = document.createElement("span");
      text.className = "quiz-compare-option-text";
      const name = document.createElement("span");
      name.className = "quiz-compare-option-name";
      name.textContent = entry.name;
      const meta = document.createElement("span");
      meta.className = "quiz-compare-option-meta";
      meta.textContent = entry.meta || entry.type;
      text.append(name, meta);
      const type = document.createElement("span");
      type.className = "quiz-compare-option-type";
      type.textContent = entry.type;
      button.append(text, type);
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => choose(entry));
      item.append(button);
      return item;
    };

    const renderSuggestions = () => {
      if (selected.length >= limit) {
        closeSuggestions();
        return;
      }
      const query = input.value;
      const matches = findEntries(query);
      optionButtons = [];
      listbox.replaceChildren();
      if (!matches.length) {
        if (query.trim()) {
          const noResults = document.createElement("li");
          noResults.className = "quiz-compare-no-results";
          noResults.setAttribute("role", "presentation");
          noResults.textContent = "Nenhum perfil encontrado.";
          listbox.append(noResults);
          listbox.hidden = false;
          input.setAttribute("aria-expanded", "true");
          input.removeAttribute("aria-activedescendant");
          activeIndex = -1;
        } else {
          closeSuggestions();
        }
        return;
      }
      if (!query.trim()) {
        const groupLabel = document.createElement("li");
        groupLabel.className = "quiz-compare-option-group";
        groupLabel.setAttribute("role", "presentation");
        groupLabel.textContent = "Próximos de você";
        listbox.append(groupLabel);
      }
      matches.forEach((entry, index) => {
        const option = createOption(entry, index);
        optionButtons.push(option.querySelector("button"));
        listbox.append(option);
      });
      listbox.hidden = false;
      input.setAttribute("aria-expanded", "true");
      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
    };

    const createValueChip = (name, value, color) => {
      const chip = document.createElement("span");
      chip.className = "quiz-compare-value";
      chip.style.setProperty("--marker", color);
      const dot = document.createElement("i");
      dot.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.append(document.createTextNode(`${name} `));
      const strong = document.createElement("strong");
      strong.textContent = formatPercent(value);
      text.append(strong);
      chip.append(dot, text);
      return chip;
    };

    const createReadoutCard = ({ kicker, heading, text, href, values, className }) => {
      const card = document.createElement("article");
      card.className = `quiz-compare-readout-card${className ? ` ${className}` : ""}`;
      const label = document.createElement("span");
      label.className = "quiz-compare-kicker";
      label.textContent = kicker;
      const titleNode = document.createElement("h4");
      if (href) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = heading;
        titleNode.append(link);
      } else {
        titleNode.textContent = heading;
      }
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      card.append(label, titleNode, paragraph);
      if (values?.length) {
        const valueList = document.createElement("div");
        valueList.className = "quiz-compare-readout-values";
        values.forEach(({ name, value, color }) => valueList.append(createValueChip(name, value, color)));
        card.append(valueList);
      }
      return card;
    };

    const findCommonIdeology = () => {
      const vectors = [profile, ...selected.map((entry) => entry.item.axes)];
      let best = null;
      (catalog.profiles.ideologies || []).filter(isVector).forEach((item) => {
        const score = vectors.reduce((sum, vector) => sum + matchScore(vector, item.axes), 0) / vectors.length;
        if (!best || score > best.score) best = { item, score: Math.round(score * 10) / 10 };
      });
      return best;
    };

    const createComparisonAxis = (stat) => {
      const row = document.createElement("div");
      row.className = "quiz-compare-axis";
      const head = document.createElement("div");
      head.className = "quiz-compare-axis-head";
      const name = document.createElement("strong");
      name.textContent = stat.axis.name;
      const distance = document.createElement("span");
      distance.textContent = selected.length === 1
        ? `${formatPoints(stat.average)} de diferença`
        : `${formatPoints(stat.average)} em média`;
      head.append(name, distance);

      const track = document.createElement("div");
      track.className = "quiz-compare-track";
      track.setAttribute("role", "img");
      track.setAttribute("aria-label", [
        stat.axis.name,
        `você ${formatPercent(profile[stat.index])}`,
        ...selected.map((entry) => `${entry.name} ${formatPercent(entry.item.axes[stat.index])}`)
      ].join(", "));
      selected.forEach((entry, index) => {
        const marker = document.createElement("span");
        marker.className = "quiz-compare-marker";
        marker.style.setProperty("--marker", seriesColor(index));
        marker.style.left = `${100 - entry.item.axes[stat.index]}%`;
        marker.setAttribute("aria-hidden", "true");
        track.append(marker);
      });
      const youMarker = document.createElement("span");
      youMarker.className = "quiz-compare-marker is-you";
      youMarker.style.left = `${100 - profile[stat.index]}%`;
      youMarker.setAttribute("aria-hidden", "true");
      track.append(youMarker);

      const poles = document.createElement("div");
      poles.className = "quiz-compare-poles";
      const left = document.createElement("span");
      left.textContent = stat.axis.a;
      const right = document.createElement("span");
      right.textContent = stat.axis.b;
      poles.append(left, right);

      const values = document.createElement("div");
      values.className = "quiz-compare-values";
      values.append(createValueChip("Você", profile[stat.index], "var(--primary)"));
      selected.forEach((entry, index) => {
        values.append(createValueChip(entry.name, entry.item.axes[stat.index], seriesColor(index)));
      });

      row.append(head, track, poles, values);
      return row;
    };

    const renderResult = () => {
      const stats = catalog.axes.map((axis, index) => {
        const differences = selected.map((entry) => Math.abs(profile[index] - entry.item.axes[index]));
        return {
          axis,
          index,
          average: differences.reduce((sum, value) => sum + value, 0) / differences.length,
          opposite: selected.some((entry) => (profile[index] - 50) * (entry.item.axes[index] - 50) < 0)
        };
      });
      const agreement = stats.reduce((best, stat) => stat.average < best.average ? stat : best);
      const divergence = stats.reduce((best, stat) => stat.average > best.average ? stat : best);
      const opposite = stats.filter((stat) => stat.opposite);
      const common = findCommonIdeology();
      const names = selected.map((entry) => entry.name);
      const subject = names.length === 1 ? `Você e ${names[0]}` : `Você, ${names[0]} e ${names[1]}`;
      const cardValues = (stat) => [
        { name: "Você", value: profile[stat.index], color: "var(--primary)" },
        ...selected.map((entry, index) => ({
          name: entry.name,
          value: entry.item.axes[stat.index],
          color: seriesColor(index)
        }))
      ];

      const readoutTitle = document.createElement("h3");
      readoutTitle.className = "quiz-compare-subtitle";
      readoutTitle.textContent = "O que os distingue";
      const readout = document.createElement("div");
      readout.className = "quiz-compare-readout";
      if (common) {
        readout.append(createReadoutCard({
          kicker: "Ideologia em comum",
          heading: common.item.name,
          text: `${common.item.category || common.item.detail || "Corrente política"} · ${formatPercent(common.score)} de compatibilidade média ${selected.length === 1 ? "entre vocês" : "entre os três perfis"}.`,
          href: `/catalogo-politico?catalogo=ideologias#${encodeURIComponent(common.item.id)}`,
          className: "is-common"
        }));
      }
      readout.append(
        createReadoutCard({
          kicker: "Onde mais concordam",
          heading: agreement.axis.name,
          text: `${subject} ficam a ${formatPoints(agreement.average)} ${selected.length === 1 ? "um do outro" : "em média"} neste eixo.`,
          values: cardValues(agreement)
        }),
        createReadoutCard({
          kicker: "Onde mais divergem",
          heading: divergence.axis.name,
          text: `${subject} ficam a ${formatPoints(divergence.average)} ${selected.length === 1 ? "um do outro" : "em média"} neste eixo.`,
          values: cardValues(divergence)
        })
      );

      const oppositeNote = document.createElement("p");
      oppositeNote.className = "quiz-compare-opposite";
      if (!opposite.length) {
        oppositeNote.textContent = "Nenhum eixo coloca vocês em lados opostos.";
      } else {
        const axisNames = opposite.slice(0, 4).map((stat) => stat.axis.name);
        const more = opposite.length > 4 ? ` e mais ${opposite.length - 4}` : "";
        oppositeNote.textContent = selected.length === 1
          ? `Lados opostos em ${opposite.length} de ${catalog.axes.length} eixos: ${axisNames.join(", ")}${more}.`
          : `Em ${opposite.length} dos ${catalog.axes.length} eixos, ao menos um dos perfis fica do lado oposto ao seu: ${axisNames.join(", ")}${more}.`;
      }

      const axesHeader = document.createElement("div");
      axesHeader.className = "quiz-compare-subhead";
      const axesTitle = document.createElement("h3");
      axesTitle.className = "quiz-compare-subtitle";
      axesTitle.textContent = "Os 12 eixos";
      const legend = document.createElement("div");
      legend.className = "quiz-compare-legend";
      const youLegend = document.createElement("span");
      const youDot = document.createElement("i");
      youDot.className = "is-you";
      youLegend.append(youDot, document.createTextNode("Você"));
      legend.append(youLegend);
      selected.forEach((entry, index) => {
        const legendItem = document.createElement("span");
        const dot = document.createElement("i");
        dot.style.setProperty("--dot", seriesColor(index));
        legendItem.append(dot, document.createTextNode(entry.name));
        legend.append(legendItem);
      });
      axesHeader.append(axesTitle, legend);

      const axes = document.createElement("div");
      axes.className = "quiz-compare-axes";
      axes.append(...stats.map(createComparisonAxis));
      const method = document.createElement("p");
      method.className = "quiz-compare-method";
      method.textContent = "A compatibilidade usa a mesma fórmula das seções de afinidade. A distância em pontos compara as posições no eixo; a barra segue a convenção visual desta página.";

      result.replaceChildren(readoutTitle, readout, oppositeNote, axesHeader, axes, method);
    };

    const render = () => {
      profiles.replaceChildren(
        createProfileCard(youEntry, 0, false),
        ...selected.map((entry, index) => createProfileCard(entry, index, true))
      );
      const full = selected.length >= limit;
      searchShell.hidden = full;
      hint.hidden = full;
      limitNote.hidden = !full;
      empty.hidden = selected.length > 0;
      result.hidden = selected.length === 0;
      if (selected.length) renderResult();
      else result.replaceChildren();
      if (full) closeSuggestions();
    };

    input.addEventListener("input", renderSuggestions);
    input.addEventListener("focus", renderSuggestions);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSuggestions();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (listbox.hidden) {
          renderSuggestions();
          if (!optionButtons.length) return;
          setActive(event.key === "ArrowDown" ? 0 : optionButtons.length - 1);
          return;
        }
        if (!optionButtons.length) return;
        if (event.key === "ArrowDown") setActive(activeIndex < 0 ? 0 : activeIndex + 1);
        else setActive(activeIndex < 0 ? optionButtons.length - 1 : activeIndex - 1);
        return;
      }
      if (event.key === "Enter" && !listbox.hidden && optionButtons.length) {
        event.preventDefault();
        optionButtons[activeIndex >= 0 ? activeIndex : 0].click();
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (!searchShell.contains(event.target)) closeSuggestions();
    });
    document.addEventListener("focusin", (event) => {
      if (!searchShell.contains(event.target)) closeSuggestions();
    });

    section.append(title, lead, profiles, picker, empty, result);
    render();
    return section;
  };

  const CARD_SERIF = "'Playfair Display', Georgia, serif";
  const CARD_SANS = "Inter, 'Segoe UI', Arial, sans-serif";
  const CARD_SERIF_MEASURE = "Georgia, 'Times New Roman', serif";
  const CARD_SANS_MEASURE = "'Segoe UI', Arial, sans-serif";
  const CARD_TEXT = "#101010";
  const CARD_MUTED = "#5B5A55";
  const CARD_ACCENT = "#102E24";
  const CARD_PAPER = "#F4F1E8";
  const CARD_SURFACE = "#FBF9F3";
  const CARD_BORDER = "#E2DDCF";

  const cardNode = (name, attributes = {}) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.setAttribute(key, String(value));
    });
    return node;
  };

  const cardText = (parent, text, options) => {
    const { x, y, size = 14, fill = CARD_TEXT, weight = 400, family = CARD_SANS, anchor = "start", letterSpacing = 0, opacity = 1 } = options;
    const node = cardNode("text", {
      x,
      y,
      "font-family": family,
      "font-size": size,
      "font-weight": weight,
      fill,
      "text-anchor": anchor,
      "letter-spacing": letterSpacing,
      opacity
    });
    node.textContent = String(text);
    parent.append(node);
    return node;
  };

  const cardRect = (parent, options) => {
    const { x, y, width, height, rx = 0, fill = "none", fillOpacity = 1, stroke = "none", strokeOpacity = 1, strokeWidth = 1, clipPath } = options;
    const node = cardNode("rect", {
      x,
      y,
      width,
      height,
      rx,
      fill,
      "fill-opacity": fillOpacity,
      stroke,
      "stroke-opacity": strokeOpacity,
      "stroke-width": strokeWidth
    });
    if (clipPath) node.setAttribute("clip-path", `url(#${clipPath})`);
    parent.append(node);
    return node;
  };

  const cardLine = (parent, x1, y1, x2, y2, options = {}) => {
    const { stroke = CARD_TEXT, strokeOpacity = 0.14, strokeWidth = 1 } = options;
    const node = cardNode("line", { x1, y1, x2, y2, stroke, "stroke-opacity": strokeOpacity, "stroke-width": strokeWidth });
    parent.append(node);
    return node;
  };

  const cardCircle = (parent, options) => {
    const { cx, cy, r, fill = "none", fillOpacity = 1, stroke = "none", strokeOpacity = 1, strokeWidth = 1 } = options;
    const node = cardNode("circle", { cx, cy, r, fill, "fill-opacity": fillOpacity, stroke, "stroke-opacity": strokeOpacity, "stroke-width": strokeWidth });
    parent.append(node);
    return node;
  };

  let cardMeasureContext;
  const cardMeasure = (text, font) => {
    if (!cardMeasureContext) cardMeasureContext = document.createElement("canvas").getContext("2d");
    if (!cardMeasureContext) return String(text).length * 8;
    cardMeasureContext.font = font;
    return cardMeasureContext.measureText(String(text)).width;
  };

  const cardSerifMeasure = (size, weight = 700) => `${weight} ${size}px ${CARD_SERIF_MEASURE}`;
  const cardSansMeasure = (size, weight = 400) => `${weight} ${size}px ${CARD_SANS_MEASURE}`;

  const cardWrap = (text, maxWidth, font, maxLines = 2) => {
    const words = String(text).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const lines = [];
    let current = "";
    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (current && cardMeasure(candidate, font) > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    if (lines.length <= maxLines) return lines;
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && cardMeasure(`${last}…`, font) > maxWidth) last = last.slice(0, -1).trimEnd();
    kept[maxLines - 1] = `${last}…`;
    return kept;
  };

  const cardTruncate = (text, maxWidth, font) => {
    const value = String(text);
    if (cardMeasure(value, font) <= maxWidth) return value;
    let result = value;
    while (result.length > 1 && cardMeasure(`${result}…`, font) > maxWidth) result = result.slice(0, -1);
    return `${result.trimEnd()}…`;
  };

  const cardInitials = (name) => String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const cardParseHex = (value) => {
    const match = /^#([0-9a-f]{6})$/i.exec(value || "");
    return match ? parseInt(match[1], 16) : null;
  };

  const cardBlend = (value, target, amount = 0.5) => {
    const first = cardParseHex(value);
    const second = cardParseHex(target);
    if (first === null || second === null) return value || "#6B7F78";
    const channels = [16, 8, 0].map((shift) => {
      const a = (first >> shift) & 255;
      const b = (second >> shift) & 255;
      return Math.round(a * (1 - amount) + b * amount).toString(16).padStart(2, "0");
    });
    return `#${channels.join("")}`;
  };

  const cardTint = (value, amount = 0.16) => cardBlend(value, "#FFFFFF", amount);

  const cardImageCache = new Map();
  const cardImageData = (path) => {
    if (!path) return Promise.resolve(null);
    if (!cardImageCache.has(path)) {
      const request = fetch(path, { cache: "force-cache" })
        .then((response) => (response.ok ? response.blob() : null))
        .then((blob) => {
          if (!blob) return null;
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        })
        .catch(() => null);
      cardImageCache.set(path, request);
    }
    return cardImageCache.get(path);
  };

  const cardImageFor = (item) => {
    if (!item || !item.imagePath || isUnverifiedImage(item)) return Promise.resolve(null);
    return cardImageData(item.imagePath);
  };

  const cardImage = (parent, href, options) => {
    if (!href) return null;
    const { x, y, width, height, clipId, align = "xMidYMin" } = options;
    const node = cardNode("image", {
      x,
      y,
      width,
      height,
      href,
      preserveAspectRatio: `${align} slice`,
      "clip-path": `url(#${clipId})`
    });
    node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", href);
    parent.append(node);
    return node;
  };

  const cardClipRect = (defs, id, x, y, width, height, rx = 0) => {
    const clip = cardNode("clipPath", { id });
    clip.append(cardNode("rect", { x, y, width, height, rx }));
    defs.append(clip);
  };

  const cardClipCircle = (defs, id, cx, cy, r) => {
    const clip = cardNode("clipPath", { id });
    clip.append(cardNode("circle", { cx, cy, r }));
    defs.append(clip);
  };

  const buildProfileCard = (data) => {
    const { ideology, topFigure, otherFigures, countries, axes, images, iconSprite, compass } = data;
    const width = 1080;
    const pad = 56;
    const contentWidth = width - pad * 2;
    const portraitWidth = 364;
    const gap = 24;
    const axesWidth = contentWidth - portraitWidth - gap;
    const mainHeight = 760;
    const axesX = pad + portraitWidth + gap;
    const accent = compass?.region?.base || CARD_ACCENT;
    const accentSoft = compass?.region?.bg || "#ECE8DC";
    const svg = cardNode("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      width,
      height: 1500,
      viewBox: `0 0 ${width} 1500`
    });
    const title = cardNode("title");
    title.textContent = `Meu perfil político: ${ideology.item.name}`;
    const desc = cardNode("desc");
    desc.textContent = "Cartão de resultado do Teste Político de 12 Eixos da King's Newsletter.";
    svg.append(title, desc);

    const defs = cardNode("defs");
    svg.append(defs);
    const backgroundGradient = cardNode("linearGradient", { id: "card-bg", x1: 0, y1: 0, x2: 1, y2: 1 });
    backgroundGradient.append(
      cardNode("stop", { offset: "0%", "stop-color": "#FBF9F3" }),
      cardNode("stop", { offset: "55%", "stop-color": CARD_PAPER }),
      cardNode("stop", { offset: "100%", "stop-color": "#EFEBDD" })
    );
    defs.append(backgroundGradient);
    const background = cardRect(svg, { x: 0, y: 0, width, height: 1500, fill: "url(#card-bg)" });
    cardRect(svg, { x: 0, y: 0, width, height: 7, fill: accent });
    cardCircle(svg, { cx: 1060, cy: -70, r: 430, stroke: accent, strokeOpacity: 0.12, strokeWidth: 1.5 });
    cardCircle(svg, { cx: 1060, cy: -70, r: 330, fill: accentSoft, fillOpacity: 0.5 });
    cardCircle(svg, { cx: -90, cy: 1540, r: 420, fill: accent, fillOpacity: 0.04 });

    const crown = cardNode("g", { transform: "translate(56 60)" });
    crown.append(cardNode("path", { d: "M2 17 L0 5 L7 9 L12 1 L17 9 L24 5 L22 17 Z", fill: accent }));
    crown.append(cardNode("rect", { x: 1, y: 19, width: 22, height: 3, rx: 1.5, fill: accent, "fill-opacity": 0.7 }));
    svg.append(crown);
    cardText(svg, "KING'S", { x: 91, y: 84, size: 40, weight: 700, family: CARD_SERIF, fill: CARD_TEXT, letterSpacing: 0.4 });
    cardText(svg, "NEWSLETTER", { x: 93, y: 104, size: 10, weight: 600, fill: CARD_MUTED, letterSpacing: 4.6 });
    cardLine(svg, 280, 78, 835, 78, { stroke: CARD_TEXT, strokeOpacity: 0.16 });
    cardText(svg, "MEU RESULTADO", { x: width - pad, y: 80, size: 14, weight: 700, fill: CARD_TEXT, letterSpacing: 3.4, anchor: "end" });
    cardText(svg, "TESTE POLÍTICO · 12 EIXOS", { x: width - pad, y: 102, size: 9, weight: 600, fill: CARD_MUTED, letterSpacing: 2.4, anchor: "end" });

    const category = String(ideology.item.category || ideology.item.categoria || "Perfil político").toUpperCase();
    cardLine(svg, pad, 166, pad + 22, 166, { stroke: accent, strokeOpacity: 0.9, strokeWidth: 2 });
    cardText(svg, category, { x: pad + 34, y: 171, size: 14, weight: 700, fill: accent, letterSpacing: 4.2 });
    const h1Size = 68;
    const h1LineHeight = 72;
    const h1Lines = cardWrap(ideology.item.name, contentWidth - 40, cardSerifMeasure(h1Size, 700), 2);
    const h1Y = 244;
    h1Lines.forEach((line, index) => {
      cardText(svg, line, { x: pad, y: h1Y + index * h1LineHeight, size: h1Size, weight: 700, family: CARD_SERIF, fill: CARD_TEXT, letterSpacing: -1.1 });
    });
    const mainY = h1Y + (h1Lines.length - 1) * h1LineHeight + 42;
    const mainBottom = mainY + mainHeight;

    cardClipRect(defs, "card-portrait", pad, mainY, portraitWidth, mainHeight, 26);
    cardRect(svg, { x: pad, y: mainY, width: portraitWidth, height: mainHeight, rx: 26, fill: "#1B1B19" });
    if (images.portrait) {
      const portraitGroup = cardNode("g", { "clip-path": "url(#card-portrait)" });
      cardImage(portraitGroup, images.portrait, { x: pad, y: mainY, width: portraitWidth, height: mainHeight, clipId: "card-portrait", align: "xMidYMin" });
      svg.append(portraitGroup);
    } else {
      cardText(svg, cardInitials(topFigure.item.name), { x: pad + portraitWidth / 2, y: mainY + 300, size: 150, weight: 700, family: CARD_SERIF, fill: "#FFFFFF", opacity: 0.08, anchor: "middle" });
    }
    const fade = cardNode("linearGradient", { id: "card-portrait-fade", x1: 0, y1: 0, x2: 0, y2: 1 });
    fade.append(
      cardNode("stop", { offset: "0%", "stop-color": "#0B1411", "stop-opacity": 0 }),
      cardNode("stop", { offset: "45%", "stop-color": "#0B1411", "stop-opacity": 0 }),
      cardNode("stop", { offset: "70%", "stop-color": "#0B1411", "stop-opacity": 0.7 }),
      cardNode("stop", { offset: "100%", "stop-color": "#0B1411", "stop-opacity": 0.96 })
    );
    defs.append(fade);
    const fadeGroup = cardNode("g", { "clip-path": "url(#card-portrait)" });
    cardRect(fadeGroup, { x: pad, y: mainY, width: portraitWidth, height: mainHeight, fill: "url(#card-portrait-fade)" });
    svg.append(fadeGroup);
    cardRect(svg, { x: pad, y: mainY, width: portraitWidth, height: mainHeight, rx: 26, fill: "none", stroke: accent, strokeOpacity: 0.45, strokeWidth: 1.5 });

    const figureName = topFigure.item.name;
    const figureRole = topFigure.item.role || topFigure.item.detail || topFigure.item.areaLabel || "";
    cardText(svg, formatPercent(topFigure.score), { x: pad + 30, y: mainBottom - 176, size: 68, weight: 700, family: CARD_SERIF, fill: "#FFFFFF", letterSpacing: -1.2 });
    cardText(svg, "MAIS COMPATÍVEL", { x: pad + 32, y: mainBottom - 142, size: 10.5, weight: 700, fill: "#FFFFFF", opacity: 0.78, letterSpacing: 3 });
    let nameLines = cardWrap(figureName, portraitWidth - 60, cardSansMeasure(34, 600), 2);
    const nameFontSize = nameLines.length > 1 ? 30 : 34;
    const nameLineHeight = nameLines.length > 1 ? 34 : 38;
    if (nameLines.length > 1) nameLines = cardWrap(figureName, portraitWidth - 60, cardSansMeasure(nameFontSize, 600), 2);
    const nameY = mainBottom - 108;
    nameLines.forEach((line, index) => {
      cardText(svg, line, { x: pad + 30, y: nameY + index * nameLineHeight, size: nameFontSize, weight: 600, family: CARD_SANS, fill: "#FFFFFF" });
    });
    const roleLines = cardWrap(figureRole, portraitWidth - 60, cardSansMeasure(15, 400), 2);
    const roleY = nameY + (nameLines.length - 1) * nameLineHeight + 30;
    roleLines.forEach((line, index) => {
      cardText(svg, line, { x: pad + 30, y: roleY + index * 20, size: 15, weight: 400, family: CARD_SANS, fill: "#FFFFFF", opacity: 0.82 });
    });

    cardRect(svg, { x: axesX, y: mainY, width: axesWidth, height: mainHeight, rx: 26, fill: CARD_SURFACE, stroke: CARD_BORDER });
    cardText(svg, "SEUS 12 EIXOS", { x: axesX + 30, y: mainY + 54, size: 15, weight: 700, fill: CARD_TEXT, letterSpacing: 4.6 });
    cardLine(svg, axesX + 30, mainY + 72, axesX + axesWidth - 30, mainY + 72, { stroke: CARD_BORDER, strokeOpacity: 1 });
    const iconIds = new Set();
    const innerLeft = axesX + 30;
    const innerRight = axesX + axesWidth - 30;
    const tileX = innerLeft;
    const textX = tileX + 52;
    const rowStart = mainY + 94;
    const rowHeight = 54;
    const barWidth = 160;
    const barX = innerRight - 64 - barWidth;
    const textMax = barX - textX - 14;
    axes.forEach(({ axis, value }, index) => {
      const rowY = rowStart + index * rowHeight;
      const side = value >= 50 ? "a" : "b";
      const poleName = side === "a" ? axis.a : axis.b;
      const poleValue = value >= 50 ? value : 100 - value;
      const tied = Math.abs(value - 50) < 0.05;
      const rawColor = side === "a" ? axis.aColor : axis.bColor;
      const baseColor = cardParseHex(rawColor) === null ? "#6B7F78" : rawColor;
      const poleColor = tied ? "#6B7F78" : baseColor;
      const tileY = rowY + 8;
      cardRect(svg, { x: tileX, y: tileY, width: 38, height: 38, rx: 10, fill: poleColor, stroke: "#FFFFFF", strokeOpacity: 0.28 });
      const iconSide = side === "a" ? "l" : "r";
      const source = iconSprite ? iconSprite.querySelector(`#pi-${axis.id}-${iconSide}`) : null;
      if (source) {
        const iconId = `card-axis-${axis.id}-${iconSide}`;
        if (!iconIds.has(iconId)) {
          const clone = source.cloneNode(true);
          clone.id = iconId;
          defs.append(clone);
          iconIds.add(iconId);
        }
        const use = cardNode("use", { href: `#${iconId}`, x: tileX + 8, y: tileY + 8, width: 22, height: 22, fill: "#FFFFFF" });
        use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${iconId}`);
        svg.append(use);
      } else {
        cardText(svg, poleName.slice(0, 1).toUpperCase(), { x: tileX + 19, y: tileY + 24, size: 13, weight: 700, fill: "#FFFFFF", anchor: "middle" });
      }
      const axisLabel = cardTruncate(axis.name.toUpperCase(), textMax, cardSansMeasure(9, 600));
      const poleLabel = cardTruncate(poleName, textMax, cardSansMeasure(18, 600));
      cardText(svg, axisLabel, { x: textX, y: rowY + 18, size: 9, weight: 600, fill: CARD_MUTED, opacity: 0.82, letterSpacing: 1.4 });
      cardText(svg, poleLabel, { x: textX, y: rowY + 39, size: 18, weight: 600, fill: CARD_TEXT });
      cardRect(svg, { x: barX, y: rowY + 29, width: barWidth, height: 5, rx: 2.5, fill: CARD_BORDER });
      cardRect(svg, { x: barX, y: rowY + 29, width: Math.max(2, (barWidth * poleValue) / 100), height: 5, rx: 2.5, fill: poleColor });
      cardText(svg, formatPercent(poleValue), { x: innerRight, y: rowY + 35, size: 19, weight: 700, fill: poleColor, anchor: "end" });
    });

    const bottomY = mainBottom + 28;
    const bottomHeight = 296;
    const panelWidth = (contentWidth - gap) / 2;
    const leftX = pad;
    const rightX = pad + panelWidth + gap;

    cardRect(svg, { x: leftX, y: bottomY, width: panelWidth, height: bottomHeight, rx: 24, fill: CARD_SURFACE, stroke: CARD_BORDER });
    cardText(svg, "OUTRAS", { x: leftX + 24, y: bottomY + 36, size: 14, weight: 700, fill: CARD_MUTED, letterSpacing: 3.6 });
    cardText(svg, "PERSONALIDADES", { x: leftX + 24, y: bottomY + 56, size: 14, weight: 700, fill: CARD_MUTED, letterSpacing: 3.6 });
    cardLine(svg, leftX + 24, bottomY + 70, leftX + panelWidth - 24, bottomY + 70, { stroke: CARD_BORDER, strokeOpacity: 1 });
    const figureStart = bottomY + 84;
    const figureRowHeight = 58;
    const avatarPalette = ["#2F6DC0", "#12907F", "#8A3AA0"];
    otherFigures.forEach((entry, index) => {
      const rowY = figureStart + index * figureRowHeight;
      const avatarX = leftX + 24;
      const avatarY = rowY + 8;
      const avatarSize = 42;
      const clipId = `card-avatar-${index}`;
      cardClipCircle(defs, clipId, avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2);
      const avatar = images.figures[index];
      if (avatar) {
        cardImage(svg, avatar, { x: avatarX, y: avatarY, width: avatarSize, height: avatarSize, clipId, align: "xMidYMin" });
      } else {
        cardCircle(svg, { cx: avatarX + avatarSize / 2, cy: avatarY + avatarSize / 2, r: avatarSize / 2, fill: cardTint(avatarPalette[index % avatarPalette.length], 0.08) });
        cardText(svg, cardInitials(entry.item.name), { x: avatarX + avatarSize / 2, y: avatarY + 27, size: 13, weight: 700, fill: CARD_TEXT, anchor: "middle" });
      }
      cardCircle(svg, { cx: avatarX + avatarSize / 2, cy: avatarY + avatarSize / 2, r: avatarSize / 2 - 0.5, fill: "none", stroke: CARD_BORDER, strokeOpacity: 1 });
      const nameMax = panelWidth - 48 - avatarSize - 14 - 74;
      const name = cardTruncate(entry.item.name, nameMax, cardSansMeasure(17, 600));
      cardText(svg, name, { x: avatarX + avatarSize + 14, y: avatarY + 28, size: 17, weight: 600, fill: CARD_TEXT });
      cardText(svg, formatPercent(entry.score), { x: leftX + panelWidth - 24, y: avatarY + 29, size: 19, weight: 700, fill: accent, anchor: "end" });
    });

    cardRect(svg, { x: rightX, y: bottomY, width: panelWidth, height: bottomHeight, rx: 24, fill: CARD_SURFACE, stroke: CARD_BORDER });
    cardText(svg, "PAÍSES PRÓXIMOS", { x: rightX + 24, y: bottomY + 38, size: 14, weight: 700, fill: CARD_MUTED, letterSpacing: 3.6 });
    cardLine(svg, rightX + 24, bottomY + 54, rightX + panelWidth - 24, bottomY + 54, { stroke: CARD_BORDER, strokeOpacity: 1 });
    const countryStart = bottomY + 84;
    const countryRowHeight = 62;
    countries.forEach((entry, index) => {
      const rowY = countryStart + index * countryRowHeight;
      const flagX = rightX + 24;
      const flagY = rowY + 8;
      const flagWidth = 44;
      const flagHeight = 30;
      const clipId = `card-flag-${index}`;
      cardClipRect(defs, clipId, flagX, flagY, flagWidth, flagHeight, 4);
      const flag = images.countries[index];
      if (flag) {
        cardImage(svg, flag, { x: flagX, y: flagY, width: flagWidth, height: flagHeight, clipId, align: "xMidYMid" });
      } else {
        cardRect(svg, { x: flagX, y: flagY, width: flagWidth, height: flagHeight, rx: 4, fill: CARD_BORDER });
        cardText(svg, entry.item.sigla || entry.item.name.slice(0, 3).toUpperCase(), { x: flagX + flagWidth / 2, y: flagY + 20, size: 8, weight: 700, fill: CARD_TEXT, anchor: "middle" });
      }
      cardRect(svg, { x: flagX, y: flagY, width: flagWidth, height: flagHeight, rx: 4, fill: "none", stroke: CARD_BORDER, strokeOpacity: 1 });
      const nameMax = panelWidth - 48 - flagWidth - 12 - 74;
      const nameLines = cardWrap(entry.item.name, nameMax, cardSansMeasure(16, 600), 2);
      const nameX = flagX + flagWidth + 12;
      const nameY = nameLines.length > 1 ? rowY + 24 : rowY + 29;
      nameLines.forEach((line, lineIndex) => {
        cardText(svg, line, { x: nameX, y: nameY + lineIndex * 18, size: 16, weight: 600, fill: CARD_TEXT });
      });
      cardText(svg, formatPercent(entry.score), { x: rightX + panelWidth - 24, y: rowY + 30, size: 19, weight: 700, fill: accent, anchor: "end" });
    });

    const footerY = bottomY + bottomHeight + 40;
    cardLine(svg, pad, footerY, width - pad, footerY, { stroke: CARD_BORDER, strokeOpacity: 1 });
    cardText(svg, "DESCOBRA SEU PERFIL", { x: pad, y: footerY + 30, size: 13, weight: 700, fill: CARD_TEXT, letterSpacing: 3.2 });
    cardText(svg, "DAILYNEWSLETTER.VERCEL.APP", { x: width - pad, y: footerY + 30, size: 13, weight: 700, fill: accent, letterSpacing: 3.2, anchor: "end" });
    cardText(svg, "Imagens: catálogo 12 Axes · Créditos e fontes nas fichas do site", { x: pad, y: footerY + 52, size: 10, weight: 400, fill: CARD_MUTED, opacity: 0.85 });
    cardText(svg, "Percentuais: afinidade com o polo destacado · Estimativa educativa, não diagnóstico político.", { x: pad, y: footerY + 68, size: 10, weight: 400, fill: CARD_MUTED, opacity: 0.85 });
    const height = footerY + 92;
    background.setAttribute("height", String(height));
    svg.setAttribute("height", String(height));
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    return svg;
  };

  const downloadCard = async (profile) => {
    const ideology = rankedProfiles(profile, "ideologies")[0];
    const figures = rankedProfiles(profile, "figures");
    const countries = rankedProfiles(profile, "countries");
    const topFigure = figures[0] || { item: { name: "Seu perfil", role: "Teste político de 12 eixos" }, score: 0 };
    const otherFigures = figures.slice(1, 4);
    const topCountries = countries.slice(0, 3);
    const imageRequests = [
      cardImageFor(topFigure.item),
      ...otherFigures.map((entry) => cardImageFor(entry.item)),
      ...topCountries.map((entry) => cardImageFor(entry.item))
    ];
    const [portrait, ...remainingImages] = await Promise.all(imageRequests);
    const figureImages = remainingImages.slice(0, otherFigures.length);
    const countryImages = remainingImages.slice(otherFigures.length, otherFigures.length + topCountries.length);
    const compass = computeCompass(profile, ideology.item.category);
    const svg = buildProfileCard({
      ideology,
      topFigure,
      otherFigures,
      countries: topCountries,
      axes: catalog.axes.map((axis, index) => ({ axis, value: profile[index] })),
      images: { portrait, figures: figureImages, countries: countryImages },
      iconSprite: document.getElementById("axis-icon-sprite"),
      compass
    });
    const width = Number(svg.getAttribute("width")) || 1080;
    const height = Number(svg.getAttribute("height")) || 1500;
    const svgBlob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    try {
      const image = new Image();
      image.decoding = "sync";
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Não foi possível desenhar o cartão."));
        image.src = svgUrl;
      });
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas indisponível.");
      context.imageSmoothingQuality = "high";
      context.scale(scale, scale);
      context.drawImage(image, 0, 0, width, height);
      const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!pngBlob) throw new Error("Não foi possível gerar o PNG.");
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "meu-perfil-politico.png";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  };

  const setupResultsToc = () => {
    const toc = document.getElementById("results-toc");
    if (!toc) return;
    toc.hidden = false;
    const layout = toc.closest(".results-layout");
    if (layout) layout.classList.add("has-results");
    if (toc.dataset.ready) return;
    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const targets = links.map((link) => ({
      link,
      target: document.getElementById(link.getAttribute("href").slice(1))
    })).filter(({ target }) => target);
    if (!targets.length) return;

    const activate = (id) => {
      targets.forEach(({ link, target }) => {
        const active = target.id === id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    activate(targets[0].target.id);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) activate(visible[0].target.id);
      }, { rootMargin: "-30% 0px -60% 0px" });
      targets.forEach(({ target }) => observer.observe(target));
    }
    toc.dataset.ready = "true";
  };

  const showResults = (profile, shared = false, imported = false) => {
    if (window.location.pathname !== "/resultado-politico") {
      const resultUrl = new URL("/resultado-politico", window.location.origin);
      resultUrl.searchParams.set("perfil", encodeProfile(profile));
      resultUrl.searchParams.set("v", "2");
      if (imported) resultUrl.searchParams.set("origem", "12axes");
      window.location.assign(resultUrl.toString());
      return;
    }

    root.hidden = false;
    if (resultsEmpty) resultsEmpty.hidden = true;
    intro.hidden = true;
    questionView.hidden = true;
    resultsView.hidden = false;
    resultsView.replaceChildren();
    root.dataset.state = "results";

    const title = document.createElement("h3");
    title.className = "quiz-results-title";
    title.textContent = imported ? "Perfil convertido do 12axes" : shared ? "Perfil político compartilhado" : "Seu perfil por dimensão";
    const note = document.createElement("p");
    note.className = "quiz-method-note";
    note.textContent = "Os percentuais são posições relativas entre polos, não uma medida científica. As cinco perguntas de arquétipo respondidas entram como sinais adicionais no cálculo. A proximidade combina distância por eixo, direção, intensidade e divergências isoladas. Os vetores do atlas são leituras editoriais; os demais foram convertidos da base 12 Axes para a mesma régua.";

    const axesSection = document.createElement("section");
    axesSection.className = "quiz-panel quiz-axes-panel";
    axesSection.id = "eixos-resultado";
    const axesTitle = document.createElement("h2");
    axesTitle.className = "quiz-panel-title";
    axesTitle.textContent = "Seus 12 eixos";
    const axesLead = document.createElement("p");
    axesLead.className = "quiz-panel-lead";
    axesLead.textContent = "Cada barra marca sua posição entre dois polos. O centro representa equilíbrio entre eles.";
    const axesGrid = document.createElement("div");
    axesGrid.className = "quiz-results-axes";
    catalog.axes.forEach((axis, index) => axesGrid.append(createAxisRow(axis, profile[index])));
    axesSection.append(axesTitle, axesLead, axesGrid);

    const closestIdeology = rankedProfiles(profile, "ideologies")[0];
    const compass = computeCompass(profile, closestIdeology?.item.category);
    const sections = [
      title,
      note,
      createProfileHighlights(profile),
      axesSection,
      createDistinction(profile),
      createCountriesSection(profile),
      createMatchSection(profile, "figures", "Personalidades mais próximas de você", "personalidades", "figuras"),
      createAreasSection(profile),
      createBooksSection(profile),
      createMatchSection(profile, "parties", "Partidos mais próximos de você", "partidos", "partidos"),
      createValuesSection(profile),
      createMatchSection(profile, "ideologies", "Ideologias mais próximas de você", "ideologias", "ideologias"),
      createCompassSection(compass),
      createComparisonSection(profile)
    ].filter(Boolean);
    resultsView.append(...sections);

    const actions = document.createElement("div");
    actions.className = "quiz-result-actions";
    if (!shared) {
      const share = document.createElement("button");
      share.type = "button";
      share.className = "quiz-button quiz-primary";
      share.textContent = "Copiar link do perfil";
      share.addEventListener("click", async () => {
        const url = new URL(window.location.href);
        url.hash = "quiz-politico";
        url.search = "";
        url.searchParams.set("perfil", encodeProfile(profile));
        url.searchParams.set("v", "2");
        try {
          await navigator.clipboard.writeText(url.toString());
          share.textContent = "Link copiado";
        } catch {
          window.prompt("Copie este link para compartilhar seu perfil:", url.toString());
        }
      });
      actions.append(share);
    }
    const download = document.createElement("button");
    download.type = "button";
    download.className = "quiz-button quiz-secondary";
    download.textContent = "Baixar cartão";
    download.addEventListener("click", async () => {
      if (download.disabled) return;
      const original = download.textContent;
      download.disabled = true;
      download.textContent = "Preparando cartão…";
      try {
        await downloadCard(profile);
      } catch (error) {
        console.error("Não foi possível gerar o cartão.", error);
        download.textContent = "Tentar novamente";
        download.disabled = false;
        window.setTimeout(() => {
          download.textContent = original;
        }, 2400);
        return;
      }
      download.textContent = original;
      download.disabled = false;
    });
    actions.append(download);
    const restart = document.createElement("button");
    restart.type = "button";
    restart.className = "quiz-button quiz-secondary";
    restart.textContent = shared ? "Fazer meu questionário" : "Refazer questionário";
    restart.addEventListener("click", () => {
      window.location.assign("/teste-politico#quiz-politico");
    });
    actions.append(restart);
    resultsView.append(actions);
    setupResultsToc();
  };

  const startQuiz = (mode) => {
    if (!questionCard) return;
    document.body.classList.add("quiz-fullscreen-active");
    selectedMode = mode;
    selectedQuestions = questionSet(mode);
    answers = [];
    current = 0;
    stage = "questions";
    archetypeIndex = 0;
    archetypeAnswers = {};
    window.clearTimeout(archetypeTimer);
    archetypeTimer = 0;
    if (intro) intro.hidden = true;
    root.hidden = false;
    error.hidden = true;
    resultsView.hidden = true;
    questionView.hidden = false;
    renderQuestion();
  };

  if (helpClose && helpDialog) {
    helpClose.addEventListener("click", () => helpDialog.close());
    helpDialog.addEventListener("click", (event) => {
      if (event.target === helpDialog) helpDialog.close();
    });
  }

  document.querySelectorAll(".quiz-lengths label").forEach((label) => {
    label.addEventListener("click", () => {
      const mode = label.querySelector('input[name="quiz-length"]')?.value || "short";
      window.setTimeout(() => startQuiz(mode), 0);
    });
  });

  backButton.addEventListener("click", () => {
    window.clearTimeout(archetypeTimer);
    archetypeTimer = 0;
    if (stage === "archetype") {
      if (archetypeIndex > 0) {
        archetypeIndex -= 1;
        renderArchetype();
        return;
      }
      stage = "questions";
      current = selectedQuestions.length - 1;
      renderQuestion();
      return;
    }
    if (current > 0) { current -= 1; renderQuestion(); }
  });

  nextButton.addEventListener("click", () => {
    if (stage === "archetype") {
      advanceArchetype();
      return;
    }
    if (answers[current] === undefined) return;
    if (current < selectedQuestions.length - 1) {
      current += 1;
      renderQuestion();
      return;
    }
    enterArchetype();
  });

  if (skipButton) skipButton.addEventListener("click", skipArchetype);

  fetch("/data/political-catalog.json")
    .then((response) => {
      if (!response.ok) throw new Error("Quiz data unavailable");
      return response.json();
    })
    .then((data) => {
      const profiles = data.profiles || {};
      const collections = ["ideologies", "figures", "countries", "regimes", "parties", "values"];
      if (
        !Array.isArray(data.axes) ||
        data.axes.length !== 12 ||
        !Array.isArray(data.questions) ||
        data.questions.length !== 240 ||
        !Array.isArray(data.valueGroups) ||
        !Array.isArray(data.areas) ||
        !collections.every((key) => Array.isArray(profiles[key]))
      ) {
        throw new Error("Quiz data invalid");
      }
      catalog = data;
      renderAxisGuide(data.axes);
      if (window.location.hash) {
        const hashTarget = document.getElementById(window.location.hash.slice(1));
        if (hashTarget) {
          requestAnimationFrame(() => hashTarget.scrollIntoView({ block: "start" }));
        }
      }
      setupManualExplorer();
      const sharedProfile = safeDecodeProfile();
      if (sharedProfile) {
        showResults(sharedProfile, true);
        return;
      }
      const imported = referenceProfile();
      if (imported) {
        showResults(imported, false, true);
        return;
      }
      if (resultsEmpty) showEmptyState();
    })
    .catch(setError);
});
