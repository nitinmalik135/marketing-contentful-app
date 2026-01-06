import * as Types from '../../../../../lib/__generated/graphql.types';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { customFetcher } from '@src/lib/fetchConfig';
export type FeaturedProductFieldsFragment = { __typename: 'ComponentFeaturedProduct', internalName?: string | null, eyebrow?: string | null, imageDisplayPosition?: string | null, sys: { __typename?: 'Sys', id: string }, product?: { __typename: 'Product', productDetails?: string | null, sys: { __typename?: 'Sys', id: string } } | null };

export type CtfFeaturedProductQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  locale?: Types.InputMaybe<Types.Scalars['String']['input']>;
  preview?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type CtfFeaturedProductQuery = { __typename?: 'Query', componentFeaturedProduct?: (
    { __typename?: 'ComponentFeaturedProduct' }
    & FeaturedProductFieldsFragment
  ) | null };


export const FeaturedProductFieldsFragmentDoc = `
    fragment FeaturedProductFields on ComponentFeaturedProduct {
  __typename
  sys {
    id
  }
  internalName
  eyebrow
  imageDisplayPosition
  product {
    __typename
    sys {
      id
    }
    ... on Product {
      productDetails
    }
  }
}
    `;
export const CtfFeaturedProductDocument = `
    query CtfFeaturedProduct($id: String!, $locale: String, $preview: Boolean) {
  componentFeaturedProduct(id: $id, locale: $locale, preview: $preview) {
    ...FeaturedProductFields
  }
}
    ${FeaturedProductFieldsFragmentDoc}`;

export const useCtfFeaturedProductQuery = <
      TData = CtfFeaturedProductQuery,
      TError = unknown
    >(
      variables: CtfFeaturedProductQueryVariables,
      options?: UseQueryOptions<CtfFeaturedProductQuery, TError, TData>
    ) => {
    
    return useQuery<CtfFeaturedProductQuery, TError, TData>(
      ['CtfFeaturedProduct', variables],
      customFetcher<CtfFeaturedProductQuery, CtfFeaturedProductQueryVariables>(CtfFeaturedProductDocument, variables),
      options
    )};

useCtfFeaturedProductQuery.getKey = (variables: CtfFeaturedProductQueryVariables) => ['CtfFeaturedProduct', variables];


useCtfFeaturedProductQuery.fetcher = (variables: CtfFeaturedProductQueryVariables, options?: RequestInit['headers']) => customFetcher<CtfFeaturedProductQuery, CtfFeaturedProductQueryVariables>(CtfFeaturedProductDocument, variables, options);
