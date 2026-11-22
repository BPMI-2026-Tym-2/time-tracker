import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

export function useIsMobile() {
  const isMobile = React.useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(MEDIA_QUERY);
      mql.addEventListener('change', onStoreChange);

      return () => mql.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(MEDIA_QUERY).matches,
    () => false,
  );

  return isMobile;
}
