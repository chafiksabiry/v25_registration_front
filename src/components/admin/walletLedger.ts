import { formatCents, formatDate, formatMoney } from './adminUiUtils';

export type LedgerLine = {
  id: string;
  date: string;
  category: string;
  cause: string;
  details: string;
  amountLabel: string;
  status?: string;
  direction: 'credit' | 'debit' | 'neutral';
};

const PAYMENT_PURPOSE: Record<string, string> = {
  wallet_deposit: 'Recharge wallet',
  minutes_purchase: 'Achat de minutes',
  subscription_upgrade: 'Upgrade abonnement',
};

const COMMISSION_TYPE: Record<string, string> = {
  minute_purchase: 'Commission minutes',
  call_commission: 'Commission appel',
  transaction_commission: 'Commission transaction',
  bonus_commission: 'Commission bonus',
  phone_number: 'Commission ligne téléphonique',
};

const REP_TX_TYPE: Record<string, string> = {
  call_validated: 'Appel validé',
  transaction: 'Vente / transaction',
  bonus: 'Bonus',
};

export function displayValue(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (obj.skill !== undefined) {
      const parts = [String(obj.skill)];
      if (obj.level != null) parts.push(`Niv. ${obj.level}`);
      if (obj.details) parts.push(String(obj.details));
      return parts.join(' · ');
    }
    if (obj.name) return String(obj.name);
    if (obj.label) return String(obj.label);
    if (obj.title) return String(obj.title);
    if (obj.planName) return String(obj.planName);
    return '—';
  }
  return String(value);
}

export function normalizeListItems(items?: unknown[]): string[] {
  if (!items?.length) return [];
  return items.map(displayValue).filter((item) => item !== '—');
}

function pushLine(lines: LedgerLine[], line: Omit<LedgerLine, 'id'> & { id?: string }) {
  lines.push({
    ...line,
    id: line.id || `${line.category}-${line.date}-${lines.length}`,
  });
}

export function buildAccountLedger(
  financials: Record<string, any>,
  isCompany: boolean,
  isRep: boolean,
): LedgerLine[] {
  const lines: LedgerLine[] = [];

  if (isCompany) {
    for (const entry of financials.walletEntries || []) {
      pushLine(lines, {
        id: String(entry._id),
        date: entry.createdAt,
        category: 'Wallet entreprise',
        cause: entry.type === 'deposit' ? 'Dépôt' : entry.type === 'withdrawal' ? 'Retrait' : entry.type === 'adjustment' ? 'Ajustement admin' : entry.type,
        details: entry.description || `${entry.direction} · solde après ${formatMoney(entry.balanceAfter, entry.currency || 'EUR')}`,
        amountLabel: `${entry.direction === 'credit' ? '+' : '-'}${formatMoney(entry.amount, entry.currency || 'EUR')}`,
        status: entry.status,
        direction: entry.direction === 'credit' ? 'credit' : 'debit',
      });
    }

    for (const payment of financials.payments || []) {
      const isMinutes = payment.purpose === 'minutes_purchase';
      pushLine(lines, {
        id: String(payment._id),
        date: payment.createdAt,
        category: isMinutes ? 'Minutes' : 'Paiement',
        cause: PAYMENT_PURPOSE[payment.purpose] || payment.purpose,
        details: `${payment.provider?.toUpperCase()} · ${payment.status}${payment.quantity ? ` · ${payment.quantity} min` : ''}`,
        amountLabel: formatCents(payment.amount, payment.currency || 'EUR'),
        status: payment.status,
        direction: payment.status === 'succeeded' ? 'debit' : 'neutral',
      });
    }

    for (const payment of financials.phoneNumberPayments || []) {
      pushLine(lines, {
        id: String(payment._id),
        date: payment.createdAt,
        category: 'Téléphonie',
        cause: 'Achat ligne téléphonique',
        details: `${payment.phoneNumber} · ${payment.provider?.toUpperCase()} · ${payment.status}`,
        amountLabel: formatCents(payment.amount, payment.currency || 'EUR'),
        status: payment.status,
        direction: payment.status === 'succeeded' ? 'debit' : 'neutral',
      });
    }

    for (const line of financials.phoneNumbers || []) {
      if (!line.createdAt && !line.price) continue;
      pushLine(lines, {
        id: String(line._id),
        date: line.createdAt,
        category: 'Téléphonie',
        cause: line.isTrial ? 'Ligne trial' : 'Ligne active',
        details: `${line.phoneNumber} · ${line.provider} · ${line.status}${line.isTrial ? ' · essai' : ''}`,
        amountLabel: line.price ? formatMoney(line.price, line.currency || 'EUR') : '—',
        status: line.status,
        direction: 'neutral',
      });
    }

    for (const row of financials.repTransactions || []) {
      pushLine(lines, {
        id: String(row._id),
        date: row.createdAt,
        category: 'Activité REP',
        cause: REP_TX_TYPE[row.type] || row.type,
        details: row.description || `REP ${formatMoney(row.repShare)} · HARX ${formatMoney(row.harxShare)}`,
        amountLabel: formatMoney(row.amount),
        status: row.status,
        direction: 'neutral',
      });
    }
  }

  if (isRep) {
    for (const row of financials.transactions || []) {
      pushLine(lines, {
        id: String(row._id),
        date: row.createdAt,
        category: 'Gain REP',
        cause: REP_TX_TYPE[row.type] || row.type,
        details: row.description || `Part REP ${formatMoney(row.repShare)} · HARX ${formatMoney(row.harxShare)}`,
        amountLabel: `+${formatMoney(row.repShare)}`,
        status: row.status,
        direction: 'credit',
      });
    }

    for (const row of financials.withdrawals || []) {
      pushLine(lines, {
        id: String(row._id),
        date: row.createdAt,
        category: 'Retrait',
        cause: row.method === 'paypal' ? 'Retrait PayPal' : 'Retrait bancaire',
        details: row.reference || row.description || row.status,
        amountLabel: `-${formatMoney(row.amount)}`,
        status: row.status,
        direction: 'debit',
      });
    }
  }

  for (const row of financials.harxCommissions || []) {
    pushLine(lines, {
      id: String(row._id),
      date: row.createdAt,
      category: 'Commission HARX',
      cause: COMMISSION_TYPE[row.type] || row.type,
      details: row.description || 'Commission plateforme',
      amountLabel: `+${formatMoney(row.amount)}`,
      status: 'completed',
      direction: 'credit',
    });
  }

  return lines.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function buildPlatformLedger(recentCommissions: Array<Record<string, any>>): LedgerLine[] {
  return (recentCommissions || []).map((row) => ({
    id: String(row._id),
    date: row.createdAt,
    category: 'Commission HARX',
    cause: COMMISSION_TYPE[row.type] || row.type,
    details: row.description || row.companyId || row.agentId || 'Plateforme',
    amountLabel: `+${formatMoney(row.amount)}`,
    status: 'completed',
    direction: 'credit' as const,
  }));
}

export function summarizeLedger(lines: LedgerLine[]) {
  let credits = 0;
  let debits = 0;
  for (const line of lines) {
    const numeric = parseFloat(line.amountLabel.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (Number.isNaN(numeric)) continue;
    if (line.direction === 'credit') credits += numeric;
    if (line.direction === 'debit') debits += numeric;
  }
  return { credits, debits, count: lines.length };
}

export function formatLedgerDate(date?: string) {
  if (!date) return '—';
  return formatDate(date);
}
