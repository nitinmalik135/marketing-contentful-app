/**
 * Commercetools API Client
 *
 * This module handles authentication and product fetching from commercetools.
 * All configuration is loaded from environment variables.
 *
 * Required environment variables:
 * - NEXT_PUBLIC_COMMERCETOOLS_AUTH_URL: OAuth authentication URL
 * - NEXT_PUBLIC_COMMERCETOOLS_API_URL: API base URL
 * - NEXT_PUBLIC_COMMERCETOOLS_PROJECT_KEY: Project key
 * - NEXT_PUBLIC_COMMERCETOOLS_CLIENT_ID: OAuth client ID
 * - COMMERCETOOLS_CLIENT_SECRET: OAuth client secret (server-side only)
 */

const COMMERCETOOLS_AUTH_URL = process.env.NEXT_PUBLIC_COMMERCETOOLS_AUTH_URL;
const COMMERCETOOLS_API_URL = process.env.NEXT_PUBLIC_COMMERCETOOLS_API_URL;
const COMMERCETOOLS_PROJECT_KEY = process.env.NEXT_PUBLIC_COMMERCETOOLS_PROJECT_KEY;
const COMMERCETOOLS_CLIENT_ID = process.env.NEXT_PUBLIC_COMMERCETOOLS_CLIENT_ID;
const COMMERCETOOLS_CLIENT_SECRET = process.env.COMMERCETOOLS_CLIENT_SECRET;

interface CommerceToolsToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface CommerceToolsImage {
  url: string;
  dimensions: {
    w: number;
    h: number;
  };
}

interface CommerceToolsPrice {
  value: {
    type: string;
    currencyCode: string;
    centAmount: number;
    fractionDigits: number;
  };
  country?: string;
  discounted?: {
    value: {
      centAmount: number;
      currencyCode: string;
    };
  };
}

interface CommerceToolsVariant {
  id: number;
  sku: string;
  images: CommerceToolsImage[];
  prices: CommerceToolsPrice[];
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
  sku: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Validates that all required commercetools configuration is present
 */
function validateConfig(): void {
  const missing: string[] = [];

  if (!COMMERCETOOLS_AUTH_URL) missing.push('NEXT_PUBLIC_COMMERCETOOLS_AUTH_URL');
  if (!COMMERCETOOLS_API_URL) missing.push('NEXT_PUBLIC_COMMERCETOOLS_API_URL');
  if (!COMMERCETOOLS_PROJECT_KEY) missing.push('NEXT_PUBLIC_COMMERCETOOLS_PROJECT_KEY');
  if (!COMMERCETOOLS_CLIENT_ID) missing.push('NEXT_PUBLIC_COMMERCETOOLS_CLIENT_ID');
  if (!COMMERCETOOLS_CLIENT_SECRET) missing.push('COMMERCETOOLS_CLIENT_SECRET');

  if (missing.length > 0) {
    throw new Error(`Missing required commercetools configuration: ${missing.join(', ')}`);
  }
}

/**
 * Gets an OAuth access token from commercetools, using cached token if still valid
 */
async function getAccessToken(): Promise<string> {
  validateConfig();

  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(
    `${COMMERCETOOLS_CLIENT_ID}:${COMMERCETOOLS_CLIENT_SECRET}`,
  ).toString('base64');

  const response = await fetch(`${COMMERCETOOLS_AUTH_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get commercetools token: ${response.statusText}`);
  }

  const data: CommerceToolsToken = await response.json();

  // Cache the token with a buffer before expiration
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // Expire 1 minute early
  };

  return data.access_token;
}

/**
 * Fetches a product from commercetools by SKU
 *
 * @param sku - The product SKU to search for
 * @param locale - The locale for localized content (default: 'en-US')
 * @returns Product data or null if not found
 */
export async function getProductBySku(
  sku: string,
  locale = 'en-US',
): Promise<ProductData | null> {
  try {
    const token = await getAccessToken();

    // Query products by SKU using product projections for better performance
    const response = await fetch(
      `${COMMERCETOOLS_API_URL}/${COMMERCETOOLS_PROJECT_KEY}/product-projections?where=masterVariant(sku="${encodeURIComponent(sku)}") or variants(sku="${encodeURIComponent(sku)}")&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      console.error(`Failed to fetch product: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const product = data.results[0];
    const variant =
      product.masterVariant.sku === sku
        ? product.masterVariant
        : product.variants.find((v: CommerceToolsVariant) => v.sku === sku) ||
          product.masterVariant;

    // Get the first image URL
    const imageUrl = variant.images?.[0]?.url || '';

    // Get price - prefer USD, fallback to first available
    const price =
      variant.prices?.find((p: CommerceToolsPrice) => p.value.currencyCode === 'USD') ||
      variant.prices?.[0];

    const priceValue = price?.discounted?.value?.centAmount || price?.value?.centAmount || 0;
    const currency = price?.value?.currencyCode || 'USD';

    // Get localized name and description with fallback chain
    const name =
      product.name?.[locale] || product.name?.['en-US'] || product.name?.['en-GB'] || 'Product';
    const description =
      product.description?.[locale] ||
      product.description?.['en-US'] ||
      product.description?.['en-GB'] ||
      '';

    return {
      id: product.id,
      name,
      description,
      imageUrl,
      price: priceValue / 100, // Convert cents to currency units
      currency,
      sku,
    };
  } catch (error) {
    console.error('Error fetching product from commercetools:', error);
    return null;
  }
}
