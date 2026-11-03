export const WP_BASE_URL = 'https://trip.redplanetresorts.com';

export const WP_REGISTER_URL =
  process.env.EXPO_PUBLIC_WP_REGISTER_URL ||
  `${WP_BASE_URL}/wp-json/custom/v1/register-user`;

// Google Apps Script Web App "/exec" URL (see backend/google-apps-script/Code.gs).
export const GOOGLE_SCRIPT_URL =
  process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL || '';

// WordPress mission page shown to users without a ticket.
export const FREE_DASHBOARD_SLUG =
  process.env.EXPO_PUBLIC_FREE_DASHBOARD_SLUG || 'home';

export const BUY_TICKET_URL = 'https://redplanetresorts.com/pages/plan-your-trip';

// Mission Control Hub routes that require a scanned ticket.
export const TICKET_ONLY_ROUTES = [
  '/dashboard/DistanceProgressIndicator',
  '/dashboard/CommunicationMetrics',
  '/dashboard/ShipsTracker',
] as const;

export const isTicketOnlyRoute = (route: string) =>
  (TICKET_ONLY_ROUTES as readonly string[]).includes(route);
