import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type RouterHistoryState = { idx?: number } | null;

/** True when React Router has a previous entry (Back is meaningful). */
export function canGoBackInHistory(): boolean {
  const state = window.history.state as RouterHistoryState;
  return typeof state?.idx === 'number' && state.idx > 0;
}

/**
 * Browser-style back with a safe fallback when history is empty
 * (direct link, refresh, or qiankun desync).
 */
export function useHistoryBack(fallback = '/') {
  const navigate = useNavigate();

  return useCallback(() => {
    if (canGoBackInHistory()) {
      navigate(-1);
      return;
    }
    navigate(fallback);
  }, [navigate, fallback]);
}
