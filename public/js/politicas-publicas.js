// Accordion behavior
document.querySelectorAll(".policy-accordion").forEach(item => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".policy-accordion[open]").forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});