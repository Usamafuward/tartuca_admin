import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Automatically resets scroll position to the top of the window and all scrollable main containers
 * whenever the route (pathname or search) changes.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Reset standard browser window and body scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 2. Reset layout main container scroll position
    const mainContainers = document.querySelectorAll('main');
    mainContainers.forEach((container) => {
      container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      container.scrollTop = 0;
    });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
