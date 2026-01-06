import type { NextApiRequest, NextApiResponse } from 'next';

import { getProductBySku, ProductData } from '@src/lib/commercetools';

type ApiResponse = ProductData | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { sku, locale = 'en-US' } = req.query;

  // Validate SKU parameter
  if (!sku || typeof sku !== 'string') {
    return res.status(400).json({ error: 'SKU is required' });
  }

  // Validate locale parameter
  if (typeof locale !== 'string') {
    return res.status(400).json({ error: 'Invalid locale parameter' });
  }

  try {
    const product = await getProductBySku(sku, locale);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Cache successful responses for 5 minutes, allow stale content while revalidating
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(product);
  } catch (error) {
    // Log the full error server-side for debugging
    console.error('Error fetching product from commercetools:', error);

    // Return a generic error to the client
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
}
