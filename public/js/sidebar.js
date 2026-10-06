document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("site-sidebar");
  const backdrop = document.getElementById("site-sidebar-backdrop");
  const openButton = document.getElementById("sidebar-toggle");
  const closeButton = document.getElementById("site-sidebar-close");
  if (!sidebar || !backdrop || !openButton) return;
  const setOpen = open => {
    sidebar.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    sidebar.setAttribute("aria-hidden", String(!open));
    backdrop.setAttribute("aria-hidden", String(!open));
    openButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("sidebar-open", open);
    if (open) closeButton?.focus();
    else openButton.focus();
  };
  openButton.addEventListener("click", () => setOpen(true));
  closeButton?.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && sidebar.classList.contains("is-open")) setOpen(false); });
  sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setOpen(false)));
});