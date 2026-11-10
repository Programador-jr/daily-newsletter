async function loadHTML(elementId, filePath) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(res.statusText);
    document.getElementById(elementId).innerHTML = await res.text();
  } catch (e) {
    console.error(`Erro carregando ${filePath}:`, e);
  }
}

function markCurrentFooterLink() {
  const current = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('#footer .footer-legal a').forEach(link => {
    if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadHTML('footer', 'footer.html');
  markCurrentFooterLink();
});   