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
 * Keeps React Router aligned with the browser URL on Back/Forward (popstate).
 * Only reacts to popstate — never calls navigate() on normal renders, otherwise
 * forward history is wiped after going back.
 */
export default function HistorySync() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationRef = useRef(location);

  locationRef.current = location;

  useLayoutEffect(() => {
    const onPopState = () => {
      // Let React Router handle popstate first; only fix if still out of sync.
      requestAnimationFrame(() => {
        const windowPath = getWindowRouterPath();
        const routerPath = `${locationRef.current.pathname}${locationRef.current.search}${locationRef.current.hash}`;

        if (windowPath === routerPath) {
          return;
        }

        flushSync(() => {
          navigate(windowPath, { replace: false });
        });
      });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate]);

  return null;
}
