import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import React from 'react';

import { useCtfFeaturedProductQuery } from './__generated/ctf-featured-product.generated';
import { CtfFeaturedProduct } from './ctf-featured-product';

interface CtfFeaturedProductGqlPropsInterface {
  id: string;
  locale: string;
  preview: boolean;
}

export const CtfFeaturedProductGql = ({
  id,
  locale,
  preview,
}: CtfFeaturedProductGqlPropsInterface) => {
  const { data, isLoading } = useCtfFeaturedProductQuery({
    id,
    locale,
    preview,
  });

  const componentFeaturedProduct = useContentfulLiveUpdates(data?.componentFeaturedProduct);

  if (isLoading || !componentFeaturedProduct) {
    return null;
  }

  return <CtfFeaturedProduct {...componentFeaturedProduct} />;
};
