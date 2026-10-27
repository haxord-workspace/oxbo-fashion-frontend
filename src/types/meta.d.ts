/// <reference types="vite/client" />

export interface MetaEventOptions {
  eventID?: string;
}

export type MetaStandardEvent =
  | 'PageView'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'ViewContent'
  | 'Search'
  | 'AddToWishlist'
  | 'CompleteRegistration'
  | 'Contact'
  | 'Lead'
  | (string & {});

export interface MetaCustomData {
  content_category?: string;
  content_name?: string;
  content_type?: string;
  content_ids?: (string | number)[];
  contents?: Array<{
    id: string | number;
    quantity?: number;
    item_price?: number;
    title?: string;
    [key: string]: any;
  }>;
  currency?: string;
  value?: number;
  num_items?: number;
  order_id?: string;
  status?: string;
  search_string?: string;
  [key: string]: any;
}

export interface MetaFbq {
  (command: 'init', pixelId: string, options?: Record<string, any>): void;
  (
    command: 'track' | 'trackCustom',
    eventName: MetaStandardEvent,
    data?: MetaCustomData,
    options?: MetaEventOptions
  ): void;
  (command: string, ...args: any[]): void;
  callMethod?: (...args: any[]) => void;
  queue?: any[];
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    fbq?: MetaFbq;
    _fbq?: MetaFbq;
  }

  interface ImportMetaEnv {
    readonly META_PIXEL_ID?: string;
    readonly META_CAPI_ACCESS_TOKEN?: string;
    readonly VITE_META_PIXEL_ID?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
