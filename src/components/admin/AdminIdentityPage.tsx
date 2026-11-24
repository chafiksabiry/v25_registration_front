import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';
import { HARX_BRAND } from '../../lib/harxBrand';
import {
  CHECK_ICON,
  IDENTITY_REJECT_CODES,
  IDENTITY_STATUS_OPTIONS,
  adminLabelFromToken,
  approveBody,
  canDecide,
  checkLine,
  comparisonRows,
  filePages,
  identityErrorMessage,
  identityReviewApi,
  initialCountryChoice,
  isRtl,
  listMetaLine,
  pendingOf,
  verifiedSummary,
  watermarkText,
  type CountryKey,
  type IdentityDecisionBody,
  type IdentityDetail,
  type IdentityFile,
  type IdentityListItem,
  type IdentityStatusFilter,
} from '../../lib/identityReviewApi';
import { AdminPageHeader } from './adminPageShell';

const NAVY = '#0B1B3F';
const BRAND_GRADIENT = `linear-gradient(90deg, ${HARX_BRAND.orange} 0%, ${HARX_BRAND.magenta} 100%)`;
const fmt = (d: string) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? '' : t.toLocaleString('fr-FR');
};
const CHECK_TONE: Record<string, string> = { pass: 'text-emerald-700', review: 'text-amber-700', fail: 'text-red-700', info: 'text-slate-500' };

/**
 * Image d'une pièce : déchiffrée à la volée par le serveur, dessinée dans un canvas avec le filigrane
 * « HARX — revue — date — admin ». Clic droit et glisser désactivés ; l'URL temporaire est libérée dès le dessin.
 */
function WatermarkedImage({ verificationId, file, page, admin }: { verificationId: string; file: IdentityFile; page: number | null; admin: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    identityReviewApi
      .file(verificationId, file.fileId, page)
      .then((blob) => {
        if (!alive) return;
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          const c = ref.current;
          if (!alive || !c) return;
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const g = c.getContext('2d');
          if (!g) return;
          g.drawImage(img, 0, 0);
          const s = watermarkText(admin);
          g.save();
          g.globalAlpha = 0.35;
          g.fillStyle = '#ffd666';
          g.font = `bold ${Math.round(c.width / 28)}px sans-serif`;
          g.translate(c.width / 2, c.height / 2);
          g.rotate(-0.28);
          for (let y = -c.height; y < c.height; y += c.height / 4) g.fillText(s, -c.width / 2, y);
          g.restore();
          setState('ready');
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          if (alive) setState('error');
        };
        img.src = url;
      })
      .catch(() => alive && setState('error'));
    return () => {
      alive = false;
    };
  }, [verificationId, file.fileId, page, admin]);

  return (
    <div className="relative">
      <canvas
        ref={ref}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className="w-full select-none rounded-xl border border-slate-200 bg-black"
        style={{ minHeight: state === 'ready' ? undefined : 120 }}
        aria-label={`Pièce ${file.kind}${page == null ? '' : `, page ${page + 1}`}`}
      />
      {state !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
          {state === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Image illisible ou supprimée.'}
        </div>
      )}
    </div>
  );
}

function PdfFile({ verificationId, file }: { verificationId: string; file: IdentityFile }) {
  const [busy, setBusy] = useState(false);
  const openPdf = async () => {
    setBusy(true);
    try {
      const blob = await identityReviewApi.file(verificationId, file.fileId);
      window.open(URL.createObjectURL(blob), '_blank', 'noopener');
    } finally {
      setBusy(false);
    }
  };
  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <FileText className="h-4 w-4" />
      PDF ({Number(file.meta?.pages) || 1} page(s)) :
      <button type="button" disabled={busy} onClick={() => void openPdf()} className="rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
        Ouvrir le PDF (journalisé)
      </button>
    </p>
  );
}

function DecisionBar({ d, onDecide, busy }: { d: IdentityDetail; onDecide: (body: IdentityDecisionBody) => void; busy: boolean }) {
  const init = useMemo(() => initialCountryChoice(d), [d]);
  const [choice, setChoice] = useState<Record<CountryKey, boolean>>({ residence: init.residence.checked, nationality: init.nationality.checked });
  const [reason, setReason] = useState<string>(IDENTITY_REJECT_CODES[0]);
  const [note, setNote] = useState('');
  const pend = pendingOf(d);
  const box = (k: CountryKey, label: string, value?: string) => (
    <label className={`inline-flex items-center gap-1.5 text-sm ${init[k].locked ? 'text-slate-400' : 'text-slate-700'}`}>
      <input
        type="checkbox"
        checked={choice[k]}
        disabled={init[k].locked || busy}
        onChange={(e) => setChoice((c) => ({ ...c, [k]: e.target.checked }))}
        className="h-4 w-4 accent-pink-600"
      />
      {label} {value || '?'}
    </label>
  );
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="identity-decision">
      {box('residence', 'Résidence', d.declared?.residence)}
      {box('nationality', 'Nationalité', d.declared?.nationality)}
      <button
        type="button"
        disabled={busy}
        onClick={() => onDecide(approveBody(d, choice))}
        className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-50"
        style={{ backgroundImage: BRAND_GRADIENT }}
      >
        {pend.length ? 'Valider ce pays aussi' : 'Valider'}
      </button>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        aria-label="Motif du refus"
        className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700"
      >
        {IDENTITY_REJECT_CODES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        placeholder="Note (facultatif)"
        className="min-w-[160px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => onDecide({ outcome: 'rejected', reasonCode: reason, note })}
        className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {pend.length ? 'Ne pas ouvrir ce pays' : 'Refuser'}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onDecide({ outcome: 'resubmit', note })}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Demander un autre document
      </button>
    </div>
  );
}

function Detail({ d, admin, onDecide, busy }: { d: IdentityDetail; admin: string; onDecide: (body: IdentityDecisionBody) => void; busy: boolean }) {
  const summary = verifiedSummary(d);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-2 border-b border-violet-50 px-4 py-3">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-bold" style={{ color: NAVY }}>
            {d.declared?.fullName || '(sans nom)'}
          </span>
          <span className="text-xs text-slate-500">
            n° {d.attempt} · {fmt(d.createdAt)} · {d.status}
          </span>
        </p>
        {summary && <p className="text-xs font-medium text-emerald-700">{summary}</p>}
        {canDecide(d) && <DecisionBar key={d.id} d={d} onDecide={onDecide} busy={busy} />}
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          {!d.files.length && <p className="text-sm text-slate-500">Images supprimées (décision prise ou délai écoulé).</p>}
          {d.files.map((f) => (
            <div key={f.fileId} className="space-y-2">
              <h3 className="text-sm font-semibold" style={{ color: NAVY }}>
                {f.kind}
              </h3>
              {(f.signals || []).map((s, i) => (
                <p key={i} className="flex flex-wrap items-center gap-1.5 text-xs text-amber-800">
                  <span className="rounded-full bg-amber-100 px-2 py-px font-semibold">{s.code}</span>
                  {s.detail && <span>{s.detail}</span>}
                </p>
              ))}
              {f.mime === 'application/pdf' ? (
                <PdfFile verificationId={d.id} file={f} />
              ) : (
                filePages(f).map((p) => <WatermarkedImage key={String(p)} verificationId={d.id} file={f} page={p} admin={admin} />)
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4 text-sm">
          <section>
            <h3 className="mb-1.5 font-semibold" style={{ color: NAVY }}>
              Contrôles calculés par le code
            </h3>
            <ul className="space-y-1">
              {d.checks.map((c, i) => (
                <li key={i} className={`flex gap-2 ${CHECK_TONE[c.result] || 'text-slate-500'}`}>
                  <span className="w-3 shrink-0 text-center font-bold">{CHECK_ICON[c.result] || '·'}</span>
                  <span className="break-words">{checkLine(c)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold" style={{ color: NAVY }}>
              Déclaré / lu
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {['', 'Déclaré', 'Pièce', 'Justificatif'].map((h) => (
                      <th key={h} className="border-b border-slate-200 px-2 py-1.5 text-left font-medium text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows(d).map((row) => (
                    <tr key={row[0]}>
                      {row.map((v, k) => (
                        <td key={k} dir={isRtl(v) ? 'rtl' : undefined} className={`border-b border-slate-100 px-2 py-1.5 align-top ${k === 0 ? 'font-medium text-slate-600' : 'text-slate-800'}`}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Le texte lu est affiché tel quel (jamais interprété). Les images sont supprimées dès votre décision.</p>
          </section>

          <section>
            <h3 className="mb-1.5 font-semibold" style={{ color: NAVY }}>
              Journal
            </h3>
            {(d.accessLog || []).length === 0 ? (
              <p className="text-xs text-slate-400">Aucune consultation.</p>
            ) : (
              <ul className="space-y-0.5 text-xs text-slate-500">
                {d.accessLog.map((l, i) => (
                  <li key={i}>
                    {fmt(l.at)} · {l.adminId} · {l.action}
                    {l.fileId ? ` · ${l.fileId}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * Revue des pièces d'identité, dans le portail admin (page derrière AdminRoute). Mêmes routes et mêmes fonctions que la page
 * de l'orchestrateur, avec la session admin ouverte : aucun jeton à saisir. Tout le texte est rendu en texte, jamais en HTML.
 * `?dossier=<id>` ouvre directement un dossier (lien depuis l'Inbox support).
 */
export default function AdminIdentityPage(): React.ReactElement {
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState<IdentityStatusFilter>('review');
  const [items, setItems] = useState<IdentityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [detail, setDetail] = useState<IdentityDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const selected = params.get('dossier');
  const openedId = useRef<string | null>(null);
  const admin = useMemo(() => adminLabelFromToken(localStorage.getItem('token')), []);

  const loadList = useCallback(async (st: IdentityStatusFilter) => {
    setRefreshing(true);
    try {
      const d = await identityReviewApi.list(st);
      setItems(d.verifications);
      setError(null);
    } catch (e) {
      setError(identityErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    openedId.current = id;
    setDetail(null);
    setDetailError(null);
    try {
      const d = await identityReviewApi.detail(id);
      if (openedId.current === id) setDetail(d);
    } catch (e) {
      if (openedId.current === id) setDetailError(identityErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void loadList(status);
  }, [loadList, status]);

  useEffect(() => {
    if (selected) {
      setNotice(null);
      void loadDetail(selected);
    } else {
      openedId.current = null;
      setDetail(null);
      setDetailError(null);
    }
  }, [selected, loadDetail]);

  const open = (id: string) => setParams({ dossier: id });
  const close = () => setParams({});

  const decide = async (body: IdentityDecisionBody) => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      await identityReviewApi.decide(selected, body);
      setParams({});
      setNotice('Décision enregistrée.');
      await loadList(status);
    } catch (e) {
      setDetailError(identityErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 admin-stagger">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader icon={ShieldCheck} title="Identité" subtitle="Revue des pièces d'identité : dossiers à vérifier et décisions." />
        <div className="flex items-center gap-2 sm:pt-2">
          <button
            type="button"
            onClick={() => {
              void loadList(status);
              if (selected) void loadDetail(selected);
            }}
            aria-label="Actualiser"
            className="rounded-xl border border-violet-100 bg-white p-2 text-slate-600 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void loadList(status)} className="font-semibold underline">
            Réessayer
          </button>
        </div>
      )}

      <div className="grid h-[calc(100vh-15rem)] min-h-[460px] gap-4 lg:grid-cols-[minmax(280px,340px)_1fr]" data-testid="admin-identity">
        {/* Liste */}
        <section
          className={`${selected ? 'hidden lg:flex' : 'flex'} min-h-0 flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white/90`}
          aria-label="Vérifications"
        >
          <div className="space-y-2 border-b border-violet-50 p-3">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par statut">
              {IDENTITY_STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={status === o.value}
                  onClick={() => setStatus(o.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    status === o.value ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={status === o.value ? { backgroundImage: BRAND_GRADIENT } : undefined}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {!loading && !error && <p className="text-xs text-slate-500">{items.length} vérification(s), plus anciennes d’abord</p>}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2 border-b border-violet-50 px-4 py-3">
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                  <div className="h-3 w-4/5 rounded bg-slate-100" />
                </div>
              ))
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-slate-500">
                <UserCheck className="h-8 w-8 text-slate-300" />
                Aucune vérification avec ce statut.
              </div>
            ) : (
              items.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => open(v.id)}
                  aria-current={selected === v.id}
                  className={`block w-full border-b border-violet-50 px-4 py-3 text-left transition-colors hover:bg-violet-50/70 ${
                    selected === v.id ? 'bg-pink-50 shadow-[inset_3px_0_0_#E6188D]' : ''
                  }`}
                >
                  <span className="block truncate text-sm font-semibold" style={{ color: NAVY }}>
                    {v.name || '(sans nom)'}
                  </span>
                  <span className={`mt-0.5 block text-xs ${v.overdue ? 'text-red-600' : 'text-slate-500'}`}>{listMetaLine(v)}</span>
                  {v.reasons.length > 0 && (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {v.reasons.map((r) => (
                        <span key={r} className="rounded-full border border-slate-200 bg-white px-2 py-px text-[11px] font-medium text-slate-600">
                          {r}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Détail */}
        <section
          className={`${selected ? 'flex' : 'hidden lg:flex'} min-h-0 flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white/90`}
          aria-label="Détail"
        >
          {selected && (
            <div className="border-b border-violet-50 px-2 py-1.5 lg:hidden">
              <button type="button" onClick={close} className="inline-flex items-center gap-1 rounded-lg p-1.5 text-sm text-slate-600 hover:bg-slate-100">
                <ArrowLeft className="h-4 w-4" /> Liste
              </button>
            </div>
          )}
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
                <ShieldCheck className="h-7 w-7" />
              </span>
              <p className="text-sm font-medium text-slate-700">{notice || 'Sélectionnez un dossier'}</p>
              <p className="max-w-xs text-xs">Les images sont déchiffrées à l’affichage, marquées à votre nom, et supprimées dès la décision.</p>
            </div>
          ) : detailError && !detail ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-red-700" role="alert">
              {detailError}
            </div>
          ) : !detail ? (
            <div className="flex flex-1 items-center justify-center text-slate-400" role="status" aria-label="Chargement">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {detailError && (
                <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
                  {detailError}
                </p>
              )}
              <Detail d={detail} admin={admin} onDecide={(b) => void decide(b)} busy={busy} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
