import { useEffect, useRef, useState } from 'react';
import { supportInboxSocketUrl } from '../../lib/api';

export type InboxSignal = { type: 'inbox.changed'; waId: string; reason: 'message' | 'handoff' | 'ticket' | 'deleted' };
export type SocketStatus = 'connecting' | 'live' | 'offline';

/** Délai de reconnexion : 1 s, 2 s, 4 s… plafonné à 30 s, avec un peu d'aléa pour ne pas reconnecter tous les onglets ensemble. */
export const backoffMs = (attempt: number, random = Math.random()): number =>
  Math.round(Math.min(30000, 1000 * 2 ** attempt) * (0.8 + random * 0.4));

/**
 * Temps réel de l'Inbox : WebSocket /support-inbox (jeton admin en sous-protocole), reconnexion automatique avec attente croissante.
 * Le serveur n'envoie que des signaux sans contenu ; l'appelant relit les données par HTTP. Retourne l'état de la connexion.
 */
export function useSupportInboxSocket(onSignal: (signal: InboxSignal) => void): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>('connecting');
  const handler = useRef(onSignal);
  handler.current = onSignal;

  useEffect(() => {
    let socket: WebSocket | null = null;
    let timer: number | undefined;
    let attempt = 0;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      const token = localStorage.getItem('token');
      if (!token || typeof WebSocket === 'undefined') {
        setStatus('offline');
        return;
      }
      setStatus('connecting');
      try {
        socket = new WebSocket(supportInboxSocketUrl(), ['bearer', token]);
      } catch {
        schedule();
        return;
      }
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(String(event.data));
          if (data?.type === 'connected') {
            attempt = 0;
            setStatus('live');
          } else if (data?.type === 'inbox.changed' && typeof data.waId === 'string') {
            handler.current(data as InboxSignal);
          }
        } catch {
          /* message ignoré */
        }
      };
      socket.onclose = () => {
        socket = null;
        if (!stopped) schedule();
      };
      socket.onerror = () => {
        try {
          socket?.close();
        } catch {
          /* déjà fermée */
        }
      };
    };

    const schedule = () => {
      setStatus('offline');
      timer = window.setTimeout(connect, backoffMs(attempt));
      attempt += 1;
    };

    connect();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, []);

  return status;
}
