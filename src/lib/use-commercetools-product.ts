import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { ProductData } from './commercetools';

async function fetchProduct(sku: string, locale: string): Promise<ProductData | null> {
  if (!sku) return null;

  const response = await fetch(
    `/api/commercetools/product?sku=${encodeURIComponent(sku)}&locale=${encodeURIComponent(locale)}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch product');
  }

  return response.json();
}

export function useCommerceToolsProduct(
  sku: string | null | undefined,
  locale = 'en-US',
  options?: UseQueryOptions<ProductData | null, Error, ProductData | null>,
) {
  return useQuery<ProductData | null, Error, ProductData | null>(
    ['commercetools-product', sku, locale],
    () => fetchProduct(sku || '', locale),
    {
      enabled: !!sku,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      ...options,
    },
  );
}
