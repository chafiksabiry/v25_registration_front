import { useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRouterBasename } from '../../utils/routerBasename';

function getWindowRouterPath(): string {
  const basename = getRouterBasename();
  let pathname = window.location.pathname;

  if (basename !== '/' && pathname.startsWith(basename)) {
    pathname = pathname.slice(basename.length) || '/';
  }

  return `${pathname}${window.location.search}${window.location.hash}`;
}

/**
 * Keeps React Router aligned with the browser URL on Back/Forward.
 * Qiankun hosts sometimes update window.location without updating the router.
 */
export default function HistorySync() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationRef = useRef(location);

  locationRef.current = location;

  useLayoutEffect(() => {
    const syncFromWindow = () => {
      const windowPath = getWindowRouterPath();
      const routerPath = `${locationRef.current.pathname}${locationRef.current.search}${locationRef.current.hash}`;

      if (windowPath === routerPath) {
        return;
      }

      flushSync(() => {
        navigate(windowPath);
      });
    };

    const onPopState = () => {
      syncFromWindow();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate]);

  useLayoutEffect(() => {
    const windowPath = getWindowRouterPath();
    const routerPath = `${location.pathname}${location.search}${location.hash}`;

    if (windowPath !== routerPath) {
      flushSync(() => {
        navigate(windowPath);
      });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}
