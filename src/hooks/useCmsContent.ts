'use client';
import { useEffect, useState } from 'react';
import { createClientClient } from '@/lib/supabase/client';

/**
 * Hook: load a single cms_site_settings value by key.
 * Updates in real-time via Supabase Realtime.
 */
export function useCmsSetting(key: string, fallback = '') {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const supabase = createClientClient();

    const load = async () => {
      const { data } = await supabase
        .from('cms_site_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (data?.value !== undefined && data.value !== null) setValue(data.value);
    };
    load();

    const channel = supabase
      .channel(`cms-setting-${key}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cms_site_settings', filter: `key=eq.${key}` },
        (payload) => { if (payload.new?.value !== undefined) setValue(payload.new.value); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [key]);

  return value;
}

/**
 * Hook: load all rows from a CMS table with optional filter.
 * Updates in real-time.
 */
export function useCmsTable<T extends { id: string }>(
  table: string,
  filter?: { column: string; value: string | boolean }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClientClient();

    const load = async () => {
      setLoading(true);
      let q = supabase.from(table).select('*');
      if (filter) q = q.eq(filter.column, filter.value);
      const { data: result } = await q.order('display_order', { ascending: true });
      if (result) setData(result as T[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`cms-table-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => { load(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, filter?.column, filter?.value]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading };
}
