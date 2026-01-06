import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import { Container, Typography, Box, Skeleton } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import Image from 'next/image';

import { FeaturedProductFieldsFragment } from './__generated/ctf-featured-product.generated';

import { useContentfulContext } from '@src/contentful-context';
import { useCommerceToolsProduct } from '@src/lib/use-commercetools-product';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: '#fff',
  },
  innerContainer: {
    display: 'grid',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '126rem',
    padding: theme.spacing(8, 0, 8),
    gap: theme.spacing(7),

    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: theme.spacing(14),
      padding: theme.spacing(19, 0, 19),
    },
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    order: 1,
    [theme.breakpoints.up('md')]: {
      order: 'initial',
    },
  },
  eyebrow: {
    fontSize: '1.4rem',
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: theme.spacing(2),
  },
  headline: {
    fontSize: '3rem',
    lineHeight: 1.3,
    fontWeight: 700,
    color: '#1B273A',
    maxWidth: '60.4rem',
    [theme.breakpoints.up('xl')]: {
      fontSize: '3.5rem',
    },
  },
  description: {
    fontWeight: 400,
    lineHeight: 1.56,
    marginTop: theme.spacing(5),
    color: '#414D63',
    fontSize: '1.8rem',
    whiteSpace: 'pre-wrap',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  priceContainer: {
    marginTop: theme.spacing(4),
  },
  priceLabel: {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  price: {
    fontSize: '2.8rem',
    fontWeight: 700,
    color: '#1B273A',
    [theme.breakpoints.up('xl')]: {
      fontSize: '3.2rem',
    },
  },
  imageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    order: 0,
    boxShadow: `0px 0px 0px 1px rgba(25, 37, 50, 0.1),
    0px -6px 16px -6px rgba(25, 37, 50, 0.03),
    0px 8px 16px -8px rgba(25, 37, 50, 0.2),
    0px 13px 27px -5px rgba(25, 37, 50, 0.15)`,
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    minHeight: '300px',
    [theme.breakpoints.up('md')]: {
      order: 'initial',
      minHeight: '400px',
    },
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    borderRadius: '16px',
  },
  skeletonContainer: {
    width: '100%',
    height: '100%',
    minHeight: '300px',
    [theme.breakpoints.up('md')]: {
      minHeight: '400px',
    },
  },
}));

interface FeaturedProductContentProps {
  productSku: string | null | undefined;
  eyebrow?: string | null;
  entryId: string;
  locale: string;
}

const FeaturedProductContent = ({
  productSku,
  eyebrow,
  entryId,
  locale,
}: FeaturedProductContentProps) => {
  const classes = useStyles();
  const inspectorMode = useContentfulInspectorMode({ entryId });
  const { data: productData, isLoading } = useCommerceToolsProduct(productSku, locale);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(price);
  };

  return (
    <div className={classes.contentContainer}>
      {eyebrow && (
        <Typography
          className={classes.eyebrow}
          {...inspectorMode({
            fieldId: 'eyebrow',
          })}
        >
          {eyebrow}
        </Typography>
      )}

      {isLoading ? (
        <>
          <Skeleton variant="text" width="80%" height={50} />
          <Skeleton variant="text" width="100%" height={24} sx={{ mt: 2 }} />
          <Skeleton variant="text" width="90%" height={24} />
          <Skeleton variant="text" width="30%" height={40} sx={{ mt: 2 }} />
        </>
      ) : productData ? (
        <>
          <Typography
            variant="h1"
            component="h2"
            className={classes.headline}
            {...inspectorMode({
              fieldId: 'product',
            })}
          >
            {productData.name}
          </Typography>

          {productData.description && (
            <Typography className={classes.description}>{productData.description}</Typography>
          )}

          {productData.price > 0 && (
            <Box className={classes.priceContainer}>
              <Typography className={classes.priceLabel}>Starting at</Typography>
              <Typography className={classes.price}>
                {formatPrice(productData.price, productData.currency)}
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Typography
          variant="h1"
          component="h2"
          className={classes.headline}
          {...inspectorMode({
            fieldId: 'product',
          })}
        >
          Product not found
        </Typography>
      )}
    </div>
  );
};

interface FeaturedProductImageProps {
  productSku: string | null | undefined;
  entryId: string;
  locale: string;
}

const FeaturedProductImage = ({ productSku, entryId, locale }: FeaturedProductImageProps) => {
  const classes = useStyles();
  const inspectorMode = useContentfulInspectorMode({ entryId });
  const { data: productData, isLoading } = useCommerceToolsProduct(productSku, locale);

  return (
    <div className={classes.imageContainer} {...inspectorMode({ fieldId: 'product' })}>
      {isLoading ? (
        <Skeleton variant="rectangular" className={classes.skeletonContainer} />
      ) : productData?.imageUrl ? (
        <Image
          className={classes.image}
          src={productData.imageUrl}
          alt={productData.name || 'Product image'}
          width={800}
          height={800}
          objectFit="cover"
        />
      ) : (
        <Typography sx={{ color: '#6B7280', fontSize: '1.4rem' }}>No image available</Typography>
      )}
    </div>
  );
};

export const CtfFeaturedProduct = (props: FeaturedProductFieldsFragment) => {
  const { eyebrow, imageDisplayPosition, product, sys } = props;
  const { locale } = useContentfulContext();

  const classes = useStyles();

  if (!product) {
    return null;
  }

  const productSku = product.productDetails;

  // imageDisplayPosition: "Left" = image on left, "Right" or default = image on right
  const showImageOnLeft = imageDisplayPosition === 'Left';

  return (
    <Container maxWidth={false} className={classes.root}>
      <div className={classes.innerContainer}>
        {showImageOnLeft ? (
          <>
            <FeaturedProductImage productSku={productSku} entryId={sys.id} locale={locale} />
            <FeaturedProductContent
              productSku={productSku}
              eyebrow={eyebrow}
              entryId={sys.id}
              locale={locale}
            />
          </>
        ) : (
          <>
            <FeaturedProductContent
              productSku={productSku}
              eyebrow={eyebrow}
              entryId={sys.id}
              locale={locale}
            />
            <FeaturedProductImage productSku={productSku} entryId={sys.id} locale={locale} />
          </>
        )}
      </div>
    </Container>
  );
};
