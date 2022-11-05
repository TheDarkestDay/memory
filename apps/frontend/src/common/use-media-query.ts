

import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleMediaChange = ({matches}: MediaQueryListEvent) => {
      setMatches(matches);
    };

    mediaQueryList.addEventListener('change', handleMediaChange);

    return () => mediaQueryList.removeEventListener('change', handleMediaChange);
  }, [setMatches]);

  return matches;
};