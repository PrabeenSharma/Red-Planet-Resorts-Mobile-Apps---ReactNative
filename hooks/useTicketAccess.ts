import { useEffect, useState } from 'react';

import { getScannedSlug } from '@/utils/storage';

/**
 * Resolves the ticket slug (route param first, then saved scan).
 * `hasTicket` is null while resolving.
 */
export default function useTicketAccess(slugParam?: string) {
  const [ticketSlug, setTicketSlug] = useState<string | null>(slugParam || null);
  const [hasTicket, setHasTicket] = useState<boolean | null>(slugParam ? true : null);

  useEffect(() => {
    let active = true;

    if (slugParam) {
      setTicketSlug(slugParam);
      setHasTicket(true);
      return;
    }

    (async () => {
      const saved = await getScannedSlug();
      if (!active) return;
      setTicketSlug(saved);
      setHasTicket(!!saved);
    })();

    return () => {
      active = false;
    };
  }, [slugParam]);

  return { ticketSlug, hasTicket };
}
