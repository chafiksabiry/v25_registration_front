import React from 'react';
import './public-path';  // For proper Qiankun integration
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initVisitorTrackingScripts } from './lib/initVisitorTracking';
import { syncVisitorTracking } from './lib/tracking/visitorTracking';
import './lib/i18n';

initVisitorTrackingScripts();

// Store the root instance for proper unmounting
let root: ReturnType<typeof createRoot> | null = null;

function render(props: { container?: HTMLElement }) {
  const { container } = props;
  // Do not paint into the host #root while under qiankun (destroys shell containers).
  if (qiankunWindow.__POWERED_BY_QIANKUN__ && !container) {
    return;
  }

  let rootElement: Element | null = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (container && !rootElement) {
    const el = document.createElement('div');
    el.id = 'root';
    container.appendChild(el);
    rootElement = el;
  }

  if (rootElement) {
    syncVisitorTracking();
    console.log('[Auth] Rendering in container:', rootElement);
    // Create the root instance if it doesn't exist
    if (!root) {
      root = createRoot(rootElement);
    }
    root.render(
      //<StrictMode>
        <App />
      //</StrictMode>
    );
  } else {
    console.warn('[Auth] Root element not found!');
  }
}

export async function bootstrap() {
  console.time('[Auth] bootstrap');
  console.log('[Auth] Bootstrapping...');
  return Promise.resolve();
}

export async function mount(props: any) {
  console.log('[Auth] Mounting...', props);
  // Always remount React tree so AuthContext re-reads token after logout/login
  // in another microfrontend (reps/company) without a full browser refresh.
  if (root) {
    try {
      root.unmount();
    } catch {
      /* ignore */
    }
    root = null;
  }
  const { container } = props;
  if (container) {
    console.log('[Auth] Found container for mounting:', container);
  } else {
    console.warn('[Auth] No container found for mounting');
  }
  render(props);
  return Promise.resolve();
}

export async function unmount(props: any) {
  console.log('[Auth] Unmounting...', props);
  const { container } = props;
  const rootElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (rootElement && root) {
    console.log('[Auth] Unmounting from container:', rootElement);
    root.unmount();
    root = null;  // Reset the root instance
  } else {
    console.warn('[Auth] Root element not found for unmounting!');
  }
  return Promise.resolve();
}

// Standalone only — in qiankun, wait for mount(props) with the real container
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('[Auth] Running in standalone mode');
  render({});
} else {
  console.log('[Auth] Running inside Qiankun — waiting for mount()');
}