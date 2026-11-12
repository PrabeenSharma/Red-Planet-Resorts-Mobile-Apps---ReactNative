
import { useEffect, useState } from 'react';

import { FREE_DASHBOARD_SLUG } from '@/constants/config';
import useTicketAccess from '@/hooks/useTicketAccess';

const pageCache: Record<string, any> = {};

const THEME_OPTIONS_URL =
  'https://trip.redplanetresorts.com/wp-json/rpr/v1/theme-options';

const WP_PAGES_URL =
  'https://trip.redplanetresorts.com/wp-json/wp/v2/pages?slug=';

export default function useMissionPage(slugParam?: string) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { ticketSlug, hasTicket } = useTicketAccess(slugParam);

  const isFreeUser = hasTicket === false;

  const slug =
    hasTicket === null
      ? null
      : isFreeUser
        ? FREE_DASHBOARD_SLUG
        : ticketSlug;

  useEffect(() => {
    // Wait until ticket access is checked.
    if (hasTicket === null) return;

    // Validate ticket user slug.
    if (!isFreeUser && !slug) {
      setPage(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

        const cacheKey = isFreeUser
          ? 'free-theme-options'
          : `ticket-${slug}`;

        // 1. CACHE CHECK
        if (
          Object.prototype.hasOwnProperty.call(pageCache, cacheKey)
        ) {
          setPage(pageCache[cacheKey]);
          setLoading(false);
          return;
        }

        let result: any = null;

        // 2. FREE USER API
        if (isFreeUser) {
          const response = await fetch(THEME_OPTIONS_URL, {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(
              `Theme Options API Error: ${response.status}`
            );
          }

          const data = await response.json();

          if (!data?.success || !data?.theme_options) {
            throw new Error('Invalid Theme Options API response');
          }

          const options = data.theme_options;

          result = {
            ...options,

            mc_image_url_free: options.mars_community_image,

            acf: {
              mars_community_heading_free:
                options.mars_community_heading,

              mc_sub_heading_free:
                options.mars_community_subheading,

              mc_content_free:
                options.mars_community_desc,

              product_title:
                options.product_title,

              product_sub_title:
                options.product_sub_title,

              product_price:
                options.product_price,

              product_description:
                options.product_description,

              product_image:
                options.product_image,

              product_url:
                options.product_url,

              insta_heading:
                options.insta_heading,

              insta_url:
                options.insta_url,

              wind_prediction_image:
                options.wind_prediction_image,
            },
          };
        }

        // 3. TICKET USER API
        else {
          const response = await fetch(
            `${WP_PAGES_URL}${encodeURIComponent(slug!)}`,
            {
              signal: controller.signal,
            }
          );

          if (!response.ok) {
            throw new Error(
              `WordPress Page API Error: ${response.status}`
            );
          }

          const data = await response.json();

          result = data?.[0] || null;
        }

        // 4. SAVE CACHE
        pageCache[cacheKey] = result;

        setPage(result);

      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        console.log('Mission Page API Error:', error);
        setPage(null);

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };

  }, [slug, hasTicket, isFreeUser]);

  return {
    page,
    loading,
    isFreeUser,
  };
}
