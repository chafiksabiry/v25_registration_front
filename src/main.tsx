import React from 'react';
import './public-path'; // For proper Qiankun integration
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initVisitorTrackingScripts } from './lib/initVisitorTracking';
import { syncVisitorTracking } from './lib/tracking/visitorTracking';
import './lib/i18n';

initVisitorTrackingScripts();

let root: ReturnType<typeof createRoot> | null = null;

function resolveRootElement(container?: HTMLElement): HTMLElement | null {
  if (container) {
    let el = container.querySelector('#root') as HTMLElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'root';
      container.appendChild(el);
    }
    return el;
  }
  return document.getElementById('root');
}

function render(props: { container?: HTMLElement } = {}) {
  const { container } = props;
  // Never paint into the host document #root under qiankun.
  if (qiankunWindow.__POWERED_BY_QIANKUN__ && !container) {
    return;
  }

  const rootElement = resolveRootElement(container);
  if (!rootElement) {
    console.warn('[Auth] Root element not found!');
    return;
  }

  syncVisitorTracking();
  if (!root) {
    root = createRoot(rootElement);
  }
  root.render(<App />);
}

function destroy(props: { container?: HTMLElement } = {}) {
  if (!root) return;
  try {
    root.unmount();
  } catch {
    /* ignore */
  }
  root = null;
}

// Must use renderWithQiankun — bare export bootstrap/mount are not reliably
// wired for vite-plugin-qiankun (single-spa #31 bootstrap timeout → blank page).
renderWithQiankun({
  bootstrap() {
    console.log('[Auth] Bootstrapping...');
    return Promise.resolve();
  },
  mount(props: any) {
    console.log('[Auth] Mounting...', props);
    if (root) {
      try {
        root.unmount();
      } catch {
        /* ignore */
      }
      root = null;
    }
    render(props);
    return Promise.resolve();
  },
  unmount(props: any) {
    console.log('[Auth] Unmounting...', props);
    destroy(props || {});
    return Promise.resolve();
  },
  update() {
    return Promise.resolve();
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('[Auth] Running in standalone mode');
  render({});
} else {
  console.log('[Auth] Running inside Qiankun — waiting for mount()');
}
