'use client';
import { createClientClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function subscribeToTable(
  table: string,
  callback: (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void
): RealtimeChannel {
  const supabase = createClientClient();
  const channel = supabase
    .channel(`realtime-${table}-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => callback({
        eventType: payload.eventType,
        new: payload.new as Record<string, unknown>,
        old: payload.old as Record<string, unknown>,
      })
    )
    .subscribe();
  return channel;
}

export function unsubscribe(channel: RealtimeChannel) {
  const supabase = createClientClient();
  supabase.removeChannel(channel);
}
