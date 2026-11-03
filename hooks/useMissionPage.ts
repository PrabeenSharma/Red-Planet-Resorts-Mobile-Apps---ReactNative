import { useEffect, useState } from 'react';

import { FREE_DASHBOARD_SLUG } from '@/constants/config';
import useTicketAccess from '@/hooks/useTicketAccess';

const pageCache: Record<string, any> = {};

export default function useMissionPage(slugParam?: string) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { ticketSlug, hasTicket } = useTicketAccess(slugParam);

  // Users without a ticket see the public mission page.
  const slug = hasTicket === null ? null : ticketSlug || FREE_DASHBOARD_SLUG;

  // api call
  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 🔥 1. CACHE CHECK
        if (pageCache[slug]) {
          setPage(pageCache[slug]);
          setLoading(false);
          return;
        }

        // 🌐 2. API CALL
        const res = await fetch(
          `https://trip.redplanetresorts.com/wp-json/wp/v2/pages?slug=${slug}`
        );
        const data = await res.json();
        const result = data?.[0] || null;

        pageCache[slug] = result;

        setPage(result);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return { page, loading, isFreeUser: hasTicket === false };
}
