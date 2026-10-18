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
  no_recipients: 'Sem assinantes', no_news: 'Sem edição'
};

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
  const allowed = ['overview', 'operations', 'audience', 'activity', 'updates'];
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
    overview: ['VISÃO GERAL', 'Operação da newsletter'],
    operations: ['OPERAÇÃO', 'Envios e worker'],
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

function previewUpdate() {
  const title = document.querySelector('#update-title').value.trim();
  const body = document.querySelector('#update-body').value;
  document.querySelector('#update-preview-title').textContent = title || 'Título da atualização';
  const list = document.querySelector('#update-preview-changes');
  list.replaceChildren();
  const entries = body.split(/\r?\n/).map(line => line.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, '')).filter(Boolean);
  for (const entry of entries.length ? entries : ['As mudanças desta versão aparecerão aqui.']) {
    const item = document.createElement('li');
    item.textContent = entry;
    list.append(item);
  }
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
      summary.textContent = 'Ver detalhes';
      const detailCopy = document.createElement('p');
      const durationMs = item.completedAt && item.startedAt ? new Date(item.completedAt) - new Date(item.startedAt) : null;
      const duration = Number.isFinite(durationMs) && durationMs >= 0 ? `${Math.round(durationMs / 1000)} s` : 'em andamento';
      detailCopy.textContent = `Início: ${formatDate(item.startedAt)} · Fim: ${formatDate(item.completedAt)} · Duração: ${duration} · Edição: ${item.editionDate || 'não informada'} · Código: ${item.errorCode || 'nenhum'}`;
      details.append(summary, detailCopy);
      main.append(title, meta, details);
    } else {
      const names = { newsletter: 'Envio da newsletter', subscription_confirmation: 'Confirmação de inscrição', other: 'Outro e-mail' };
      title.textContent = names[item.kind] || 'Envio de e-mail';
      meta.textContent = `${formatDate(item.createdAt)} · aceitos: ${item.acceptedCount || 0} · rejeitados: ${item.rejectedCount || 0}${item.errorCode ? ` · ${item.errorCode}` : ''}`;
      const details = document.createElement('details');
      details.className = 'log-details';
      const summary = document.createElement('summary');
      summary.textContent = 'Ver detalhes';
      const detailCopy = document.createElement('p');
      detailCopy.textContent = `Tipo: ${item.kind || 'não informado'} · Status: ${statusLabels[item.status] || item.status} · Aceitos: ${item.acceptedCount || 0} · Rejeitados: ${item.rejectedCount || 0} · Código: ${item.errorCode || 'nenhum'}`;
      details.append(summary, detailCopy);
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
    title.textContent = `${previous}cada ${entry.intervalHours}h · ${entry.enabled ? 'ativo' : 'pausado'}`;
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
  if (latestFailure) alerts.push(`Falha em execução às ${formatDate(latestFailure.startedAt)}${latestFailure.errorCode ? ` · ${latestFailure.errorCode}` : ''}.`);
  if (data.workerSchedule?.lastRunStatus === 'failed') {
    alerts.push(`Última verificação do worker falhou${data.workerSchedule.lastRunErrorCode ? ` · ${data.workerSchedule.lastRunErrorCode}` : ''}.`);
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
    rows.push(['execucao', item.startedAt, item.status, `${item.trigger}; edicao=${item.editionDate || ''}; noticias=${item.newStories || 0}; aceitos=${item.recipients || 0}; erro=${item.errorCode || ''}`]);
  }
  for (const item of currentEmails) {
    const query = document.querySelector('#emails-search').value.trim().toLocaleLowerCase('pt-BR');
    if (document.querySelector('#emails-status').value && item.status !== document.querySelector('#emails-status').value) continue;
    const text = `${item.kind || ''} ${item.status || ''} ${item.errorCode || ''}`.toLocaleLowerCase('pt-BR');
    if (query && !text.includes(query)) continue;
    rows.push(['email', item.createdAt, item.status, `tipo=${item.kind}; aceitos=${item.acceptedCount || 0}; rejeitados=${item.rejectedCount || 0}; erro=${item.errorCode || ''}`]);
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
  document.querySelector('#overview-edition-indicator').className = `status ${edition.status || ''}`;
  document.querySelector('#overview-edition-indicator').textContent = statusLabels[edition.status] || 'Indisponível';
  document.querySelector('#overview-news-count').textContent = Number(edition.totalStories || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-delivered-count').textContent = Number(edition.deliveredStories || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-pending-count').textContent = Number(edition.pendingStories || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-confirmed-count').textContent = Number(data.subscribers.confirmed || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-subscriber-total').textContent = Number(data.subscribers.total || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-accepted-count').textContent = Number(data.emails.acceptedMessages || 0).toLocaleString('pt-BR');
  document.querySelector('#overview-email-period').textContent = `últimos ${data.periodDays} dia(s)`;
  document.querySelector('#overview-failed-count').textContent = Number(data.emails.failedMessages || 0).toLocaleString('pt-BR');
  document.querySelector('#latest-edition-date').textContent = edition.date ? `Edição de ${edition.date}` : 'Nenhuma edição publicada';
  document.querySelector('#latest-total-stories').textContent = Number(edition.totalStories || 0).toLocaleString('pt-BR');
  document.querySelector('#latest-delivered-stories').textContent = Number(edition.deliveredStories || 0).toLocaleString('pt-BR');
  document.querySelector('#latest-pending-stories').textContent = Number(edition.pendingStories || 0).toLocaleString('pt-BR');
  const status = document.querySelector('#latest-status');
  status.className = `status ${edition.status}`;
  status.textContent = statusLabels[edition.status] || 'Indisponível';
  const lastRunSummary = document.querySelector('#latest-run-summary');
  if (edition.lastRun) {
    const trigger = edition.lastRun.trigger === 'admin-manual' ? 'disparo manual' : 'execução agendada';
    const accepted = Number(edition.lastRun.recipients || 0);
    lastRunSummary.textContent = `Última tentativa: ${trigger}, ${formatDate(edition.lastRun.startedAt)} · SMTP aceitou ${accepted}${edition.lastRun.errorCode ? ` · ${edition.lastRun.errorCode}` : ''}`;
  } else {
    lastRunSummary.textContent = 'Ainda não houve tentativa de envio para esta edição.';
  }
  const noConfirmedSubscribers = Number(data.subscribers.confirmed || 0) === 0;
  dispatchButton.disabled = dispatchInProgress || edition.pendingStories <= 0 || noConfirmedSubscribers || edition.status === 'sending';
  dispatchButton.innerHTML = dispatchInProgress ? '<span class="button-spinner" aria-hidden="true"></span> Disparo em andamento…'
    : edition.pendingStories <= 0 ? 'Sem notícias pendentes'
      : noConfirmedSubscribers ? 'Aguardando assinantes confirmados'
        : 'Enviar agora <span aria-hidden="true">→</span>';
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
  const edition = latestDashboardData?.latestEdition;
  const confirmedSubscribers = latestDashboardData?.subscribers.confirmed || 0;
  if (!edition?.pendingStories || !confirmedSubscribers || dispatchInProgress) return;
  document.querySelector('#modal-pending-count').textContent = Number(edition.pendingStories).toLocaleString('pt-BR');
  document.querySelector('#modal-subscriber-count').textContent = Number(confirmedSubscribers).toLocaleString('pt-BR');
  document.querySelector('#dispatch-modal-copy').textContent = `Confirme o envio das notícias pendentes da edição ${edition.date || 'atual'} para os assinantes com inscrição confirmada.`;
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
      body: JSON.stringify({ intervalHours, enabled }),
      cache: 'no-store'
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível salvar o agendamento.');
    renderWorkerSchedule(payload.workerSchedule);
    message.textContent = 'Agendamento salvo. O worker aplicará a alteração na próxima sincronização.';
    showToast('Agendamento salvo', `Frequência configurada para cada ${intervalHours} hora(s).`);
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

dispatchButton.addEventListener('click', openDispatchModal);
cancelDispatchButton.addEventListener('click', closeDispatchModal);
document.querySelector('#close-dispatch-modal').addEventListener('click', closeDispatchModal);
dispatchModal.addEventListener('click', event => {
  if (event.target === dispatchModal) closeDispatchModal();
});
document.addEventListener('keydown', event => {
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
  const edition = latestDashboardData?.latestEdition;
  const confirmedSubscribers = latestDashboardData?.subscribers.confirmed || 0;
  if (!edition?.pendingStories || !confirmedSubscribers || dispatchInProgress) return;
  dispatchInProgress = true;
  closeDispatchModal();
  dispatchMessage.textContent = 'O worker está processando o disparo. Aguarde a conclusão.';
  setLoading(true, 'Disparo em andamento', 'Enviando as notícias pendentes aos assinantes confirmados…');
  render(latestDashboardData);
  try {
    const response = await fetch('/api/admin/dispatch', {
      method: 'POST', headers: { Accept: 'application/json' }, cache: 'no-store'
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível iniciar o disparo.');
    setLoading(true, 'Atualizando resultados', 'Carregando o status final do envio…');
    await loadDashboard({ showLoader: false });
    const failedRecipients = Number(payload.failedRecipients || 0);
    const message = failedRecipients > 0
      ? `${payload.sent ? 'Envio parcial' : 'Envio não concluído'}: o SMTP aceitou ${Number(payload.recipients || 0)} destinatário(s); ${failedRecipients} destinatário(s) falharam. Consulte os registros de entrega antes de tentar novamente.`
      : payload.sent
        ? `Concluído: ${payload.newStories} notícia(s); o SMTP aceitou ${payload.recipients} destinatário(s).`
        : payload.newStories > 0
          ? 'Nenhum e-mail foi enviado. Verifique se há assinantes confirmados.'
          : 'Não havia notícias novas para enviar.';
    dispatchMessage.textContent = message;
    showToast(failedRecipients > 0 ? 'Disparo com falhas' : payload.sent ? 'Disparo concluído' : 'Disparo finalizado', message, failedRecipients > 0 ? 'warning' : payload.sent ? 'success' : 'warning', 6500);
  } catch (error) {
    dispatchMessage.textContent = error.message;
    showToast('Falha no disparo', error.message, 'error', 6500);
    try { await loadDashboard({ showLoader: false }); } catch { /* mantém o erro visível */ }
  } finally {
    dispatchInProgress = false;
    setLoading(false);
    if (latestDashboardData) render(latestDashboardData);
  }
});

loadDashboard().catch(error => {
  setLoading(false);
  if (dashboardView.classList.contains('hidden') || !latestDashboardData) showLogin(error.message);
  else dashboardMessage.textContent = error.message;
});
