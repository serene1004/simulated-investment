import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export const isRankingServerAvailable = async () => {
  if (!url || !key) {
    return false;
  }

  try {
    const response = await fetch(`${url}/rest/v1/rankings?select=score&limit=1`, {
      headers: { apikey: key },
    });

    return response.status < 500;
  } catch {
    return false;
  }
};