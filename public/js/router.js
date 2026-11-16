// Navegación sin recargar la página.
const listeners = new Set();
export const onNavigate = (fn) => listeners.add(fn);

export function navigate(path, replace = false) {
  if (path === location.pathname + location.search + location.hash) return;
  history[replace ? 'replaceState' : 'pushState'](null, '', path);
  listeners.forEach((fn) => fn());
}

window.addEventListener('popstate', () => listeners.forEach((fn) => fn()));
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.('a[data-link]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  e.preventDefault();
  navigate(url.pathname + url.search + url.hash);
});
