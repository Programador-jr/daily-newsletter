async function loadHTML(elementId, filePath) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(res.statusText);
    document.getElementById(elementId).innerHTML = await res.text();
  } catch (e) {
    console.error(`Erro carregando ${filePath}:`, e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadHTML('footer', 'footer.html');
});   