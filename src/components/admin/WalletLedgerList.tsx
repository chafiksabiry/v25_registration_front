import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Minus } from 'lucide-react';
import { StatusBadge } from './adminUiUtils';
import type { LedgerLine } from './walletLedger';

function directionIcon(direction: LedgerLine['direction']) {
  if (direction === 'credit') return <ArrowDownLeft size={16} className="text-emerald-600" />;
  if (direction === 'debit') return <ArrowUpRight size={16} className="text-red-500" />;
  return <Minus size={16} className="text-slate-400" />;
}

function directionBg(direction: LedgerLine['direction']) {
  if (direction === 'credit') return 'bg-emerald-50 border-emerald-100';
  if (direction === 'debit') return 'bg-red-50 border-red-100';
  return 'bg-slate-50 border-slate-100';
}

export function WalletLedgerList({
  lines,
  emptyMessage,
}: {
  lines: LedgerLine[];
  emptyMessage: string;
}) {
  if (!lines.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lines.map((line) => (
        <article
          key={line.id}
          className={`rounded-2xl border p-4 transition-shadow hover:shadow-sm ${directionBg(line.direction)}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                {directionIcon(line.direction)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {line.category}
                  </span>
                  {line.status && (
                    <StatusBadge
                      label={line.status}
                      tone={
                        line.status === 'completed' || line.status === 'succeeded'
                          ? 'success'
                          : line.status === 'pending'
                            ? 'warning'
                            : 'neutral'
                      }
                    />
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mt-1">{line.cause}</h3>
                <p className="text-sm text-slate-600 mt-1 break-words">{line.details}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {line.date ? new Date(line.date).toLocaleString('fr-FR') : '—'}
                </p>
              </div>
            </div>
            <p className="text-base font-black text-slate-900 whitespace-nowrap shrink-0">
              {line.amountLabel}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
