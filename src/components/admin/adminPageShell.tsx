import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Save } from 'lucide-react';

type AdminPageHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
};

export function AdminPageHeader({ icon: Icon, title, subtitle, badge }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-header-icon">
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        {badge && <span className="admin-page-header-badge">{badge}</span>}
        <h1 className="admin-page-title">{title}</h1>
        <p className="admin-page-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

type AdminFieldProps = {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function AdminField({ id, label, hint, children }: AdminFieldProps) {
  return (
    <div className="admin-field">
      <label className="admin-field-label" htmlFor={id}>
        {label}
      </label>
      {hint && <p className="admin-field-hint">{hint}</p>}
      {children}
    </div>
  );
}

export function AdminToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`admin-toggle ${checked ? 'admin-toggle--on' : ''}`}
    >
      <span className="admin-toggle-knob" />
    </button>
  );
}

type AdminSaveBarProps = {
  saving: boolean;
  onSave: () => void;
  updatedAt?: string | null;
  error?: string | null;
  success?: string | null;
};

export function AdminSaveBar({ saving, onSave, updatedAt, error, success }: AdminSaveBarProps) {
  return (
    <div className="admin-save-bar">
      <div className="admin-save-bar-inner">
        <div className="space-y-1 min-w-0">
          {success && <p className="admin-alert admin-alert--success">{success}</p>}
          {error && <p className="admin-alert admin-alert--error">{error}</p>}
          {!success && !error && updatedAt && (
            <p className="text-sm text-slate-500">
              Dernière mise à jour : {new Date(updatedAt).toLocaleString('fr-FR')}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="admin-btn-primary shrink-0 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
