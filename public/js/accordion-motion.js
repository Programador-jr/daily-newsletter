(() => {
  const states = new WeakMap();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function contentFor(details, summary) {
    return Array.from(details.children).find(child => child !== summary);
  }

  function clearAnimationStyles(content) {
    content.style.removeProperty("box-sizing");
    content.style.removeProperty("height");
    content.style.removeProperty("overflow");
    content.style.removeProperty("opacity");
    content.style.removeProperty("padding-bottom");
    content.style.removeProperty("padding-top");
  }

  function setOpen(details, open) {
    const summary = details.querySelector(":scope > summary");
    const content = summary && contentFor(details, summary);
    if (!content) {
      details.open = open;
      return;
    }

    const previousState = states.get(details);
    if (previousState?.open === open) return;

    if (!content.animate || reducedMotion.matches) {
      previousState?.animation?.cancel();
      states.delete(details);
      content.inert = false;
      clearAnimationStyles(content);
      details.open = open;
      return;
    }

    const currentHeight = details.open ? content.getBoundingClientRect().height : 0;
    const currentOpacity = details.open ? Number(getComputedStyle(content).opacity) : 0;
    const computedStyle = getComputedStyle(content);
    const currentPaddingTop = details.open ? computedStyle.paddingTop : "0px";
    const currentPaddingBottom = details.open ? computedStyle.paddingBottom : "0px";
    const targetPaddingTop = computedStyle.paddingTop;
    const targetPaddingBottom = computedStyle.paddingBottom;
    previousState?.animation?.cancel();
    content.style.boxSizing = "border-box";
    content.style.overflow = "hidden";

    const state = { open, animation: null };
    states.set(details, state);

    if (open) {
      details.open = true;
      content.inert = false;
      content.style.height = "auto";
      content.style.paddingTop = targetPaddingTop;
      content.style.paddingBottom = targetPaddingBottom;
      const targetHeight = content.scrollHeight;
      content.style.height = `${currentHeight}px`;
      content.style.paddingTop = currentPaddingTop;
      content.style.paddingBottom = currentPaddingBottom;
      content.style.opacity = `${currentOpacity}`;
      void content.offsetHeight;

      state.animation = content.animate(
        [
          {
            height: `${currentHeight}px`,
            opacity: currentOpacity,
            paddingTop: currentPaddingTop,
            paddingBottom: currentPaddingBottom
          },
          {
            height: `${targetHeight}px`,
            opacity: 1,
            paddingTop: targetPaddingTop,
            paddingBottom: targetPaddingBottom
          }
        ],
        { duration: 800, easing: "cubic-bezier(.4, 0, .2, 1)" }
      );
    } else {
      content.inert = true;
      content.style.height = `${currentHeight}px`;
      content.style.paddingTop = currentPaddingTop;
      content.style.paddingBottom = currentPaddingBottom;
      content.style.opacity = `${currentOpacity}`;
      void content.offsetHeight;

      state.animation = content.animate(
        [
          {
            height: `${currentHeight}px`,
            opacity: currentOpacity,
            paddingTop: currentPaddingTop,
            paddingBottom: currentPaddingBottom
          },
          { height: "0px", opacity: 0, paddingTop: "0px", paddingBottom: "0px" }
        ],
        { duration: 800, easing: "cubic-bezier(.4, 0, .2, 1)" }
      );
      state.animation.onfinish = () => {
        if (states.get(details) !== state) return;
        details.open = false;
        content.inert = false;
        clearAnimationStyles(content);
        states.delete(details);
      };
    }

    if (open) {
      state.animation.onfinish = () => {
        if (states.get(details) !== state) return;
        clearAnimationStyles(content);
        states.delete(details);
      };
    }
  }

  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;
    const summary = event.target.closest("summary");
    const details = summary?.parentElement;
    if (!(details instanceof HTMLDetailsElement) || details.querySelector(":scope > summary") !== summary) return;

    event.preventDefault();
    const state = states.get(details);
    const shouldOpen = state ? !state.open : !details.open;

    if (shouldOpen && details.matches(".mandate-accordion")) {
      details.parentElement.querySelectorAll(".mandate-accordion[open]").forEach(other => {
        if (other !== details) setOpen(other, false);
      });
    }
    setOpen(details, shouldOpen);
  }, true);

  window.accordionMotion = { setOpen };
})();
