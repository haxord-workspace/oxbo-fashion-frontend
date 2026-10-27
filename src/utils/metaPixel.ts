import Cookies from 'js-cookie';
import type { MetaCustomData, MetaStandardEvent } from '../types/meta';

/**
 * Public Meta Pixel ID retrieved from environment variables as default.
 */
let activePixelId: string = (
  (typeof import.meta !== 'undefined' && import.meta.env?.META_PIXEL_ID) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_META_PIXEL_ID) ||
  ''
).trim();

let isScriptInjected = false;
let isInitialized = false;
let isTrackingEnabled = true;
let initPromise: Promise<boolean> | null = null;

/**
 * Returns current active Pixel ID.
 */
export function getActivePixelId(): string {
  return activePixelId;
}

/**
 * Checks whether Meta Pixel tracking is enabled and configured.
 */
export function isMetaPixelEnabled(): boolean {
  return isTrackingEnabled && Boolean(activePixelId);
}

/**
 * Generates a unique event identifier for event deduplication.
 * Format: evt_<uuid> (or fallback to evt_<timestamp>_<random>).
 */
export function newMetaEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `evt_${crypto.randomUUID()}`;
  }
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `evt_${timestamp}_${randomPart}`;
}

/**
 * Reads Meta tracking cookies (_fbp and _fbc).
 * If _fbc is not found but 'fbclid' is present in the current URL query params,
 * this function parses it, formats it according to the Meta specification
 * (fb.1.<creationTime>.<fbclid>), persists it in the _fbc cookie, and returns it.
 */
export function getMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof window === 'undefined') {
    return {};
  }

  const fbp = Cookies.get('_fbp');
  let fbc = Cookies.get('_fbc');

  // Fallback: Check if user arrived with fbclid in URL
  if (!fbc && window.location?.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get('fbclid');
      if (fbclid) {
        fbc = `fb.1.${Date.now()}.${fbclid}`;
        // Persist for 90 days per Meta recommendation
        Cookies.set('_fbc', fbc, { expires: 90, path: '/', sameSite: 'lax' });
      }
    } catch {
      // Ignore query parsing errors
    }
  }

  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}

/**
 * Returns HTTP headers for backend Conversions API deduplication.
 * Includes x-meta-event-id, x-meta-fbp, and x-meta-fbc if available.
 */
export function metaHeaders(eventId?: string): Record<string, string> {
  const resolvedEventId = eventId || newMetaEventId();
  const { fbp, fbc } = getMetaCookies();

  const headers: Record<string, string> = {
    'x-meta-event-id': resolvedEventId,
  };

  if (fbp) {
    headers['x-meta-fbp'] = fbp;
  }
  if (fbc) {
    headers['x-meta-fbc'] = fbc;
  }

  return headers;
}

/**
 * Injects the official Meta Pixel script snippet into the DOM once.
 */
function injectMetaSnippet(): void {
  if (typeof window === 'undefined' || isScriptInjected || window.fbq) {
    return;
  }

  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      if (n.callMethod) {
        n.callMethod.apply(n, arguments);
      } else {
        n.queue.push(arguments);
      }
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  isScriptInjected = true;
}

/**
 * Fetches dynamic Meta configuration from the backend endpoint:
 * GET /api/v1/meta/config
 * Falls back to local .env configuration if the endpoint fails.
 */
export async function fetchMetaConfig(apiBaseUrl?: string): Promise<{ isEnabled: boolean; pixelId: string }> {
  try {
    const defaultBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api/v1';
    const baseUrl = apiBaseUrl || defaultBase;
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const configUrl = cleanBase.endsWith('/v1') ? `${cleanBase}/meta/config` : `${cleanBase}/api/v1/meta/config`;

    const res = await fetch(configUrl, { credentials: 'include' });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return {
          isEnabled: Boolean(json.data.isEnabled),
          pixelId: String(json.data.pixelId || activePixelId || '').trim(),
        };
      }
    }
  } catch (err) {
    // Backend may not be reachable or offline, fallback to env configuration
  }

  return {
    isEnabled: Boolean(activePixelId),
    pixelId: activePixelId,
  };
}

/**
 * Dynamically and lazily initializes the Meta Pixel.
 * Can be called with an optional apiBaseUrl to fetch configuration from GET /api/v1/meta/config.
 */
export async function initMetaPixel(apiBaseUrl?: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (isInitialized && window.fbq) {
    return true;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const config = await fetchMetaConfig(apiBaseUrl);

      if (!config.isEnabled || !config.pixelId) {
        isTrackingEnabled = false;
        console.log('ℹ️ Meta Pixel is disabled or not configured');
        return false;
      }

      activePixelId = config.pixelId;
      isTrackingEnabled = true;

      injectMetaSnippet();

      if (window.fbq) {
        window.fbq('init', activePixelId);
        isInitialized = true;
        return true;
      }
    } catch (err) {
      console.warn('[Meta Pixel] Failed to initialize:', err);
    }
    return false;
  })();

  return initPromise;
}

/**
 * Fires a Meta Pixel event with the provided eventName, payload, and unique eventID.
 */
export function trackMetaEvent(
  eventName: MetaStandardEvent,
  data?: MetaCustomData,
  eventId?: string
): string | null {
  if (typeof window === 'undefined' || !isTrackingEnabled) {
    return null;
  }

  // Ensure snippet is loaded and initialized with known pixel ID
  injectMetaSnippet();
  if (!isInitialized && activePixelId && window.fbq) {
    try {
      window.fbq('init', activePixelId);
      isInitialized = true;
    } catch {
      // Ignore
    }
  }

  const resolvedEventId = eventId || newMetaEventId();

  try {
    if (resolvedEventId) {
      window.fbq?.('track', eventName, data || {}, { eventID: resolvedEventId });
    } else {
      window.fbq?.('track', eventName, data || {});
    }
  } catch (err) {
    console.warn(`[Meta Pixel] Error tracking event "${eventName}":`, err);
  }

  return resolvedEventId;
}

/**
 * Initiates a hybrid tracking event:
 * 1. Generates a unique eventId.
 * 2. Fires the browser Pixel event with the eventId.
 * 3. Returns the eventId and HTTP headers (x-meta-event-id, x-meta-fbp, x-meta-fbc).
 */
export function startMetaEvent(
  eventName: MetaStandardEvent,
  data?: MetaCustomData
): { eventId: string; headers: Record<string, string> } {
  const eventId = newMetaEventId();

  trackMetaEvent(eventName, data, eventId);

  return {
    eventId,
    headers: metaHeaders(eventId),
  };
}

/**
 * Automatically triggers a PageView event on SPA route changes.
 * Excludes internal admin and dashboard routes.
 */
export function trackPageView(pathname?: string): string | null {
  if (typeof window === 'undefined' || !isTrackingEnabled) {
    return null;
  }

  const path = pathname || window.location.pathname;

  // Exclude admin or internal dashboard routes
  if (path.startsWith('/admin')) {
    return null;
  }

  return trackMetaEvent('PageView', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
}

/**
 * Tracks ViewContent event on product detail page.
 */
export function trackViewContent(params: {
  productId: string | number;
  productName: string;
  price: number;
  currency?: string;
  category?: string;
}): string | null {
  const { productId, productName, price, currency = 'INR', category } = params;

  return trackMetaEvent('ViewContent', {
    content_name: productName,
    content_category: category,
    content_ids: [String(productId)],
    content_type: 'product',
    value: Number(price.toFixed(2)),
    currency,
  });
}

/**
 * Tracks AddToCart event.
 */
export function trackAddToCart(params: {
  productId: string | number;
  productName: string;
  price: number;
  quantity?: number;
  currency?: string;
  category?: string;
}): { eventId: string; headers: Record<string, string> } {
  const {
    productId,
    productName,
    price,
    quantity = 1,
    currency = 'INR',
    category,
  } = params;

  const totalValue = Number((price * quantity).toFixed(2));

  return startMetaEvent('AddToCart', {
    content_name: productName,
    content_category: category,
    content_ids: [String(productId)],
    content_type: 'product',
    value: totalValue,
    currency,
    contents: [
      {
        id: String(productId),
        quantity,
        item_price: price,
        title: productName,
      },
    ],
  });
}

/**
 * Tracks InitiateCheckout event.
 */
export function trackInitiateCheckout(params: {
  items: Array<{
    id: string | number;
    name?: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency?: string;
  numItems?: number;
}): { eventId: string; headers: Record<string, string> } {
  const { items, total, currency = 'INR', numItems } = params;

  const contentIds = items.map((item) => String(item.id));
  const totalCount =
    numItems ?? items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return startMetaEvent('InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    value: Number(total.toFixed(2)),
    currency,
    num_items: totalCount,
    contents: items.map((item) => ({
      id: String(item.id),
      quantity: item.quantity,
      item_price: item.price,
      title: item.name,
    })),
  });
}

/**
 * Tracks Purchase event.
 * Uses order.orderNumber (or orderId) as eventId for deduplication with backend CAPI!
 */
export function trackPurchase(params: {
  orderId: string | number;
  orderNumber?: string;
  items: Array<{
    id: string | number;
    name?: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency?: string;
  numItems?: number;
  eventId?: string;
}): { eventId: string; headers: Record<string, string> } {
  const {
    orderId,
    orderNumber,
    items,
    total,
    currency = 'INR',
    numItems,
    eventId,
  } = params;

  // Deduplication key: orderNumber is preferred to match backend CAPI event_id
  const resolvedEventId = eventId || orderNumber || String(orderId);

  const contentIds = items.map((item) => String(item.id));
  const totalCount =
    numItems ?? items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const payload: MetaCustomData = {
    order_id: String(orderNumber || orderId),
    content_ids: contentIds,
    content_type: 'product',
    value: Number(total.toFixed(2)),
    currency,
    num_items: totalCount,
    contents: items.map((item) => ({
      id: String(item.id),
      quantity: item.quantity,
      item_price: item.price,
      title: item.name,
    })),
  };

  trackMetaEvent('Purchase', payload, resolvedEventId);

  return {
    eventId: resolvedEventId,
    headers: metaHeaders(resolvedEventId),
  };
}
