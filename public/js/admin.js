const timezone = 'America/Rio_Branco';
const loginView = document.querySelector('#login-view');
const dashboardLayout = document.querySelector('#dashboard-layout');
const dashboardView = document.querySelector('#dashboard-view');
const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('#login-message');
const dashboardMessage = document.querySelector('#dashboard-message');
const logoutButton = document.querySelector('#logout-button');
const dispatchButton = document.querySelector('#dispatch-button');
const dispatchMessage = document.querySelector('#dispatch-message');
const testEmailButton = document.querySelector('#test-email-button');
const testEmailMessage = document.querySelector('#test-email-message');
const testEmailRecipient = document.querySelector('#test-email-recipient');
const testEmailModal = document.querySelector('#test-email-modal');
const confirmTestEmailButton = document.querySelector('#confirm-test-email');
const loadingOverlay = document.querySelector('#loading-overlay');
const dispatchModal = document.querySelector('#dispatch-modal');
const confirmDispatchButton = document.querySelector('#confirm-dispatch');
const cancelDispatchButton = document.querySelector('#cancel-dispatch');
let latestDashboardData = null;
let dispatchInProgress = false;
let lastFocusedElement = null;
let countdownTimer = null;
let scheduleStatusTimer = null;
let currentWorkerSchedule = null;
let currentRuns = [];
let currentEmails = [];
let currentAdminPage = 'overview';
let updateEditorReturnFocus = null;
let selectedUpdateForDeletion = null;
let deleteDialogReturnFocus = null;
let allUpdates = [];
let updatesFilter = 'all';

const statusLabels = {
  accepted: 'Aceito', partially_accepted: 'Parcial', failed: 'Falha',
  succeeded: 'Concluído', skipped: 'Sem envio', running: 'Em andamento',
  delivered: 'Enviada', pending: 'Pendente', sending: 'Disparando',
  no_recipients: 'Sem assinantes', no_news: 'Sem edição',
  draft: 'Rascunho', approved: 'Aprovado', sent: 'Enviado'
};
let digestSummaries = [];
let selectedDigest = null;
let confirmedSubscriberCount = 0;

const errorCodeDescriptions = {
  RUN_TIMEOUT: 'A execução do worker excedeu o tempo limite.',
  DELIVERY_OUTCOME_UNKNOWN: 'O resultado do envio não foi confirmado. Verifique a atividade antes de tentar novamente.',
  DELIVERY_RESERVATION_FAILED: 'Não foi possível reservar o envio para processamento.',
  DELIVERY_PREPARATION_FAILED: 'O envio não pôde ser preparado.',
  RECIPIENT_DELIVERY_FAILED: 'Um ou mais destinatários não receberam a mensagem.',
  SMTP_NO_ACCEPTED_RECIPIENTS: 'O servidor de e-mail não aceitou nenhum destinatário.',
  EMAIL_DELIVERY_ERROR: 'Ocorreu um erro durante a entrega do e-mail.',
  NEWSLETTER_RUN_FAILED: 'A execução da newsletter terminou com falha.',
  API_HTTP_409: 'O serviço recusou a verificação por conflito no estado atual. Atualize e tente novamente.'
};

function describeErrorCode(code) {
  if (!code) return 'A operação terminou com uma falha.';
  return errorCodeDescriptions[code] || `Falha registrada: ${String(code).replaceAll('_', ' ').toLocaleLowerCase('pt-BR')}.`;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone, dateStyle: 'short', timeStyle: 'short'
  }).format(date);
}

function rioDateTimeInput(value) {
  if (!value) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(value)).reduce((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function parseRioDateTime(value) {
  return new Date(`${value}:00-05:00`);
}

function setAdminPage(page, { updateHash = true } = {}) {
  const allowed = ['overview', 'operations', 'digest', 'audience', 'activity', 'updates'];
  currentAdminPage = allowed.includes(page) ? page : 'overview';
  document.querySelectorAll('[data-admin-page]').forEach(element => {
    const hidden = element.dataset.adminPage !== currentAdminPage ||
      (element.id === 'alerts-panel' && element.dataset.hasAlerts !== 'true');
    element.classList.toggle('hidden', hidden);
  });
  document.querySelectorAll('[data-admin-page-link]').forEach(link => {
    const active = link.dataset.adminPageLink === currentAdminPage;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const titles = {
    overview: ['VISÃO GERAL', 'Visão geral'],
    operations: ['OPERAÇÃO', 'Envios e worker'],
    digest: ['ENVIO DIÁRIO', 'Resumo diário'],
    audience: ['AUDIÊNCIA', 'Assinantes e entregabilidade'],
    activity: ['AUDITORIA', 'Atividade e logs'],
    updates: ['COMUNICAÇÃO', 'Avisos de atualização']
  };
  const heading = document.querySelector('.dashboard-main > .page-heading');
  heading.classList.remove('hidden');
  document.querySelector('#page-eyebrow').lastChild.textContent = ` ${titles[currentAdminPage][0]}`;
  document.querySelector('#dashboard-title').textContent = titles[currentAdminPage][1];
  document.querySelector('#updated-at').textContent = currentAdminPage === 'updates'
    ? 'Avisos visíveis no site público · horário de Rio Branco'
    : document.querySelector('#updated-at').dataset.lastLoaded || 'Carregando dados…';
  if (updateHash && window.location.hash !== `#${currentAdminPage}`) {
    window.history.replaceState(null, '', `#${currentAdminPage}`);
  }
  if (currentAdminPage === 'digest' && !document.querySelector('#digest-list').dataset.loaded) {
    refreshDigests().catch(error => showToast('Falha ao carregar resumos', error.message, 'error'));
  }
  if (currentAdminPage === 'updates' && !document.querySelector('#updates-list').dataset.loaded) {
    refreshUpdates().catch(error => showToast('Falha ao carregar avisos', error.message, 'error'));
  }
}

function updateState(update) {
  const now = Date.now();
  const startsAt = new Date(update.startsAt).getTime();
  const endsAt = new Date(update.endsAt).getTime();
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt)) return 'Revisar datas';
  if (endsAt <= now) return 'Expirado';
  if (!update.active) return 'Pausado';
  if (startsAt > now) return 'Programado';
  return 'Ativo';
}

function renderMarkdownPreview(container, markdown) {
  container.replaceChildren();
  const inline = (parent, text) => {
    const pattern = /(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\*\*\*.+?\*\*\*|___.+?___|\*\*(?:[^*]+|\*[^*]+\*)+\*\*|__(?:[^_]+|_[^_]+_)+__|~~[^~]+~~|\*[^*]+\*|_[^_]+_|\x60[^\x60]+\x60)/g;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      if (match.index > cursor) parent.append(document.createTextNode(text.slice(cursor, match.index)));
      const token = match[0];
      let node;
      const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (link) {
        try {
          const url = new URL(link[2]);
          if (['http:', 'https:'].includes(url.protocol)) {
            node = document.createElement('a');
            node.href = url.href;
            node.target = '_blank';
            node.rel = 'noopener noreferrer';
            node.textContent = link[1];
          }
        } catch { /* link inválido permanece como texto */ }
      } else if (token.startsWith('***') || token.startsWith('___')) {
        node = document.createElement('strong');
        const emphasis = document.createElement('em');
        inline(emphasis, token.slice(3, -3));
        node.append(emphasis);
      } else if (token.startsWith('**') || token.startsWith('__')) {
        node = document.createElement('strong');
        inline(node, token.slice(2, -2));
      } else if (token.startsWith('~~')) {
        node = document.createElement('del');
        inline(node, token.slice(2, -2));
      } else if (token.startsWith('\x60')) {
        node = document.createElement('code');
        node.textContent = token.slice(1, -1);
      } else {
        node = document.createElement('em');
        inline(node, token.slice(1, -1));
      }
      parent.append(node || document.createTextNode(token));
      cursor = match.index + token.length;
    }
    if (cursor < text.length) parent.append(document.createTextNode(text.slice(cursor)));
  };
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  let index = 0;
  const isListItem = line => /^\s{0,3}(?:[-*+](?:[ \t]+|$)|\d{1,9}[.)](?:[ \t]+|$))/.test(line);
  const isBlockStart = line => /^(#{1,4}\s|>\s?)/.test(line.trim()) || isListItem(line) || /^(?:[-*_][ \t]*){3,}$/.test(line.trim()) || line.trim().startsWith('\x60\x60\x60');
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    if (line.startsWith('\x60\x60\x60')) {
      index += 1;
      const codeLines = [];
      while (index < lines.length && !lines[index].trim().startsWith('\x60\x60\x60')) codeLines.push(lines[index++]);
      if (index < lines.length) index += 1;
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = codeLines.join('\n');
      pre.append(code);
      container.append(pre);
      continue;
    }
    if (/^(?:[-*_][ \t]*){3,}$/.test(line)) { container.append(document.createElement('hr')); index += 1; continue; }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const node = document.createElement('h' + Math.min(4, heading[1].length + 2));
      inline(node, heading[2]);
      container.append(node);
      index += 1;
      continue;
    }
    if (line.startsWith('>')) {
      const quote = document.createElement('blockquote');
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        const p = document.createElement('p');
        inline(p, lines[index++].trim().replace(/^>\s?/, ''));
        quote.append(p);
      }
      container.append(quote);
      continue;
    }
    const listMatch = line.match(/^\s{0,3}(?:([-*+])(?:[ \t]+|$)|(\d{1,9})[.)](?:[ \t]+|$))(.*)$/);
    if (listMatch) {
      const ordered = Boolean(listMatch[2]);
      const list = document.createElement(ordered ? 'ol' : 'ul');
      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s{0,3}(?:([-*+])(?:[ \t]+|$)|(\d{1,9})[.)](?:[ \t]+|$))(.*)$/);
        if (!itemMatch || Boolean(itemMatch[2]) !== ordered) break;
        const item = document.createElement('li');
        inline(item, itemMatch[3].trim());
        list.append(item);
        index += 1;
      }
      container.append(list);
      continue;
    }
    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) paragraphLines.push(lines[index++].trim());
    const p = document.createElement('p');
    inline(p, paragraphLines.join(' '));
    container.append(p);
  }
}

function previewUpdate() {
  const title = document.querySelector('#update-title').value.trim();
  const body = document.querySelector('#update-body').value;
  document.querySelector('#update-preview-title').textContent = title || 'Título da atualização';
  renderMarkdownPreview(document.querySelector('#update-preview-changes'), body || 'As mudanças desta versão aparecerão aqui.');
}

function syncUpdatePublishControl() {
  const toggle = document.querySelector('#update-active');
  toggle.setAttribute('aria-checked', String(toggle.checked));
  document.querySelector('#update-publish-state').textContent = toggle.checked
    ? 'Será exibida nas datas definidas'
    : 'Salva como rascunho, sem aparecer na newsletter';
}

function resetUpdateForm() {
  document.querySelector('#update-form').reset();
  document.querySelector('#update-id').value = '';
  document.querySelector('#update-max-displays').value = '2';
  document.querySelector('#update-active').checked = true;
  syncUpdatePublishControl();
  document.querySelector('#update-form-title').textContent = 'Nova nota de atualização';
  document.querySelector('#update-save').innerHTML = 'Salvar nota <span aria-hidden="true">→</span>';
  document.querySelector('#update-message').textContent = '';
  document.querySelector('#update-message').classList.remove('error');
  previewUpdate();
}

function getUpdateMonth(update) {
  const date = new Date(update.startsAt);
  if (!Number.isFinite(date.getTime())) return { key: 'invalid', label: 'Datas para revisar' };
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit'
  }).formatToParts(date).reduce((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});
  return { key: `${parts.year}-${parts.month}`, label: new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone, month: 'long', year: 'numeric'
  }).format(date) };
}

function renderUpdates(updates = allUpdates) {
  allUpdates = updates;
  const list = document.querySelector('#updates-list');
  list.replaceChildren();
  list.dataset.loaded = 'true';
  const states = updates.map(updateState);
  document.querySelector('#updates-count-active').textContent = states.filter(state => state === 'Ativo').length;
  document.querySelector('#updates-count-scheduled').textContent = states.filter(state => state === 'Programado').length;
  document.querySelector('#updates-count-inactive').textContent = states.filter(state => ['Pausado', 'Expirado', 'Revisar datas'].includes(state)).length;
  const query = document.querySelector('#updates-search').value.trim().toLocaleLowerCase('pt-BR');
  const filtered = updates.filter(update => {
    const state = updateState(update);
    const matchesState = updatesFilter === 'all' || (updatesFilter === 'inactive'
      ? ['Pausado', 'Expirado', 'Revisar datas'].includes(state) : state === updatesFilter);
    return matchesState && (!query || `${update.title} ${update.body}`.toLocaleLowerCase('pt-BR').includes(query));
  }).sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
  document.querySelector('#updates-list-count').textContent = filtered.length === updates.length
    ? `${updates.length} nota(s)` : `${filtered.length} de ${updates.length} nota(s)`;
  if (!updates.length) {
    const empty = document.createElement('div');
    empty.className = 'updates-empty-state';
    const icon = document.createElement('span');
    icon.className = 'updates-empty-icon';
    icon.textContent = '✦';
    const title = document.createElement('strong');
    title.textContent = 'Sua primeira nota começa aqui';
    const copy = document.createElement('p');
    copy.textContent = 'Registre melhorias e novidades para compartilhar com quem visita a newsletter.';
    const create = document.createElement('button');
    create.type = 'button';
    create.className = 'button button-primary';
    create.textContent = 'Criar primeira nota';
    create.addEventListener('click', openNewUpdateEditor);
    empty.append(icon, title, copy, create);
    list.append(empty);
    return;
  }
  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'updates-filter-empty';
    empty.textContent = 'Nenhuma nota corresponde a este filtro.';
    list.append(empty);
    return;
  }
  const groups = new Map();
  for (const update of filtered) {
    const month = getUpdateMonth(update);
    if (!groups.has(month.key)) groups.set(month.key, { label: month.label, updates: [] });
    groups.get(month.key).updates.push(update);
  }
  for (const group of groups.values()) {
    const section = document.createElement('section');
    section.className = 'updates-month-group';
    const heading = document.createElement('h3');
    heading.className = 'updates-month-heading';
    heading.textContent = group.label;
    const monthList = document.createElement('div');
    monthList.className = 'updates-month-list';
    for (const update of group.updates) {
      const item = document.createElement('div');
      item.className = 'update-timeline-item';
      const date = document.createElement('time');
      date.className = 'update-timeline-date';
      date.dateTime = update.startsAt;
      const startDate = new Date(update.startsAt);
      date.textContent = Number.isFinite(startDate.getTime())
        ? new Intl.DateTimeFormat('pt-BR', { timeZone: timezone, day: '2-digit', month: 'short' }).format(startDate).replace('.', '')
        : 'Data inválida';
      const card = document.createElement('article');
      card.className = 'update-card';
      const header = document.createElement('div');
      header.className = 'update-card-header';
      const title = document.createElement('h4');
      title.textContent = update.title;
      const status = document.createElement('span');
      const state = updateState(update);
      status.className = `update-state update-state-${state.toLocaleLowerCase('pt-BR').replaceAll(' ', '-')}`;
      status.textContent = state;
      header.append(title, status);
      const entries = String(update.body || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean)
        .map(line => line.replace(/^(?:[-*•]|\d+[.)])\s*/, ''));
      const summary = document.createElement('p');
      summary.className = 'update-card-summary';
      summary.textContent = entries[0] || 'Sem descrição das mudanças.';
      const details = document.createElement('details');
      details.className = 'update-card-details';
      const summaryToggle = document.createElement('summary');
      summaryToggle.textContent = `${entries.length} mudança(s)`;
      const body = document.createElement('ul');
      body.className = 'update-card-changes';
      for (const line of entries) {
        const change = document.createElement('li');
        change.textContent = line;
        body.append(change);
      }
      details.append(summaryToggle, body);
      const meta = document.createElement('div');
      meta.className = 'update-card-meta';
      meta.textContent = `Exibição: ${formatDate(update.startsAt)}–${formatDate(update.endsAt)} · ${update.maxDisplays} vez(es) por navegador`;
      const actions = document.createElement('div');
      actions.className = 'update-card-actions';
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'button button-secondary';
      edit.textContent = 'Editar';
      edit.addEventListener('click', () => editUpdate(update));
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'button button-quiet';
      toggle.textContent = state === 'Expirado' ? 'Ajustar período' : update.active ? 'Pausar' : 'Reativar';
      toggle.addEventListener('click', () => state === 'Expirado' ? editUpdate(update) : toggleUpdate(update));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'button button-quiet update-delete-button';
      remove.textContent = 'Excluir';
      remove.addEventListener('click', () => openDeleteConfirmation(update));
      actions.append(edit, toggle, remove);
      card.append(header, summary, details, meta, actions);
      item.append(date, card);
      monthList.append(item);
    }
    section.append(heading, monthList);
    list.append(section);
  }
}

async function refreshUpdates() {
  const response = await fetch('/api/admin/updates', { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (response.status === 401) { showLogin(); return; }
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Não foi possível carregar os avisos.');
  renderUpdates(payload.updates);
}

function editUpdate(update) {
  updateEditorReturnFocus = document.activeElement;
  document.querySelector('#update-id').value = update.id;
  document.querySelector('#update-title').value = update.title;
  document.querySelector('#update-body').value = update.body;
  document.querySelector('#update-starts').value = rioDateTimeInput(update.startsAt);
  document.querySelector('#update-ends').value = rioDateTimeInput(update.endsAt);
  document.querySelector('#update-max-displays').value = update.maxDisplays;
  document.querySelector('#update-active').checked = update.active;
  syncUpdatePublishControl();
  document.querySelector('#update-form-title').textContent = 'Editar aviso';
  document.querySelector('#update-save').innerHTML = 'Salvar alterações <span aria-hidden="true">→</span>';
  previewUpdate();
  document.querySelector('#update-editor-modal').classList.remove('hidden');
  document.querySelector('#update-title').focus();
}

function openNewUpdateEditor() {
  updateEditorReturnFocus = document.activeElement;
  resetUpdateForm();
  document.querySelector('#update-editor-modal').classList.remove('hidden');
  document.querySelector('#update-title').focus();
}

function closeUpdateEditor() {
  document.querySelector('#update-editor-modal').classList.add('hidden');
  updateEditorReturnFocus?.focus();
  updateEditorReturnFocus = null;
}

function openDeleteConfirmation(update) {
  deleteDialogReturnFocus = document.activeElement;
  selectedUpdateForDeletion = update;
  document.querySelector('#update-delete-copy').textContent = `“${update.title}” deixará de aparecer para os visitantes e será removida do histórico.`;
  document.querySelector('#update-delete-modal').classList.remove('hidden');
  document.querySelector('#update-delete-confirm').focus();
}

function closeDeleteConfirmation() {
  document.querySelector('#update-delete-modal').classList.add('hidden');
  selectedUpdateForDeletion = null;
  deleteDialogReturnFocus?.focus();
  deleteDialogReturnFocus = null;
}

async function deleteSelectedUpdate() {
  if (!selectedUpdateForDeletion) return;
  const button = document.querySelector('#update-delete-confirm');
  button.disabled = true;
  button.innerHTML = '<span class="button-spinner" aria-hidden="true"></span> Excluindo…';
  try {
    const response = await fetch('/api/admin/updates', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: selectedUpdateForDeletion.id }), cache: 'no-store'
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível excluir a nota.');
    closeDeleteConfirmation();
    await refreshUpdates();
    document.querySelector('#update-new').focus();
    showToast('Nota excluída', 'Ela foi removida do histórico e não será mais exibida.');
  } catch (error) {
    showToast('Falha ao excluir nota', error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Excluir nota';
  }
}

async function saveUpdate(event) {
  event.preventDefault();
  const id = document.querySelector('#update-id').value;
  const startsAt = parseRioDateTime(document.querySelector('#update-starts').value);
  const endsAt = parseRioDateTime(document.querySelector('#update-ends').value);
  const message = document.querySelector('#update-message');
  message.classList.remove('error');
  message.textContent = '';
  if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt) {
    message.classList.add('error');
    message.textContent = 'O fim da exibição precisa ser depois do início (horário de Rio Branco).';
    return;
  }
  const payload = {
    id: id || undefined,
    title: document.querySelector('#update-title').value.trim(),
    body: document.querySelector('#update-body').value.trim(),
    startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(),
    maxDisplays: Number(document.querySelector('#update-max-displays').value),
    active: document.querySelector('#update-active').checked
  };
  const save = document.querySelector('#update-save');
  save.disabled = true;
  save.innerHTML = '<span class="button-spinner" aria-hidden="true"></span> Salvando…';
  try {
    const response = await fetch('/api/admin/updates', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload), cache: 'no-store'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Não foi possível salvar o aviso.');
    closeUpdateEditor();
    resetUpdateForm();
    await refreshUpdates();
    showToast('Aviso salvo', 'As configurações de exibição foram atualizadas.');
  } catch (error) {
    message.classList.add('error');
    message.textContent = error.message;
    showToast('Falha ao salvar aviso', error.message, 'error');
  } finally {
    save.disabled = false;
    if (document.querySelector('#update-id').value) save.innerHTML = 'Salvar alterações <span aria-hidden="true">→</span>';
    else save.innerHTML = 'Salvar aviso <span aria-hidden="true">→</span>';
  }
}

async function toggleUpdate(update) {
  if (!update.active && new Date(update.endsAt).getTime() <= Date.now()) {
    editUpdate(update);
    showToast('Período encerrado', 'Ajuste as datas antes de reativar este aviso.', 'warning');
    return;
  }
  const form = {
    id: update.id, title: update.title, body: update.body,
    startsAt: update.startsAt, endsAt: update.endsAt,
    maxDisplays: update.maxDisplays, active: !update.active
  };
  try {
    const response = await fetch('/api/admin/updates', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(form), cache: 'no-store'
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível alterar o aviso.');
    await refreshUpdates();
    showToast(update.active ? 'Aviso pausado' : 'Aviso reativado', update.active ? 'Ele não será exibido enquanto estiver pausado.' : 'A contagem de aparições foi reiniciada.');
  } catch (error) {
    showToast('Falha ao alterar aviso', error.message, 'error');
  }
}

function updateCountdown() {
  const countdown = document.querySelector('#worker-countdown');
  const nextAt = currentWorkerSchedule?.nextRunAt ? new Date(currentWorkerSchedule.nextRunAt).getTime() : NaN;
  if (!currentWorkerSchedule?.workerOnline || !currentWorkerSchedule?.enabled || !currentWorkerSchedule?.workerEnabled || !Number.isFinite(nextAt)) {
    countdown.textContent = currentWorkerSchedule?.workerRunning ? 'EM ANDAMENTO' : currentWorkerSchedule?.enabled ? '--:--:--' : 'PAUSADO';
    return;
  }
  const seconds = Math.max(0, Math.floor((nextAt - Date.now()) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const clock = [hours, minutes, remainder].map(value => String(value).padStart(2, '0')).join(':');
  countdown.textContent = days ? `${days}d ${clock}` : clock;
}

function renderWorkerSchedule(schedule, { updateFields = false } = {}) {
  if (!schedule) return;
  currentWorkerSchedule = schedule;
  const status = document.querySelector('#worker-status');
  status.className = `status ${schedule.workerOnline ? schedule.workerEnabled && schedule.enabled ? 'worker-online' : 'worker-paused' : 'worker-offline'}`;
  status.textContent = !schedule.workerOnline ? 'Worker offline'
    : schedule.workerRunning ? 'Executando'
      : schedule.workerEnabled && schedule.enabled ? 'Worker conectado' : 'Agendamento pausado';
  const topStatus = document.querySelector('#worker-top-status');
  topStatus.classList.toggle('offline', !schedule.workerOnline);
  topStatus.classList.remove('status-unknown');
  document.querySelector('#worker-top-status-copy').textContent = !schedule.workerOnline ? 'Worker offline'
    : schedule.workerRunning ? 'Worker executando'
      : schedule.workerEnabled && schedule.enabled ? 'Worker conectado' : 'Agendamento pausado';
  document.querySelector('#worker-sidebar-status').textContent = !schedule.workerOnline ? 'Worker offline'
    : schedule.workerRunning ? 'Execução em andamento'
      : schedule.workerEnabled && schedule.enabled ? 'Worker conectado' : 'Agendamento pausado';
  document.querySelector('#worker-sidebar-detail').textContent = schedule.workerOnline
    ? `Verificando a cada ${schedule.intervalHours} hora(s)` : 'Sem sinal nos últimos 90 segundos';
  document.querySelector('#worker-sidebar-dot').classList.toggle('offline-dot', !schedule.workerOnline);
  const nextAt = document.querySelector('#worker-next-at');
  nextAt.textContent = schedule.workerRunning ? `Execução em andamento${schedule.nextRunAt ? ` · próxima prevista às ${formatDate(schedule.nextRunAt)} (Rio Branco)` : ''}`
    : !schedule.enabled ? 'Agendamento desativado no painel.'
      : !schedule.workerOnline ? 'Aguardando conexão do worker.'
        : schedule.workerEnabled && schedule.nextRunAt ? `Próxima execução às ${formatDate(schedule.nextRunAt)} (Rio Branco)`
          : 'O worker está conectado, mas o agendamento está pausado.';
  const lastRun = document.querySelector('#worker-last-run');
  lastRun.textContent = schedule.lastRunAt
    ? `Última execução: ${formatDate(schedule.lastRunAt)}${schedule.lastRunStatus ? ` · ${statusLabels[schedule.lastRunStatus] || schedule.lastRunStatus}` : ''}${schedule.lastRunErrorCode ? ` · ${schedule.lastRunErrorCode}` : ''}`
    : 'Última execução: ainda não informada';
  document.querySelector('#worker-heartbeat').textContent = schedule.lastHeartbeatAt
    ? `Última sincronização: ${formatDate(schedule.lastHeartbeatAt)} (Rio Branco)`
    : 'Última sincronização: ainda não informada';
  if (updateFields && !document.querySelector('#schedule-form').contains(document.activeElement)) {
    document.querySelector('#interval-hours').value = schedule.intervalHours;
    document.querySelector('#schedule-enabled').checked = schedule.enabled;
    document.querySelector('#digest-send-time').value = schedule.digestSendTime || '';
  }
  updateCountdown();
}

async function refreshWorkerSchedule({ updateFields = true } = {}) {
  if (dashboardLayout.classList.contains('hidden')) return;
  const response = await fetch('/api/admin/schedule', { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (response.status === 401) {
    stopSchedulePolling();
    showLogin();
    return;
  }
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Não foi possível atualizar o estado do worker.');
  renderWorkerSchedule(payload.workerSchedule, { updateFields });
}

function startSchedulePolling() {
  if (!scheduleStatusTimer) scheduleStatusTimer = window.setInterval(() => {
    refreshWorkerSchedule().catch(error => { document.querySelector('#schedule-message').textContent = error.message; });
  }, 15_000);
  if (!countdownTimer) countdownTimer = window.setInterval(updateCountdown, 1000);
}

function stopSchedulePolling() {
  window.clearInterval(scheduleStatusTimer);
  window.clearInterval(countdownTimer);
  scheduleStatusTimer = null;
  countdownTimer = null;
}

function setLoading(visible, title = 'Carregando painel', detail = 'Buscando os dados mais recentes…') {
  document.querySelector('#loading-title').textContent = title;
  document.querySelector('#loading-detail').textContent = detail;
  loadingOverlay.classList.toggle('hidden', !visible);
  document.body.classList.toggle('is-loading', visible);
}

function showToast(title, message = '', type = 'success', duration = 4200) {
  const region = document.querySelector('#toast-region');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = type === 'error' ? '!' : type === 'warning' ? '•' : '✓';
  const copy = document.createElement('div');
  copy.className = 'toast-copy';
  const heading = document.createElement('strong');
  heading.textContent = title;
  copy.append(heading);
  if (message) {
    const detail = document.createElement('span');
    detail.textContent = message;
    copy.append(detail);
  }
  if (type === 'error') {
    const occurredAt = new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone, dateStyle: 'short', timeStyle: 'medium'
    }).format(new Date());
    const meta = document.createElement('small');
    meta.className = 'toast-meta';
    meta.textContent = `ERRO · ${occurredAt}`;
    copy.append(meta);
  }
  const close = document.createElement('button');
  close.className = 'toast-close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Fechar notificação');
  close.textContent = '×';
  close.addEventListener('click', () => toast.remove());
  toast.append(icon, copy, close);
  region.append(toast);
  window.setTimeout(() => toast.remove(), duration);
}

function showLogin(message = '') {
  loginView.classList.remove('hidden');
  dashboardLayout.classList.add('hidden');
  logoutButton.classList.add('hidden');
  stopSchedulePolling();
  loginMessage.textContent = message;
}

function showDashboard() {
  loginView.classList.add('hidden');
  dashboardLayout.classList.remove('hidden');
  logoutButton.classList.remove('hidden');
  startSchedulePolling();
  setAdminPage(window.location.hash.slice(1) || 'overview');
}

function card(label, value, note = '', style = '') {
  const element = document.createElement('article');
  element.className = `metric-card ${style}`;
  const labelNode = document.createElement('span');
  labelNode.className = 'metric-label';
  labelNode.textContent = label;
  const valueNode = document.createElement('strong');
  valueNode.className = 'metric-value';
  valueNode.textContent = Number(value || 0).toLocaleString('pt-BR');
  const noteNode = document.createElement('span');
  noteNode.className = 'metric-note';
  noteNode.textContent = note;
  element.append(labelNode, valueNode, noteNode);
  return element;
}

function renderActivityChart(container, records, periodDays, series) {
  const namespace = 'http://www.w3.org/2000/svg';
  const width = 720;
  const height = 230;
  const plot = { left: 42, right: 12, top: 14, bottom: 38 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const valuesByDay = new Map((records || []).map(record => [record._id, record]));
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
  const [year, month, day] = today.split('-').map(Number);
  const days = Array.from({ length: periodDays }, (_, offset) => {
    const date = new Date(Date.UTC(year, month - 1, day - (periodDays - 1 - offset)));
    return date.toISOString().slice(0, 10);
  });
  const totals = days.map(date => series.map(item => Number(valuesByDay.get(date)?.[item.key] || 0)));
  const maximum = Math.max(1, ...totals.map(values => values.reduce((sum, value) => sum + value, 0)));
  const slotWidth = plotWidth / Math.max(days.length, 1);
  const barWidth = Math.max(3, Math.min(30, slotWidth * 0.58));
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Gráfico diário dos últimos ${periodDays} dias`);
  const title = document.createElementNS(namespace, 'title');
  title.textContent = `Atividade nos últimos ${periodDays} dias`;
  svg.append(title);

  for (let tick = 0; tick <= 4; tick += 1) {
    const value = Math.ceil(maximum * (4 - tick) / 4);
    const y = plot.top + plotHeight * tick / 4;
    const line = document.createElementNS(namespace, 'line');
    line.setAttribute('x1', plot.left);
    line.setAttribute('x2', width - plot.right);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('class', 'chart-gridline');
    const label = document.createElementNS(namespace, 'text');
    label.setAttribute('x', plot.left - 8);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('class', 'chart-axis-label');
    label.textContent = String(value);
    svg.append(line, label);
  }

  days.forEach((date, index) => {
    const x = plot.left + index * slotWidth + (slotWidth - barWidth) / 2;
    let currentY = plot.top + plotHeight;
    const values = totals[index];
    values.forEach((value, seriesIndex) => {
      const barHeight = value / maximum * plotHeight;
      if (!barHeight) return;
      currentY -= barHeight;
      const rect = document.createElementNS(namespace, 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', currentY);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', Math.max(barHeight, 1));
      rect.setAttribute('rx', Math.min(3, barWidth / 3));
      rect.setAttribute('fill', series[seriesIndex].color);
      const tooltip = document.createElementNS(namespace, 'title');
      tooltip.textContent = `${date}: ${series[seriesIndex].label} ${value}`;
      rect.append(tooltip);
      svg.append(rect);
    });

    const labelEvery = Math.max(1, Math.ceil(days.length / 8));
    if (index % labelEvery === 0 || index === days.length - 1) {
      const dateLabel = document.createElementNS(namespace, 'text');
      dateLabel.setAttribute('x', x + barWidth / 2);
      dateLabel.setAttribute('y', height - 12);
      dateLabel.setAttribute('text-anchor', 'middle');
      dateLabel.setAttribute('class', 'chart-axis-label');
      dateLabel.textContent = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'UTC', day: '2-digit', month: '2-digit'
      }).format(new Date(`${date}T12:00:00Z`));
      svg.append(dateLabel);
    }
  });

  container.replaceChildren(svg);
}

function renderActivityCharts(activity, periodDays) {
  document.querySelectorAll('.chart-period-label').forEach(label => {
    label.textContent = `ÚLTIMOS ${periodDays} DIA${periodDays === 1 ? '' : 'S'}`;
  });
  renderActivityChart(document.querySelector('#email-activity-chart'), activity?.emails, periodDays, [
    { key: 'acceptedRecipients', label: 'Aceitos', color: '#f5c518' },
    { key: 'rejectedRecipients', label: 'Rejeitados', color: '#a39a82' }
  ]);
  renderActivityChart(document.querySelector('#run-activity-chart'), activity?.runs, periodDays, [
    { key: 'succeeded', label: 'Concluídas', color: '#f5c518' },
    { key: 'failed', label: 'Falhas', color: '#b85d50' },
    { key: 'skipped', label: 'Sem envio', color: '#77736a' }
  ]);
}

function appendLogField(list, label, value) {
  const term = document.createElement('dt');
  term.textContent = label;
  const description = document.createElement('dd');
  description.textContent = value || '—';
  list.append(term, description);
}

function renderLog(list, items, type) {
  list.replaceChildren();
  const prefix = type === 'run' ? 'runs' : 'emails';
  const query = document.querySelector(`#${prefix}-search`).value.trim().toLocaleLowerCase('pt-BR');
  const selectedStatus = document.querySelector(`#${prefix}-status`).value;
  const filtered = items.filter(item => {
    if (selectedStatus && item.status !== selectedStatus) return false;
    const searchable = type === 'run'
      ? `${item.editionDate || ''} ${item.trigger || ''} ${item.status || ''} ${item.errorCode || ''}`
      : `${item.kind || ''} ${item.status || ''} ${item.errorCode || ''}`;
    return !query || searchable.toLocaleLowerCase('pt-BR').includes(query);
  });
  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = items.length ? 'Nenhum registro corresponde aos filtros.' : 'Nenhuma atividade neste período.';
    list.append(empty);
    return;
  }

  for (const item of filtered) {
    const row = document.createElement('article');
    row.className = 'log-item';
    const main = document.createElement('div');
    main.className = 'log-main';
    const title = document.createElement('div');
    title.className = 'log-title';
    const meta = document.createElement('div');
    meta.className = 'log-meta';
    const status = document.createElement('span');
    status.className = `status ${item.status || ''}`;
    status.textContent = statusLabels[item.status] || String(item.status || 'desconhecido').replaceAll('_', ' ');

    if (type === 'run') {
      title.textContent = item.editionDate ? `Edição de ${item.editionDate}` : 'Execução do worker';
      const trigger = item.trigger === 'admin-manual' ? 'Manual' : 'Agendado';
      meta.textContent = `${trigger} · ${formatDate(item.startedAt)} · ${item.newStories || 0} notícia(s) · SMTP aceitou ${item.recipients || 0}${item.errorCode ? ` · ${item.errorCode}` : ''}`;
      const details = document.createElement('details');
      details.className = 'log-details';
      const summary = document.createElement('summary');
      summary.textContent = 'Dados completos da execução';
      const durationMs = item.completedAt && item.startedAt ? new Date(item.completedAt) - new Date(item.startedAt) : null;
      const duration = Number.isFinite(durationMs) && durationMs >= 0 ? `${Math.round(durationMs / 1000)} s` : 'em andamento';
      const detailFields = document.createElement('dl');
      detailFields.className = 'log-detail-grid';
      appendLogField(detailFields, 'Status', statusLabels[item.status] || item.status);
      appendLogField(detailFields, 'Origem', trigger === 'Manual' ? 'Disparo manual' : 'Agendamento automático');
      appendLogField(detailFields, 'Edição', item.editionDate || 'Não informada');
      appendLogField(detailFields, 'Início', formatDate(item.startedAt));
      appendLogField(detailFields, 'Fim', formatDate(item.completedAt));
      appendLogField(detailFields, 'Duração', duration);
      appendLogField(detailFields, 'Notícias processadas', Number(item.newStories || 0).toLocaleString('pt-BR'));
      appendLogField(detailFields, 'Destinatários aceitos', Number(item.recipients || 0).toLocaleString('pt-BR'));
      appendLogField(detailFields, 'Destinatários com falha', Number(item.failedRecipients || 0).toLocaleString('pt-BR'));
      appendLogField(detailFields, 'Código de erro', item.errorCode || 'Nenhum');
      if (item.errorCode) appendLogField(detailFields, 'Diagnóstico', describeErrorCode(item.errorCode));
      details.append(summary, detailFields);
      main.append(title, meta, details);
    } else {
      const names = { newsletter: 'Envio da newsletter', subscription_confirmation: 'Confirmação de inscrição', other: 'Outro e-mail' };
      title.textContent = names[item.kind] || 'Envio de e-mail';
      meta.textContent = `${formatDate(item.createdAt)} · aceitos: ${item.acceptedCount || 0} · rejeitados: ${item.rejectedCount || 0}${item.errorCode ? ` · ${item.errorCode}` : ''}`;
      const details = document.createElement('details');
      details.className = 'log-details';
      const summary = document.createElement('summary');
      summary.textContent = 'Dados completos da mensagem';
      const detailFields = document.createElement('dl');
      detailFields.className = 'log-detail-grid';
      appendLogField(detailFields, 'Tipo', names[item.kind] || item.kind || 'Não informado');
      appendLogField(detailFields, 'Status', statusLabels[item.status] || item.status);
      appendLogField(detailFields, 'Registrado em', formatDate(item.createdAt));
      appendLogField(detailFields, 'Destinatários aceitos', Number(item.acceptedCount || 0).toLocaleString('pt-BR'));
      appendLogField(detailFields, 'Destinatários rejeitados', Number(item.rejectedCount || 0).toLocaleString('pt-BR'));
      appendLogField(detailFields, 'Código de erro', item.errorCode || 'Nenhum');
      if (item.errorCode) appendLogField(detailFields, 'Diagnóstico', describeErrorCode(item.errorCode));
      details.append(summary, detailFields);
      main.append(title, meta, details);
    }
    row.append(main, status);
    list.append(row);
  }
}

function renderScheduleHistory(history = []) {
  const list = document.querySelector('#schedule-history');
  list.replaceChildren();
  if (!history.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'As próximas mudanças serão registradas aqui.';
    list.append(empty);
    return;
  }
  for (const entry of history) {
    const row = document.createElement('article');
    row.className = 'log-item';
    const main = document.createElement('div');
    main.className = 'log-main';
    const title = document.createElement('div');
    title.className = 'log-title';
    const previous = entry.fromIntervalHours === undefined ? '' : `de ${entry.fromIntervalHours}h / ${entry.fromEnabled ? 'ativo' : 'pausado'} para `;
    title.textContent = `${previous}cada ${entry.intervalHours}h · ${entry.enabled ? 'ativo' : 'pausado'} · resumo ${entry.digestSendTime || 'manual'}`;
    const meta = document.createElement('div');
    meta.className = 'log-meta';
    meta.textContent = `${formatDate(entry.changedAt)} · alterado por ${entry.changedBy || 'admin'}`;
    main.append(title, meta);
    row.append(main);
    list.append(row);
  }
}

function renderAlerts(data) {
  const panel = document.querySelector('#alerts-panel');
  panel.replaceChildren();
  const alerts = [];
  if (!data.workerSchedule?.workerOnline) alerts.push('Worker offline ou sem sinal nos últimos 90 segundos.');
  const latestFailure = data.recentRuns?.find(run => run.status === 'failed');
  if (latestFailure) alerts.push(`Falha em execução às ${formatDate(latestFailure.startedAt)}${latestFailure.errorCode ? ` · ${describeErrorCode(latestFailure.errorCode)} (${latestFailure.errorCode})` : ''}.`);
  if (data.workerSchedule?.lastRunStatus === 'failed') {
    alerts.push(`Última verificação do worker falhou${data.workerSchedule.lastRunErrorCode ? ` · ${describeErrorCode(data.workerSchedule.lastRunErrorCode)} (${data.workerSchedule.lastRunErrorCode})` : ''}.`);
  }
  if (!alerts.length) {
    panel.dataset.hasAlerts = 'false';
    panel.classList.add('hidden');
    return;
  }
  panel.dataset.hasAlerts = 'true';
  panel.classList.remove('hidden');
  const heading = document.createElement('strong');
  heading.textContent = 'Atenção operacional';
  const list = document.createElement('ul');
  for (const alert of alerts) {
    const item = document.createElement('li');
    item.textContent = alert;
    list.append(item);
  }
  panel.append(heading, list);
}

function exportFilteredLogs() {
  const rows = [['categoria', 'data', 'status', 'detalhes']];
  for (const item of currentRuns) {
    const query = document.querySelector('#runs-search').value.trim().toLocaleLowerCase('pt-BR');
    if (document.querySelector('#runs-status').value && item.status !== document.querySelector('#runs-status').value) continue;
    const text = `${item.editionDate || ''} ${item.trigger || ''} ${item.status || ''} ${item.errorCode || ''}`.toLocaleLowerCase('pt-BR');
    if (query && !text.includes(query)) continue;
    rows.push(['execucao', item.startedAt, item.status, `origem=${item.trigger || ''}; edicao=${item.editionDate || ''}; inicio=${item.startedAt || ''}; fim=${item.completedAt || ''}; noticias=${item.newStories || 0}; aceitos=${item.recipients || 0}; com_falha=${item.failedRecipients || 0}; codigo_erro=${item.errorCode || ''}; diagnostico=${item.errorCode ? describeErrorCode(item.errorCode) : ''}`]);
  }
  for (const item of currentEmails) {
    const query = document.querySelector('#emails-search').value.trim().toLocaleLowerCase('pt-BR');
    if (document.querySelector('#emails-status').value && item.status !== document.querySelector('#emails-status').value) continue;
    const text = `${item.kind || ''} ${item.status || ''} ${item.errorCode || ''}`.toLocaleLowerCase('pt-BR');
    if (query && !text.includes(query)) continue;
    rows.push(['email', item.createdAt, item.status, `tipo=${item.kind}; registrado=${item.createdAt || ''}; aceitos=${item.acceptedCount || 0}; rejeitados=${item.rejectedCount || 0}; codigo_erro=${item.errorCode || ''}; diagnostico=${item.errorCode ? describeErrorCode(item.errorCode) : ''}`]);
  }
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `king-newsletter-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function render(data) {
  latestDashboardData = data;
  renderActivityCharts(data.dailyActivity, data.periodDays);
  renderWorkerSchedule(data.workerSchedule, { updateFields: true });
  renderAlerts(data);
  renderScheduleHistory(data.workerSchedule?.scheduleHistory);
  const schedule = data.workerSchedule || {};
  const overviewWorker = document.querySelector('#overview-worker-status');
  overviewWorker.textContent = !schedule.workerOnline ? 'Worker offline'
    : schedule.workerRunning ? 'Execução em andamento'
      : schedule.workerEnabled && schedule.enabled ? 'Worker conectado' : 'Agendamento pausado';
  document.querySelector('#overview-worker-indicator').className = `status ${schedule.workerOnline ? schedule.workerEnabled && schedule.enabled ? 'worker-online' : 'worker-paused' : 'worker-offline'}`;
  document.querySelector('#overview-worker-indicator').textContent = !schedule.workerOnline ? 'Offline' : schedule.enabled && schedule.workerEnabled ? 'Online' : 'Pausado';
  document.querySelector('#overview-worker-detail').textContent = schedule.workerOnline
    ? schedule.nextRunAt ? `Próxima execução ${formatDate(schedule.nextRunAt)} · a cada ${schedule.intervalHours}h` : `Verificando a cada ${schedule.intervalHours}h`
    : 'Sem sinal recente do worker';
  document.querySelector('#updated-at').textContent = `Atualizado em ${formatDate(data.generatedAt)} · período de ${data.periodDays} dia(s)`;
  document.querySelector('#updated-at').dataset.lastLoaded = document.querySelector('#updated-at').textContent;
  const edition = data.latestEdition;
  document.querySelector('#overview-edition-date').textContent = edition.date ? `Edição ${edition.date}` : 'Sem edição';
  // Subscribers only receive the daily digest, so its state is the edition's delivery state.
  const todayDigest = data.todayDigest;
  const digestStatus = todayDigest?.status || 'none';
  const digestLabel = todayDigest ? statusLabels[digestStatus] || digestStatus : 'Sem resumo';
  const digestClass = todayDigest ? digestStatusClass(digestStatus) : 'no_news';
  document.querySelector('#overview-edition-indicator').className = `status ${digestClass}`;
  document.querySelector('#overview-edition-indicator').textContent = digestLabel;
  document.querySelector('#overview-news-count').textContent = Number(edition.totalStories || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-digest-status').textContent = todayDigest?.status === 'sent'
    ? `enviado a ${Number(todayDigest.sentCount).toLocaleString('pt-BR')}`
    : digestLabel.toLowerCase();
  document.querySelector('#overview-confirmed-count').textContent = Number(data.subscribers.confirmed || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-subscriber-total').textContent = Number(data.subscribers.total || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-accepted-count').textContent = Number(data.emails.acceptedMessages || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-email-period').textContent = `últimos ${data.periodDays} dia(s)`;
  document.querySelector('#overview-failed-count').textContent = Number(data.emails.failedMessages || 0).toLocaleString('pt-BR');
  document.querySelector('#latest-edition-date').textContent = edition.date ? `Edição de ${edition.date}` : 'Nenhuma edição publicada';
  document.querySelector('#latest-total-stories').textContent = Number(edition.totalStories || 0).toLocaleString('pt-BR');
  document.querySelector('#latest-delivered-stories').textContent = digestLabel;
  document.querySelector('#latest-pending-stories').textContent = data.workerSchedule?.digestSendTime || 'Desligado';
  const status = document.querySelector('#latest-status');
  status.className = `status ${digestClass}`;
  status.textContent = digestLabel;
  const lastRunSummary = document.querySelector('#latest-run-summary');
  const excludedNote = Number(edition.excludedStories || 0) > 0
    ? ` · ${Number(edition.excludedStories).toLocaleString('pt-BR')} fora do disparo: data de publicação diferente da edição`
    : '';
  if (edition.lastRun) {
    const trigger = edition.lastRun.trigger === 'admin-manual' ? 'disparo manual' : 'execução agendada';
    const accepted = Number(edition.lastRun.recipients || 0);
    lastRunSummary.textContent = `Última tentativa: ${trigger}, ${formatDate(edition.lastRun.startedAt)} · SMTP aceitou ${accepted}${edition.lastRun.errorCode ? ` · ${edition.lastRun.errorCode}` : ''}${excludedNote}`;
  } else {
    lastRunSummary.textContent = `Ainda não houve tentativa de envio para esta edição.${excludedNote}`;
  }
  confirmedSubscriberCount = Number(data.subscribers.confirmed || 0);
  renderDigestActions();
  const subscribers = data.subscribers;
  document.querySelector('#subscriber-cards').replaceChildren(
    card('Total de inscrições', subscribers.total),
    card('Confirmadas', subscribers.confirmed, '', 'good'),
    card('Aguardando confirmação', subscribers.pending, 'Link de confirmação ainda válido', 'warn'),
    card('Confirmação expirada', subscribers.expiredPending, 'Inscrições que não foram confirmadas', 'bad')
  );
  const emails = data.emails;
  document.querySelector('#email-cards').replaceChildren(
    card('Mensagens aceitas pelo SMTP', emails.acceptedMessages, `${emails.messages} tentativa(s) no período`, 'good'),
    card('Destinatários aceitos', emails.acceptedRecipients, 'Contagem informada pelo servidor SMTP', 'good'),
    card('Mensagens com falha', emails.failedMessages, 'O envio não foi aceito', emails.failedMessages ? 'bad' : ''),
    card('Destinatários rejeitados', emails.rejectedRecipients, 'Rejeições informadas pelo SMTP', emails.rejectedRecipients ? 'warn' : '')
  );
  const breakdown = document.querySelector('#email-breakdown');
  breakdown.replaceChildren();
  const labels = { subscription_confirmation: 'Confirmação', newsletter: 'Newsletter', other: 'Outros' };
  for (const [kind, stats] of Object.entries(emails.byKind || {})) {
    const item = document.createElement('span');
    item.textContent = `${labels[kind] || kind}: ${stats.messages} tentativa(s), ${stats.acceptedRecipients} aceito(s)`;
    breakdown.append(item);
  }
  currentRuns = data.recentRuns || [];
  currentEmails = data.recentEmails || [];
  renderLog(document.querySelector('#runs-list'), currentRuns, 'run');
  renderLog(document.querySelector('#emails-list'), currentEmails, 'email');
}

async function loadDashboard({ showLoader = true } = {}) {
  dashboardMessage.textContent = '';
  if (showLoader) setLoading(true, 'Atualizando painel', 'Sincronizando métricas e atividades…');
  try {
    const response = await fetch(`/api/admin/dashboard?days=${document.querySelector('#period').value}`, {
      headers: { Accept: 'application/json' }, cache: 'no-store'
    });
    if (response.status === 401) {
      showLogin();
      return false;
    }
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível carregar o painel.');
    render(payload);
    showDashboard();
    return true;
  } finally {
    if (showLoader) setLoading(false);
  }
}

function openDispatchModal() {
  if (!canApproveDigest() || dispatchInProgress) return;
  document.querySelector('#modal-pending-count').textContent = Number(selectedDigest.storyCount || 0).toLocaleString('pt-BR');
  document.querySelector('#modal-subscriber-count').textContent = confirmedSubscriberCount.toLocaleString('pt-BR');
  document.querySelector('#dispatch-modal-copy').textContent = `O resumo de ${formatDigestDate(selectedDigest.editionDate)} será enviado agora aos assinantes confirmados. Esta ação não pode ser desfeita.`;
  lastFocusedElement = document.activeElement;
  dispatchModal.classList.remove('hidden');
  confirmDispatchButton.focus();
}

function closeDispatchModal() {
  dispatchModal.classList.add('hidden');
  lastFocusedElement?.focus();
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const submitButton = document.querySelector('#login-submit');
  const submitLabel = submitButton.innerHTML;
  loginMessage.textContent = '';
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="button-spinner" aria-hidden="true"></span> Verificando acesso…';
  try {
    const formData = new FormData(loginForm);
    const response = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username: formData.get('username'), password: formData.get('password') })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível entrar.');
    loginForm.reset();
    await loadDashboard();
    if (!dashboardLayout.classList.contains('hidden')) showToast('Acesso autorizado', 'Painel atualizado com sucesso.');
  } catch (error) {
    loginMessage.textContent = error.message;
    showToast('Não foi possível entrar', error.message, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = submitLabel;
  }
});

document.querySelector('#refresh-button').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.classList.add('refreshing');
  button.disabled = true;
  try {
    const authenticated = await loadDashboard();
    if (authenticated) showToast('Painel atualizado', 'Os dados exibidos são os mais recentes disponíveis.');
  } catch (error) {
    dashboardMessage.textContent = error.message;
    showToast('Falha ao atualizar', error.message, 'error');
  } finally {
    button.classList.remove('refreshing');
    button.disabled = false;
  }
});

document.querySelector('#period').addEventListener('change', async () => {
  try { await loadDashboard(); }
  catch (error) {
    dashboardMessage.textContent = error.message;
    showToast('Falha ao atualizar', error.message, 'error');
  }
});

document.querySelector('#schedule-refresh').addEventListener('click', async event => {
  const button = event.currentTarget;
  const message = document.querySelector('#schedule-message');
  button.disabled = true;
  button.classList.add('refreshing');
  message.classList.remove('error');
  message.textContent = '';
  try {
    await refreshWorkerSchedule({ updateFields: true });
    message.textContent = 'Frequência e estado do worker atualizados.';
    showToast('Frequência atualizada', 'Exibindo a configuração salva no painel.');
  } catch (error) {
    message.classList.add('error');
    message.textContent = error.message;
    showToast('Falha ao recarregar frequência', error.message, 'error');
  } finally {
    button.disabled = false;
    button.classList.remove('refreshing');
  }
});

document.querySelector('#worker-check').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = 'Verificando…';
  try {
    const authenticated = await loadDashboard({ showLoader: false });
    if (authenticated) showToast('Verificação concluída', 'Site e banco responderam. O painel não acionou a API de notícias nem enviou e-mails.');
  } catch (error) {
    showToast('Falha na verificação', error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Verificar conexão';
  }
});

for (const id of ['runs-search', 'runs-status']) {
  document.querySelector(`#${id}`).addEventListener('input', () => renderLog(document.querySelector('#runs-list'), currentRuns, 'run'));
  document.querySelector(`#${id}`).addEventListener('change', () => renderLog(document.querySelector('#runs-list'), currentRuns, 'run'));
}
for (const id of ['emails-search', 'emails-status']) {
  document.querySelector(`#${id}`).addEventListener('input', () => renderLog(document.querySelector('#emails-list'), currentEmails, 'email'));
  document.querySelector(`#${id}`).addEventListener('change', () => renderLog(document.querySelector('#emails-list'), currentEmails, 'email'));
}
document.querySelector('#export-logs').addEventListener('click', exportFilteredLogs);

document.querySelector('#schedule-form').addEventListener('submit', async event => {
  event.preventDefault();
  const saveButton = document.querySelector('#schedule-save');
  const message = document.querySelector('#schedule-message');
  const intervalHours = Number(document.querySelector('#interval-hours').value);
  const enabled = document.querySelector('#schedule-enabled').checked;
  const digestSendTime = document.querySelector('#digest-send-time').value || null;
  message.classList.remove('error');
  message.textContent = '';
  if (!Number.isInteger(intervalHours) || intervalHours < 1 || intervalHours > 168) {
    message.classList.add('error');
    message.textContent = 'Escolha um intervalo inteiro entre 1 e 168 horas.';
    return;
  }

  saveButton.disabled = true;
  saveButton.innerHTML = '<span class="button-spinner" aria-hidden="true"></span> Salvando…';
  try {
    const response = await fetch('/api/admin/schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ intervalHours, enabled, digestSendTime }),
      cache: 'no-store'
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível salvar o agendamento.');
    renderWorkerSchedule(payload.workerSchedule);
    message.textContent = 'Agendamento salvo. O worker aplicará a alteração na próxima sincronização.';
    showToast('Agendamento salvo', `Frequência configurada para cada ${intervalHours} hora(s). ${digestSendTime ? `Resumo diário às ${digestSendTime}.` : 'Envio automático do resumo desligado.'}`);
  } catch (error) {
    message.classList.add('error');
    message.textContent = error.message;
    showToast('Falha ao salvar agendamento', error.message, 'error');
  } finally {
    saveButton.disabled = false;
    saveButton.innerHTML = 'Salvar agendamento <span aria-hidden="true">→</span>';
  }
});

logoutButton.addEventListener('click', async () => {
  try { await fetch('/api/admin/logout', { method: 'POST' }); }
  finally {
    latestDashboardData = null;
    showLogin('Sessão encerrada.');
    showToast('Sessão encerrada', 'Você saiu do painel com segurança.');
  }
});

document.querySelectorAll('[data-admin-page-link]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    setAdminPage(link.dataset.adminPageLink);
  });
});
window.addEventListener('hashchange', () => setAdminPage(window.location.hash.slice(1), { updateHash: false }));
document.querySelector('#update-form').addEventListener('submit', saveUpdate);
document.querySelector('#updates-search').addEventListener('input', () => renderUpdates());
document.querySelectorAll('[data-update-filter]').forEach(button => {
  button.addEventListener('click', () => {
    updatesFilter = button.dataset.updateFilter;
    document.querySelectorAll('[data-update-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderUpdates();
  });
});
document.querySelector('#update-new').addEventListener('click', openNewUpdateEditor);
document.querySelector('#update-cancel').addEventListener('click', closeUpdateEditor);
document.querySelector('#update-editor-close').addEventListener('click', closeUpdateEditor);
document.querySelector('#update-editor-modal').addEventListener('click', event => {
  if (event.target.id === 'update-editor-modal') closeUpdateEditor();
});
document.querySelector('#update-delete-cancel').addEventListener('click', closeDeleteConfirmation);
document.querySelector('#update-delete-close').addEventListener('click', closeDeleteConfirmation);
document.querySelector('#update-delete-confirm').addEventListener('click', deleteSelectedUpdate);
document.querySelector('#update-delete-modal').addEventListener('click', event => {
  if (event.target.id === 'update-delete-modal') closeDeleteConfirmation();
});
document.addEventListener('keydown', event => {
  const editorOpen = !document.querySelector('#update-editor-modal').classList.contains('hidden');
  const deleteOpen = !document.querySelector('#update-delete-modal').classList.contains('hidden');
  if (event.key === 'Escape' && deleteOpen) closeDeleteConfirmation();
  else if (event.key === 'Escape' && editorOpen) closeUpdateEditor();
});
document.querySelector('#update-title').addEventListener('input', previewUpdate);
document.querySelector('#update-body').addEventListener('input', previewUpdate);
document.querySelector('#update-active').addEventListener('change', syncUpdatePublishControl);
document.querySelector('#updates-refresh').addEventListener('click', () => {
  const button = document.querySelector('#updates-refresh');
  button.disabled = true;
  refreshUpdates().catch(error => showToast('Falha ao atualizar avisos', error.message, 'error'))
    .finally(() => { button.disabled = false; });
});

async function sendTestEmail(recipient) {
  testEmailButton.disabled = true;
  testEmailMessage.textContent = 'Preparando e enviando a prévia…';
  setLoading(true, 'Enviando e-mail de teste', 'A prévia será enviada somente para ' + recipient + '.');
  try {
    if (!selectedDigest) throw new Error('Selecione um resumo antes de enviar o teste.');
    const response = await fetch('/api/admin/digests', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test', id: selectedDigest.id, email: recipient }),
      cache: 'no-store'
    });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error('A rota de envio de teste não retornou JSON. Verifique se o servidor está atualizado e tente novamente.');
    }
    if (!response.ok) throw new Error(payload.error || 'Não foi possível enviar o e-mail de teste.');
    const message = 'E-mail de teste aceito pelo servidor SMTP. Resumo: ' + formatDigestDate(payload.editionDate) + '; notícias: ' + payload.stories + '. Verifique a caixa de entrada e o spam.';
    testEmailMessage.textContent = message;
    showToast('Teste enviado', message, 'success', 6500);
  } catch (error) {
    testEmailMessage.textContent = error.message;
    showToast('Falha no e-mail de teste', error.message, 'error', 6500);
  } finally {
    setLoading(false);
    renderDigestActions();
  }
}

testEmailButton.addEventListener('click', () => {
  if (dispatchInProgress || testEmailButton.disabled || !selectedDigest || !testEmailRecipient.reportValidity()) return;
  document.querySelector('#test-email-modal-copy').textContent =
    'O resumo será enviado somente para ' + testEmailRecipient.value.trim() + '. Nenhum assinante receberá esta mensagem.';
  testEmailModal.classList.remove('hidden');
  confirmTestEmailButton.focus();
});
function closeTestEmailModal() {
  testEmailModal.classList.add('hidden');
  testEmailButton.focus();
}
document.querySelector('#cancel-test-email').addEventListener('click', closeTestEmailModal);
document.querySelector('#close-test-email-modal').addEventListener('click', closeTestEmailModal);
testEmailModal.addEventListener('click', event => {
  if (event.target === testEmailModal) closeTestEmailModal();
});
confirmTestEmailButton.addEventListener('click', () => {
  const recipient = testEmailRecipient.value.trim();
  closeTestEmailModal();
  sendTestEmail(recipient);
});

dispatchButton.addEventListener('click', openDispatchModal);
cancelDispatchButton.addEventListener('click', closeDispatchModal);
document.querySelector('#close-dispatch-modal').addEventListener('click', closeDispatchModal);
dispatchModal.addEventListener('click', event => {
  if (event.target === dispatchModal) closeDispatchModal();
});
document.addEventListener('keydown', event => {
  if (!testEmailModal.classList.contains('hidden')) {
    if (event.key === 'Escape') closeTestEmailModal();
    if (event.key === 'Tab') {
      const focusable = [...testEmailModal.querySelectorAll('button:not(:disabled)')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    return;
  }
  if (dispatchModal.classList.contains('hidden')) return;
  if (event.key === 'Escape') closeDispatchModal();
  if (event.key === 'Tab') {
    const focusable = [...dispatchModal.querySelectorAll('button:not(:disabled)')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

confirmDispatchButton.addEventListener('click', async () => {
  if (!canApproveDigest() || dispatchInProgress) return;
  const digestId = selectedDigest.id;
  dispatchInProgress = true;
  closeDispatchModal();
  dispatchMessage.textContent = 'Enviando o resumo aos assinantes confirmados. Aguarde a conclusão.';
  setLoading(true, 'Envio em andamento', 'Enviando o resumo aos assinantes confirmados…');
  renderDigestActions();
  try {
    const response = await fetch('/api/admin/digests', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', id: digestId }),
      cache: 'no-store'
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível enviar o resumo.');
    let message;
    let type = 'success';
    if (payload.queued) {
      message = 'Resumo na fila. Já havia um envio em andamento; o worker envia este resumo na próxima execução.';
      type = 'warning';
    } else {
      const result = payload.result || {};
      const failed = Number(result.failedRecipients || 0);
      message = failed > 0
        ? `Envio parcial: o SMTP aceitou ${Number(result.recipients || 0)} destinatário(s) e ${failed} falharam. Use "Reenviar para quem falhou" para tentar de novo.`
        : `Resumo enviado: o SMTP aceitou ${Number(result.recipients || 0)} destinatário(s).`;
      if (failed > 0) type = 'warning';
    }
    dispatchMessage.textContent = message;
    showToast(type === 'success' ? 'Resumo enviado' : 'Resumo com pendências', message, type, 6500);
  } catch (error) {
    dispatchMessage.textContent = error.message;
    showToast('Falha no envio do resumo', error.message, 'error', 6500);
  } finally {
    dispatchInProgress = false;
    setLoading(false);
    const keptMessage = dispatchMessage.textContent;
    await refreshDigests(digestId).catch(() => {});
    dispatchMessage.textContent = keptMessage;
    loadDashboard({ showLoader: false }).catch(() => {});
  }
});

function formatDigestDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value || '—');
}

function digestStatusClass(status) {
  return status === 'sent' ? 'delivered' : status === 'draft' ? 'pending' : status === 'approved' ? 'sending' : status;
}

function canApproveDigest() {
  return Boolean(selectedDigest && ['draft', 'failed'].includes(selectedDigest.status) &&
    Number(selectedDigest.storyCount || 0) > 0 && confirmedSubscriberCount > 0);
}

function renderDigestActions() {
  const status = selectedDigest?.status;
  dispatchButton.disabled = dispatchInProgress || !canApproveDigest();
  dispatchButton.innerHTML = dispatchInProgress ? '<span class="button-spinner" aria-hidden="true"></span> Envio em andamento…'
    : !selectedDigest ? 'Selecione um resumo'
      : status === 'sent' ? 'Resumo já enviado'
        : ['approved', 'sending'].includes(status) ? 'Envio em andamento'
          : !Number(selectedDigest.storyCount || 0) ? 'Resumo sem notícias'
            : confirmedSubscriberCount <= 0 ? 'Aguardando assinantes confirmados'
              : status === 'failed' ? 'Reenviar para quem falhou <span aria-hidden="true">→</span>'
                : 'Enviar agora <span aria-hidden="true">→</span>';
  testEmailButton.disabled = dispatchInProgress || !selectedDigest;
}

function renderDigestList() {
  const list = document.querySelector('#digest-list');
  list.dataset.loaded = 'true';
  if (!digestSummaries.length) {
    list.innerHTML = '<div class="empty">Nenhum resumo na coleção dailydigests.</div>';
    return;
  }
  list.replaceChildren(...digestSummaries.map(digest => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'log-item digest-item';
    item.setAttribute('aria-pressed', String(selectedDigest?.id === digest.id));
    const main = document.createElement('span');
    main.className = 'log-main';
    const title = document.createElement('span');
    title.className = 'log-title';
    title.textContent = `${formatDigestDate(digest.editionDate)} · ${digest.headline || digest.subject}`;
    const meta = document.createElement('span');
    meta.className = 'log-meta';
    const delivery = digest.delivery || {};
    meta.textContent = `${digest.storyCount} notícia(s)` +
      (delivery.sentCount || delivery.failedCount ? ` · ${delivery.sentCount} enviado(s), ${delivery.failedCount} falha(s)` : '') +
      (digest.sentAt ? ` · enviado em ${formatDate(digest.sentAt)}` : '');
    main.append(title, meta);
    const status = document.createElement('span');
    status.className = `status ${digestStatusClass(digest.status)}`;
    status.textContent = statusLabels[digest.status] || digest.status;
    item.append(main, status);
    item.addEventListener('click', () => selectDigest(digest.id).catch(error => showToast('Falha ao abrir resumo', error.message, 'error')));
    return item;
  }));
}

async function fetchDigestJson(query = '') {
  const response = await fetch(`/api/admin/digests${query}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (response.status === 401) { showLogin(); throw new Error('Sessão expirada.'); }
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Não foi possível carregar os resumos.');
  confirmedSubscriberCount = Number(payload.confirmedSubscribers || 0);
  return payload;
}

async function selectDigest(id) {
  const payload = await fetchDigestJson(`?id=${encodeURIComponent(id)}`);
  selectedDigest = payload.digest;
  const status = document.querySelector('#digest-status');
  status.className = `status ${digestStatusClass(selectedDigest.status)}`;
  status.textContent = statusLabels[selectedDigest.status] || selectedDigest.status;
  document.querySelector('#digest-detail-title').textContent = `Resumo de ${formatDigestDate(selectedDigest.editionDate)}`;
  const delivery = selectedDigest.delivery || {};
  document.querySelector('#digest-meta').textContent = [
    `Assunto: ${payload.preview.subject}`,
    `${payload.preview.storyCount} notícia(s)`,
    `${confirmedSubscriberCount} assinante(s) confirmado(s)`,
    delivery.sentCount || delivery.failedCount ? `${delivery.sentCount} enviado(s), ${delivery.failedCount} falha(s)` : '',
    selectedDigest.editorialNotes ? `Nota editorial: ${selectedDigest.editorialNotes}` : ''
  ].filter(Boolean).join(' · ');
  document.querySelector('#digest-preview').srcdoc = payload.preview.html;
  dispatchMessage.textContent = '';
  testEmailMessage.textContent = '';
  renderDigestList();
  renderDigestActions();
}

async function refreshDigests(selectId = selectedDigest?.id) {
  loadBanner().catch(error => showToast('Falha ao carregar o banner', error.message, 'error'));
  const payload = await fetchDigestJson();
  digestSummaries = payload.digests || [];
  const nextId = digestSummaries.some(digest => digest.id === selectId) ? selectId : digestSummaries[0]?.id;
  renderDigestList();
  if (nextId) await selectDigest(nextId);
  else { selectedDigest = null; renderDigestActions(); }
}

const bannerSourceLabels = { default: 'Padrão', upload: 'Arquivo enviado', link: 'Link' };

function bannerMode() {
  return document.querySelector('input[name="banner-mode"]:checked')?.value || 'upload';
}

function syncBannerMode() {
  const mode = bannerMode();
  document.querySelector('#banner-upload-field').hidden = mode !== 'upload';
  document.querySelector('#banner-link-field').hidden = mode !== 'link';
}

function renderBanner(banner) {
  const image = document.querySelector('#banner-image');
  image.src = banner.url;
  image.alt = banner.alt || '';
  image.hidden = false;
  document.querySelector('#banner-empty').hidden = true;
  const source = document.querySelector('#banner-source');
  source.className = `status ${banner.source === 'default' ? 'pending' : 'delivered'}`;
  source.textContent = bannerSourceLabels[banner.source] || banner.source;
  document.querySelector('#banner-alt').value = banner.alt || '';
  if (banner.source === 'link') document.querySelector('#banner-url').value = banner.url;
  document.querySelector('#banner-reset').disabled = banner.source === 'default';
}

async function bannerRequest(method, body) {
  const response = await fetch('/api/admin/email-banner', {
    method,
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });
  if (response.status === 401) { showLogin(); throw new Error('Sessão expirada.'); }
  let payload;
  try { payload = await response.json(); } catch { payload = {}; }
  if (!response.ok) throw new Error(payload.error || 'Não foi possível salvar o banner.');
  return payload.banner;
}

async function loadBanner() {
  renderBanner(await bannerRequest('GET'));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

async function afterBannerChange(banner, message) {
  renderBanner(banner);
  document.querySelector('#banner-message').textContent = message;
  showToast('Banner atualizado', message);
  // The digest preview embeds the banner; refresh it so the change is visible.
  if (selectedDigest) await selectDigest(selectedDigest.id).catch(() => {});
}

document.querySelectorAll('input[name="banner-mode"]').forEach(input => input.addEventListener('change', syncBannerMode));
document.querySelector('#banner-file').addEventListener('change', event => {
  document.querySelector('#banner-file-name').textContent = event.target.files[0]?.name || 'Nenhum arquivo escolhido';
});

document.querySelector('#banner-form').addEventListener('submit', async event => {
  event.preventDefault();
  const saveButton = document.querySelector('#banner-save');
  const message = document.querySelector('#banner-message');
  const alt = document.querySelector('#banner-alt').value.trim();
  message.textContent = '';
  try {
    let body;
    if (bannerMode() === 'link') {
      const urlInput = document.querySelector('#banner-url');
      if (!urlInput.value.trim() || !urlInput.reportValidity()) throw new Error('Informe o link https da imagem.');
      body = { source: 'link', url: urlInput.value.trim(), alt };
    } else {
      const file = document.querySelector('#banner-file').files[0];
      if (!file) throw new Error('Escolha um arquivo de imagem.');
      if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) throw new Error('Use uma imagem PNG, JPG, GIF ou WebP.');
      if (file.size > 2 * 1024 * 1024) throw new Error('A imagem do banner deve ter no máximo 2 MB.');
      body = { source: 'upload', dataBase64: await readFileAsDataUrl(file), alt };
    }
    saveButton.disabled = true;
    message.textContent = 'Salvando o banner…';
    const banner = await bannerRequest('PUT', body);
    document.querySelector('#banner-file').value = '';
    document.querySelector('#banner-file-name').textContent = 'Nenhum arquivo escolhido';
    await afterBannerChange(banner, 'Os próximos e-mails usarão este banner.');
  } catch (error) {
    message.textContent = error.message;
    showToast('Falha ao salvar o banner', error.message, 'error');
  } finally {
    saveButton.disabled = false;
  }
});

document.querySelector('#banner-reset').addEventListener('click', async () => {
  const message = document.querySelector('#banner-message');
  try {
    const banner = await bannerRequest('DELETE');
    document.querySelector('#banner-url').value = '';
    await afterBannerChange(banner, 'Banner padrão restaurado.');
  } catch (error) {
    message.textContent = error.message;
    showToast('Falha ao restaurar o banner', error.message, 'error');
  }
});

document.querySelector('#digest-refresh').addEventListener('click', () => {
  const button = document.querySelector('#digest-refresh');
  button.disabled = true;
  refreshDigests().catch(error => showToast('Falha ao carregar resumos', error.message, 'error'))
    .finally(() => { button.disabled = false; });
});

loadDashboard().catch(error => {
  setLoading(false);
  if (dashboardView.classList.contains('hidden') || !latestDashboardData) showLogin(error.message);
  else dashboardMessage.textContent = error.message;
});
