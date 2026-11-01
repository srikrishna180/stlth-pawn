import { useEffect } from "react";

/**
 * Fades elements marked `data-reveal` in as they scroll into view.
 *
 * Tracks nodes added after mount too — otherwise anything React swaps in later
 * (a form replaced by a confirmation, say) stays at opacity 0 and reads as a
 * blank section.
 */
export function useReveal(key?: unknown) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = reduced
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          },
          // threshold 0: sections taller than the viewport must still qualify
          { rootMargin: "0px 0px -8% 0px", threshold: 0 },
        );

    function track() {
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (el.classList.contains("is-visible")) return;
        if (observer) observer.observe(el);
        else el.classList.add("is-visible");
      });
    }

    track();
    const mutations = new MutationObserver(track);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [key]);
}
