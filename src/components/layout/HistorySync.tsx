import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Keeps React Router in sync when the browser Back/Forward buttons change
 * window.location without notifying the router (common in qiankun hosts).
 */
export default function HistorySync() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onPopState = () => {
      const windowPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const routerPath = `${location.pathname}${location.search}${location.hash}`;

      if (windowPath !== routerPath) {
        navigate(windowPath);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}
