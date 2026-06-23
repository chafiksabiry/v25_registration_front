import React, { useEffect, useState } from 'react';
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
};

export function StripePricingTableEmbed({
  pricingTableId,
  publishableKey = STRIPE_PUBLISHABLE_KEY,
  className = '',
}: StripePricingTableEmbedProps) {
  const [ready, setReady] = useState(
    typeof window !== 'undefined' && Boolean(window.customElements?.get('stripe-pricing-table'))
  );
  const [error, setError] = useState<string | null>(null);

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
      <div className={`flex h-72 flex-col items-center justify-center gap-3 ${className}`}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-harx-500/20 border-t-harx-500" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Loading plans…
        </p>
      </div>
    );
  }

  return (
    <div className={`stripe-pricing-table-wrap w-full ${className}`}>
      <stripe-pricing-table
        pricing-table-id={pricingTableId}
        publishable-key={publishableKey}
      />
    </div>
  );
}
