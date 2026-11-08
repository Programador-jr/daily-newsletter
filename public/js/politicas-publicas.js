// Accordion behavior
document.querySelectorAll(".topic-accordion").forEach(item => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".topic-accordion[open]").forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});