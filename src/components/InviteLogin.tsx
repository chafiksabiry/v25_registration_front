import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { getPostLoginRedirectUrl, syncSessionUserIdCookie } from '../lib/authRedirect';
import { hardNavigate } from '../lib/appNavigation';
import { captureProductFromUrl } from '../lib/product';

type Status = 'loading' | 'invalid' | 'expired';

/**
 * Lien du bouton d'un e-mail d'invitation : /auth/invite?product=callcentre&t=<jeton>.
 * Le jeton ouvre la session de la personne invitée (cliquer prouve qu'elle lit cette boîte), puis elle arrive directement dans son
 * portail : mot de passe temporaire à remplacer d'abord (écran du portail), ou, si elle a déjà un compte, acceptation de l'invitation.
 */
export default function InviteLogin() {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Le produit (Téléphonie) est retenu avant de masquer l'adresse : la destination après connexion en dépend.
    captureProductFromUrl();
    const linkToken = new URLSearchParams(window.location.search).get('t') ?? '';
    // Le secret ne reste ni dans la barre d'adresse, ni dans l'historique, ni dans les en-têtes Referer.
    window.history.replaceState(null, '', window.location.pathname);
    if (!linkToken) {
      setStatus('invalid');
      return;
    }

    (async () => {
      try {
        const { token } = await auth.inviteLogin(linkToken);
        const { userId } = jwtDecode<{ userId: string }>(token);
        setToken(token, true);
        syncSessionUserIdCookie(token);
        const dest = await getPostLoginRedirectUrl(userId, token);
        hardNavigate(dest || '/auth/signin?product=callcentre&audience=team');
      } catch (err: unknown) {
        const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
        setStatus(code === 'LINK_EXPIRED' ? 'expired' : 'invalid');
      }
    })();
  }, [setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-center">
      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-4 text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>{t('invite.loading', 'Ouverture de votre espace HARX…')}</p>
        </div>
      ) : (
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-amber-400" />
          <h1 className="mb-2 text-lg font-semibold text-white">
            {status === 'expired'
              ? t('invite.expiredTitle', 'Ce lien a expiré')
              : t('invite.invalidTitle', 'Ce lien n’est pas valide')}
          </h1>
          <p className="mb-6 text-sm">
            {t('invite.help', 'Connectez-vous avec votre e-mail et votre mot de passe. Si vous n’en avez pas encore, demandez à la personne qui vous a invité(e) de vous renvoyer l’invitation, ou utilisez « Mot de passe oublié ».')}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/auth/signin?product=callcentre&audience=team" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              {t('invite.signIn', 'Se connecter')}
            </Link>
            <Link to="/auth/recovery" className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white">
              {t('invite.forgot', 'Mot de passe oublié')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
