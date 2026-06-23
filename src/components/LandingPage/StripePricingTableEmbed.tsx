import React, { useEffect, useRef, useState } from 'react';
import { STRIPE_PUBLISHABLE_KEY } from './stripePricingConfig';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
          'client-reference-id'?: string;
          'customer-email'?: string;
        },
        HTMLElement
      >;
    }
  }
}

const PRICING_TABLE_SRC = 'https://js.stripe.com/v3/pricing-table.js';
const STYLE_ID = 'harx-pricing-table-style';

let scriptPromise: Promise<void> | null = null;

function loadPricingTableScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.customElements?.get('stripe-pricing-table')) return resolve();

    const existing = document.querySelector(
      `script[src="${PRICING_TABLE_SRC}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Stripe pricing-table.js failed to load')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = PRICING_TABLE_SRC;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('Stripe pricing-table.js failed to load'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

type StripePricingTableEmbedProps = {
  pricingTableId: string;
  publishableKey?: string;
  className?: string;
  /** Expected plan count — used to reserve enough width for one row (3 company / 4 rep). */
  columns?: 3 | 4;
  /** Hide Stripe subscribe / trial CTAs (landing page company plans). */
  hideSubscribeButton?: boolean;
  /** Landing-page mode: overlay CTAs redirect here instead of Stripe Checkout. */
  onSubscribeClick?: () => void;
};

function collectShadowRoots(node: ParentNode): ShadowRoot[] {
  const roots: ShadowRoot[] = [];

  const visit = (parent: ParentNode) => {
    parent.querySelectorAll('*').forEach((element) => {
      if (element instanceof HTMLElement && element.shadowRoot) {
        roots.push(element.shadowRoot);
        visit(element.shadowRoot);
      }
    });
  };

  if (node instanceof HTMLElement && node.shadowRoot) {
    roots.push(node.shadowRoot);
    visit(node.shadowRoot);
  }

  visit(node);
  return roots;
}

function injectShadowStyles(host: HTMLElement, css: string) {
  collectShadowRoots(host).forEach((root) => {
    if (root.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    root.appendChild(style);
  });
}

function blockStripeCheckout(host: HTMLElement) {
  injectShadowStyles(
    host,
    `
      button,
      a[role="button"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      iframe {
        pointer-events: none !important;
      }
    `
  );
}

function PricingCtaOverlay({
  columns,
  mode,
  onSubscribeClick,
}: {
  columns: 3 | 4;
  mode: 'hide' | 'redirect';
  onSubscribeClick?: () => void;
}) {
  return (
    <div
      className={`harx-pricing-cta-overlay harx-pricing-cta-overlay--cols-${columns} harx-pricing-cta-overlay--${mode}`}
      aria-hidden={mode === 'hide'}
    >
      {Array.from({ length: columns }, (_, index) => (
        <button
          key={index}
          type="button"
          tabIndex={mode === 'hide' ? -1 : 0}
          className="harx-pricing-cta-overlay__slot"
          aria-hidden={mode === 'hide'}
          onClick={mode === 'redirect' ? onSubscribeClick : undefined}
        />
      ))}
    </div>
  );
}

export function StripePricingTableEmbed({
  pricingTableId,
  publishableKey = STRIPE_PUBLISHABLE_KEY,
  className = '',
  columns = 3,
  hideSubscribeButton = false,
  onSubscribeClick,
}: StripePricingTableEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(
    typeof window !== 'undefined' && Boolean(window.customElements?.get('stripe-pricing-table'))
  );
  const [error, setError] = useState<string | null>(null);
  const useCtaOverlay = hideSubscribeButton || Boolean(onSubscribeClick);
  const overlayMode = hideSubscribeButton ? 'hide' : 'redirect';

  useEffect(() => {
    if (!ready || !useCtaOverlay) return;

    let shadowObserver: MutationObserver | undefined;
    let hostObserver: MutationObserver | undefined;
    let intervalId = 0;
    let timeoutId = 0;

    const applyCheckoutBlock = () => {
      const host = containerRef.current?.querySelector('stripe-pricing-table');
      if (!(host instanceof HTMLElement)) return false;
      blockStripeCheckout(host);
      return true;
    };

    if (!applyCheckoutBlock()) {
      intervalId = window.setInterval(() => {
        if (applyCheckoutBlock()) {
          window.clearInterval(intervalId);
        }
      }, 200);
      timeoutId = window.setTimeout(() => window.clearInterval(intervalId), 15000);
    }

    const container = containerRef.current;
    if (container) {
      hostObserver = new MutationObserver(() => applyCheckoutBlock());
      hostObserver.observe(container, { childList: true, subtree: true });
    }

    const host = container?.querySelector('stripe-pricing-table');
    if (host instanceof HTMLElement && host.shadowRoot) {
      shadowObserver = new MutationObserver(() => applyCheckoutBlock());
      shadowObserver.observe(host.shadowRoot, { childList: true, subtree: true });
    }

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
      shadowObserver?.disconnect();
      hostObserver?.disconnect();
    };
  }, [ready, useCtaOverlay, pricingTableId]);

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    void loadPricingTableScript()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load pricing table');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (error) {
    return (
      <div className={`rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600 ${className}`}>
        <p className="text-sm font-semibold">{error}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className={`flex h-40 flex-col items-center justify-center gap-2 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-harx-500/20 border-t-harx-500" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Loading plans…
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`stripe-pricing-table-wrap relative w-full stripe-pricing-table-wrap--cols-${columns} ${
        useCtaOverlay ? 'stripe-pricing-table-wrap--cta-overlay' : ''
      } ${className}`}
    >
      <stripe-pricing-table
        pricing-table-id={pricingTableId}
        publishable-key={publishableKey}
      />
      {useCtaOverlay && (
        <PricingCtaOverlay
          columns={columns}
          mode={overlayMode}
          onSubscribeClick={onSubscribeClick}
        />
      )}
    </div>
  );
}
