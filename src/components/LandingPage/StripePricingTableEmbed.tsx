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
  /** Hide Stripe subscribe / trial CTAs inside the embedded pricing table. */
  hideSubscribeButton?: boolean;
  /** Landing-page mode: intercept subscribe CTAs and run this instead of Stripe Checkout. */
  onSubscribeClick?: () => void;
};

function isSubscribeCta(element: Element): boolean {
  const label = element.textContent?.trim().toLowerCase() ?? '';
  return (
    element.tagName === 'BUTTON' ||
    label.includes('trial') ||
    label.includes('subscribe') ||
    label.includes('start')
  );
}

function configurePricingTableButtons(
  shadowRoot: ShadowRoot,
  options: { hide?: boolean; onSubscribeClick?: () => void }
) {
  shadowRoot.querySelectorAll('button, a').forEach((element) => {
    if (!isSubscribeCta(element)) return;

    const el = element as HTMLElement;

    if (options.hide) {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.setAttribute('aria-hidden', 'true');
      el.tabIndex = -1;
      return;
    }

    if (!options.onSubscribeClick) return;
    if (el.dataset.harxSubscribeRedirect === 'true') return;

    el.dataset.harxSubscribeRedirect = 'true';
    el.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        options.onSubscribeClick?.();
      },
      true
    );
  });
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

  useEffect(() => {
    if (!ready || (!hideSubscribeButton && !onSubscribeClick)) return;

    let shadowObserver: MutationObserver | undefined;
    let hostObserver: MutationObserver | undefined;
    let intervalId = 0;
    let timeoutId = 0;

    const applyButtonConfig = (shadowRoot: ShadowRoot) => {
      configurePricingTableButtons(shadowRoot, {
        hide: hideSubscribeButton,
        onSubscribeClick,
      });
    };

    const attachToHost = () => {
      const host = containerRef.current?.querySelector('stripe-pricing-table');
      const shadowRoot = host?.shadowRoot;
      if (!shadowRoot) return false;

      applyButtonConfig(shadowRoot);
      shadowObserver?.disconnect();
      shadowObserver = new MutationObserver(() => applyButtonConfig(shadowRoot));
      shadowObserver.observe(shadowRoot, { childList: true, subtree: true });
      return true;
    };

    if (!attachToHost()) {
      intervalId = window.setInterval(() => {
        if (attachToHost()) {
          window.clearInterval(intervalId);
        }
      }, 200);
      timeoutId = window.setTimeout(() => window.clearInterval(intervalId), 10000);
    }

    const container = containerRef.current;
    if (container) {
      hostObserver = new MutationObserver(() => attachToHost());
      hostObserver.observe(container, { childList: true, subtree: true });
    }

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
      shadowObserver?.disconnect();
      hostObserver?.disconnect();
    };
  }, [hideSubscribeButton, onSubscribeClick, ready, pricingTableId]);

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
      className={`stripe-pricing-table-wrap w-full stripe-pricing-table-wrap--cols-${columns} ${
        hideSubscribeButton ? 'stripe-pricing-table-wrap--hide-cta' : ''
      } ${className}`}
    >
      <stripe-pricing-table
        pricing-table-id={pricingTableId}
        publishable-key={publishableKey}
      />
    </div>
  );
}
