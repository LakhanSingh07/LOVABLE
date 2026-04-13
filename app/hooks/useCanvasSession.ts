import { startTransition, useEffect, useRef, useState } from 'react';

import { isSupabaseConfigured } from '../config/supabase';
import {
  CanvasPayload,
  CanvasSyncState,
  CanvasViewport,
  Point,
  Stroke,
} from '../types/canvas';
import {
  appendPointToStroke,
  createPayload,
  createStroke,
  emptyPayload,
} from '../utils/canvasPayload';
import { canvasService } from '../services/canvasService';
import { wallpaperBridge } from '../services/wallpaperBridge';

const SAVE_DEBOUNCE_MS = 350;

export function useCanvasSession(roomId: string) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [syncState, setSyncState] = useState<CanvasSyncState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>();
  const [viewport, setViewportState] = useState<CanvasViewport>();
  const [partnerName, setPartnerNameState] = useState('');
  const [message, setMessageState] = useState('');

  const strokeRef = useRef<Stroke[]>([]);
  const viewportRef = useRef<CanvasViewport | undefined>(viewport);
  const partnerNameRef = useRef('');
  const messageRef = useRef('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateLocalState(nextPayload: CanvasPayload, state: CanvasSyncState) {
    strokeRef.current = nextPayload.strokes;
    viewportRef.current = nextPayload.viewport;
    partnerNameRef.current = nextPayload.partnerName ?? '';
    messageRef.current = nextPayload.message ?? '';
    setLastSyncedAt(nextPayload.updatedAt);
    setSyncState(state);
    startTransition(() => {
      setStrokes(nextPayload.strokes);
      setViewportState(nextPayload.viewport);
      setPartnerNameState(nextPayload.partnerName ?? '');
      setMessageState(nextPayload.message ?? '');
    });
  }

  async function cachePayload(payload: CanvasPayload) {
    try {
      await wallpaperBridge.updateCache(payload);
    } catch {
      // The RN app should keep working even if the wallpaper bridge is unavailable.
    }
  }

  function queueSave(nextStrokes: Stroke[]) {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const draftPayload = createPayload(
      roomId,
      nextStrokes,
      viewportRef.current,
      Date.now(),
      {
        partnerName: partnerNameRef.current,
        message: messageRef.current,
      },
    );
    cachePayload(draftPayload);
    setSyncState(isSupabaseConfigured ? 'syncing' : 'idle');

    saveTimerRef.current = setTimeout(async () => {
      try {
        const savedPayload = await canvasService.save(roomId, draftPayload);
        updateLocalState(savedPayload, 'idle');
        await cachePayload(savedPayload);
      } catch (saveError) {
        setSyncState('error');
        setError(
          saveError instanceof Error
            ? saveError.message
            : 'Unable to sync canvas.',
        );
      }
    }, SAVE_DEBOUNCE_MS);
  }

  useEffect(() => {
    let isActive = true;

    setSyncState('loading');
    setError(null);

    canvasService
      .load(roomId, viewportRef.current)
      .then(async payload => {
        if (!isActive) {
          return;
        }

        updateLocalState(payload, 'idle');
        await cachePayload(payload);
      })
      .catch(loadError => {
        if (!isActive) {
          return;
        }

        setSyncState('error');
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load the shared canvas.',
        );
        const payload = emptyPayload(roomId, viewportRef.current);
        updateLocalState(payload, 'idle');
      });

    const unsubscribe = canvasService.subscribe(
      roomId,
      payload => {
        if (!isActive) {
          return;
        }

        updateLocalState(payload, 'idle');
        cachePayload(payload).catch(() => undefined);
      },
      viewportRef.current,
    );

    return () => {
      isActive = false;
      unsubscribe();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [roomId]);

  return {
    strokes,
    syncState,
    error,
    lastSyncedAt,
    partnerName,
    message,
    viewport,
    isSupabaseConfigured,
    setViewport(nextViewport: CanvasViewport) {
      viewportRef.current = nextViewport;
      setViewportState(nextViewport);
    },
    beginStroke(point: Point) {
      setError(null);
      setStrokes(previous => {
        const nextStrokes = [...previous, createStroke(point)];
        strokeRef.current = nextStrokes;
        return nextStrokes;
      });
    },
    extendStroke(point: Point) {
      setStrokes(previous => {
        if (previous.length === 0) {
          return previous;
        }

        const lastStroke = previous[previous.length - 1];
        const nextStroke = appendPointToStroke(lastStroke, point);
        if (nextStroke === lastStroke) {
          return previous;
        }

        const nextStrokes = [...previous.slice(0, -1), nextStroke];
        strokeRef.current = nextStrokes;
        queueSave(nextStrokes);
        return nextStrokes;
      });
    },
    endStroke() {
      queueSave(strokeRef.current);
    },
    clearCanvas() {
      const payload = createPayload(roomId, [], viewportRef.current, Date.now(), {
        partnerName: partnerNameRef.current,
        message: messageRef.current,
      });
      updateLocalState(payload, 'syncing');
      cachePayload(payload).catch(() => undefined);
      queueSave([]);
    },
    setPartnerName(value: string) {
      partnerNameRef.current = value;
      setPartnerNameState(value);
      queueSave(strokeRef.current);
    },
    setMessage(value: string) {
      messageRef.current = value;
      setMessageState(value);
      queueSave(strokeRef.current);
    },
  };
}
