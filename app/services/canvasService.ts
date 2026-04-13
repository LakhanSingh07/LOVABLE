import { RealtimeChannel } from '@supabase/supabase-js';

import { CANVAS_TABLE } from '../config/supabase';
import { CanvasPayload, CanvasViewport } from '../types/canvas';
import { createPayload, normalizePayload } from '../utils/canvasPayload';
import { getSupabaseClient } from './supabaseClient';

type CanvasRow = {
  room_id: string;
  strokes: CanvasPayload['strokes'];
  partner_name: string | null;
  message: string | null;
  updated_at: string;
  revision: number;
  viewport: CanvasViewport | null;
};

function toRow(payload: CanvasPayload): CanvasRow {
  return {
    room_id: payload.roomId,
    strokes: payload.strokes,
    partner_name: payload.partnerName ?? null,
    message: payload.message ?? null,
    updated_at: payload.updatedAt,
    revision: payload.revision,
    viewport: payload.viewport ?? null,
  };
}

export const canvasService = {
  async load(roomId: string, viewport?: CanvasViewport) {
    const client = getSupabaseClient();
    if (!client) {
      return createPayload(roomId, [], viewport);
    }

    const { data, error } = await client
      .from(CANVAS_TABLE)
      .select('room_id, strokes, partner_name, message, updated_at, revision, viewport')
      .eq('room_id', roomId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return normalizePayload(roomId, data ?? {}, viewport);
  },

  async save(roomId: string, payload: CanvasPayload) {
    const client = getSupabaseClient();
    if (!client) {
      return payload;
    }

    const nextPayload = {
      ...payload,
      roomId,
      updatedAt: new Date().toISOString(),
      revision: Date.now(),
    };

    const { error } = await client
      .from(CANVAS_TABLE)
      .upsert(toRow(nextPayload), {
        onConflict: 'room_id',
      });

    if (error) {
      throw error;
    }

    return nextPayload;
  },

  subscribe(
    roomId: string,
    onChange: (payload: CanvasPayload) => void,
    viewport?: CanvasViewport,
  ) {
    const client = getSupabaseClient();
    if (!client) {
      return () => undefined;
    }

    const channel: RealtimeChannel = client
      .channel(`canvas-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: CANVAS_TABLE,
          filter: `room_id=eq.${roomId}`,
        },
        payload => {
          onChange(normalizePayload(roomId, payload.new ?? {}, viewport));
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel).catch(() => undefined);
    };
  },
};
