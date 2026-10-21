import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { initMetaPixel, trackPageView } from '../../utils/metaPixel';

/**
 * Route listener component that automatically fetches dynamic Meta configuration
 * from /api/v1/meta/config and triggers Meta Pixel PageView on route changes,
 * excluding admin and internal dashboard paths.
 */
export const MetaPixelTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    initMetaPixel().then(() => {
      trackPageView(location.pathname);
    });
  }, [location.pathname, location.search]);

  return null;
};

export default MetaPixelTracker;
