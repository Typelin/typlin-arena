import './choreography.css';

// Reversible section-relative movement; native scrolling remains in control.
export function mountChoreography() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [...document.querySelectorAll('[data-shot]')];
  let pending = false;
  const update = () => {
    for (const scene of scenes) {
      const rect = scene.getBoundingClientRect();
      if (rect.bottom < -innerHeight || rect.top > innerHeight * 2) continue;
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
      scene.style.setProperty('--shot', reduced.matches ? '0' : String((progress - .5) * 2));
    }
    pending = false;
  };
  const request = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  addEventListener('scroll', request, {passive:true});
  addEventListener('resize', request, {passive:true});
  reduced.addEventListener?.('change', request);
  update();
}
