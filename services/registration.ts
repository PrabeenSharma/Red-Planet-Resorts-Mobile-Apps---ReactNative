import { Platform } from 'react-native';

import { GOOGLE_SCRIPT_URL, WP_REGISTER_URL } from '@/constants/config';

export type RegistrationPayload = {
  fullName: string;
  email: string;
  address: string;
  nasaId: string;
};

export type SubmitTarget = 'wordpress' | 'googleSheet';

const REQUEST_TIMEOUT_MS = 20000;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function fetchJson(url: string, init?: RequestInit): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      throw new Error(data?.message || `Request failed (${res.status})`);
    }

    return data;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function requireScriptUrl(): string {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('Google Sheets service is not configured.');
  }
  return GOOGLE_SCRIPT_URL;
}

export async function validateNasaId(nasaId: string): Promise<boolean> {
  const url = `${requireScriptUrl()}?action=validateNasaId&nasaId=${encodeURIComponent(nasaId)}`;
  const data = await fetchJson(url);

  if (!data || data.success === false) {
    throw new Error(data?.message || 'Unable to verify NASA ID.');
  }

  return data.valid === true;
}

export async function submitToWordPress(payload: RegistrationPayload): Promise<void> {
  const data = await fetchJson(WP_REGISTER_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      full_name: payload.fullName,
      email: payload.email,
      address: payload.address,
      nasa_id: payload.nasaId,
      platform: Platform.OS,
    }),
  });

  if (!data?.success) {
    throw new Error(data?.message || 'WordPress registration failed.');
  }
}

export async function submitToGoogleSheet(payload: RegistrationPayload): Promise<void> {
  // text/plain avoids a CORS preflight, which Apps Script web apps don't support.
  const data = await fetchJson(requireScriptUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'register',
      fullName: payload.fullName,
      email: payload.email,
      address: payload.address,
      nasaId: payload.nasaId,
      platform: Platform.OS,
    }),
  });

  if (!data?.success) {
    throw new Error(data?.message || 'Google Sheets registration failed.');
  }
}

const SUBMITTERS: Record<SubmitTarget, (p: RegistrationPayload) => Promise<void>> = {
  wordpress: submitToWordPress,
  googleSheet: submitToGoogleSheet,
};

/**
 * Submits to every target not yet in `done`. Returns the targets that
 * succeeded so a retry only re-sends to the ones that failed.
 */
export async function submitRegistration(
  payload: RegistrationPayload,
  done: ReadonlySet<SubmitTarget>,
): Promise<{ succeeded: SubmitTarget[]; errors: { target: SubmitTarget; message: string }[] }> {
  const pending = (Object.keys(SUBMITTERS) as SubmitTarget[]).filter((t) => !done.has(t));

  const results = await Promise.allSettled(pending.map((t) => SUBMITTERS[t](payload)));

  const succeeded: SubmitTarget[] = [];
  const errors: { target: SubmitTarget; message: string }[] = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      succeeded.push(pending[i]);
    } else {
      errors.push({
        target: pending[i],
        message: result.reason?.message || 'Unknown error',
      });
    }
  });

  return { succeeded, errors };
}
