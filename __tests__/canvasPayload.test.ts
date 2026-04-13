import {
  appendPointToStroke,
  createPayload,
  createStroke,
  normalizePayload,
} from '../app/utils/canvasPayload';

describe('canvas payload utilities', () => {
  it('keeps distant points and drops overly dense points', () => {
    const stroke = createStroke({ x: 10, y: 10 });
    const denseStroke = appendPointToStroke(stroke, { x: 10.5, y: 10.5 });
    const spacedStroke = appendPointToStroke(stroke, { x: 20, y: 24 });

    expect(denseStroke.points).toHaveLength(1);
    expect(spacedStroke.points).toHaveLength(2);
  });

  it('normalizes remote payloads into the canvas shape', () => {
    const payload = normalizePayload('room-a', {
      room_id: 'room-a',
      strokes: [
        {
          id: 'stroke-a',
          color: '#fff',
          width: 4,
          points: [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
          ],
        },
      ],
      updated_at: '2026-01-01T00:00:00.000Z',
      revision: 4,
    });

    expect(payload.roomId).toBe('room-a');
    expect(payload.strokes[0]?.points[1]).toEqual({ x: 3, y: 4 });
    expect(payload.revision).toBe(4);
  });

  it('creates a sync payload with room metadata', () => {
    const stroke = createStroke({ x: 14, y: 20 });
    const payload = createPayload('room-b', [stroke], {
      width: 320,
      height: 440,
    });

    expect(payload.roomId).toBe('room-b');
    expect(payload.viewport?.width).toBe(320);
    expect(payload.strokes).toHaveLength(1);
  });
});
