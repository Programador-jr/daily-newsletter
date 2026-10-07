document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ideology-accordion").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      document.querySelectorAll(".ideology-accordion[open]").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
});