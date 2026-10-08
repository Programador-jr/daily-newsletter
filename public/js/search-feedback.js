(() => {
  const notices = new Map();
  const hosts = new Map();

  const hostFor = key => {
    const targetKey = key === 'deputy-list' ? 'expense' : key;
    const target = document.querySelector(`[data-search-feedback="${targetKey}"]`) || document.body;
    let host = hosts.get(target);
    if (host) return host;
    host = document.createElement('div');
    host.className = 'search-feedback-host';
    host.setAttribute('aria-label', 'Avisos da consulta');
    target.append(host);
    hosts.set(target, host);
    return host;
  };

  const getNotice = key => {
    let notice = notices.get(key);
    if (notice) return notice;

    const element = document.createElement('section');
    element.className = 'search-feedback';
    element.hidden = true;
    element.innerHTML = '<span class="search-feedback-spinner" aria-hidden="true" hidden></span>' +
      '<div class="search-feedback-copy"><strong></strong><p></p></div>' +
      '<button type="button" aria-label="Fechar aviso"><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m5 5 10 10M15 5 5 15"></path></svg></button>';
    element.querySelector('button').addEventListener('click', () => clear(key));
    const host = hostFor(key);
    host.append(element);
    notice = { element, host, timer: null };
    notices.set(key, notice);
    return notice;
  };

  const clear = key => {
    const notice = notices.get(key);
    if (!notice) return;
    clearTimeout(notice.timer);
    notice.element.remove();
    if (!notice.host.children.length) {
      hosts.delete(notice.host.parentElement);
      notice.host.remove();
    }
    notices.delete(key);
  };

  const show = (key, kind, message) => {
    const notice = getNotice(key);
    clearTimeout(notice.timer);
    notice.element.className = `search-feedback ${kind}`;
    notice.element.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    notice.element.querySelector('strong').textContent = kind === 'error' ? 'Falha na consulta' : 'Consultando';
    notice.element.querySelector('p').textContent = message;
    notice.element.querySelector('.search-feedback-spinner').hidden = kind !== 'loading';
    notice.element.querySelector('button').hidden = kind !== 'error';
    notice.element.hidden = false;
    if (kind === 'error') notice.timer = setTimeout(() => clear(key), 10000);
  };

  window.searchFeedback = {
    loading: (key, message) => show(key, 'loading', message),
    error: (key, message) => show(key, 'error', message),
    clear
  };
})();
