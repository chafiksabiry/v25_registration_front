/**
 * Hard navigation that works inside the qiankun sandbox.
 * Micro-app `window.location` can fail to update the host URL; use rawWindow when present.
 */
export function hardNavigate(url: string): void {
  const topWindow = (window as Window & { rawWindow?: Window }).rawWindow ?? window;
  topWindow.location.replace(url);
}
