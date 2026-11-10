
import { Platform } from 'react-native';

import { GOOGLE_SCRIPT_URL, WP_REGISTER_URL } from '@/constants/config';

export type RegistrationPayload = {
  firstName: string;
  lastName: string;
  callSign: string;
  city: string;
  state: string;
  country: string;
  email: string;
  nasaId: string;
  instagramHandle: string;
  discordUsername: string;
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const REQUEST_TIMEOUT_MS = 20000;

// Common API request handler
async function fetchJson(
  url: string,
  init?: RequestInit
): Promise<any> {
  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    const text = await res.text();

    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      throw new Error(
        data?.message || `Request failed (${res.status})`
      );
    }

    return data;

  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(
        'Request timed out. Please check your connection.'
      );
    }

    throw err;

  } finally {
    clearTimeout(timer);
  }
}


// NASA ID verification service
function requireScriptUrl(): string {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error(
      'NASA ID verification service is not configured.'
    );
  }

  return GOOGLE_SCRIPT_URL;
}


export async function validateNasaId(
  nasaId: string
): Promise<boolean> {

  const url =
    `${requireScriptUrl()}?action=validateNasaId&nasaId=${encodeURIComponent(nasaId)}`;

  const data = await fetchJson(url);

  if (!data || data.success === false) {
    throw new Error(
      data?.message || 'Unable to verify NASA ID.'
    );
  }

  return data.valid === true;
}


// Submit registration ONLY to WordPress
export async function submitToWordPress(
  payload: RegistrationPayload
): Promise<void> {

  const data = await fetchJson(WP_REGISTER_URL, {
    method: 'POST',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({

      first_name: payload.firstName,
      last_name: payload.lastName,
      call_sign: payload.callSign,

      city: payload.city,
      state: payload.state,
      country: payload.country,

      email: payload.email,
      nasa_id: payload.nasaId,

      instagram_handle: payload.instagramHandle,
      discord_username: payload.discordUsername,

      platform: Platform.OS,

    }),
  });

  if (!data?.success) {
    throw new Error(
      data?.message || 'WordPress registration failed.'
    );
  }
}


// Main registration function
// Currently WordPress only.
// Google Sheets can be added here in the future.
export async function submitRegistration(
  payload: RegistrationPayload
): Promise<void> {

  await submitToWordPress(payload);

}
