import { CanvasPayload, CanvasViewport, Point, Stroke } from '../types/canvas';

const DEFAULT_COLOR = '#FF6B9D';
const DEFAULT_STROKE_WIDTH = 6;

function createStrokeId() {
  return `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function distanceBetween(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function createStroke(point: Point): Stroke {
  return {
    id: createStrokeId(),
    points: [point],
    color: DEFAULT_COLOR,
    width: DEFAULT_STROKE_WIDTH,
  };
}

export function appendPointToStroke(
  stroke: Stroke,
  point: Point,
  minDistance = 2,
) {
  const lastPoint = stroke.points[stroke.points.length - 1];
  if (lastPoint && distanceBetween(lastPoint, point) < minDistance) {
    return stroke;
  }

  return {
    ...stroke,
    points: [...stroke.points, point],
  };
}

export function createPayload(
  roomId: string,
  strokes: Stroke[],
  viewport?: CanvasViewport,
  revision = Date.now(),
  metadata?: Pick<CanvasPayload, 'partnerName' | 'message'>,
): CanvasPayload {
  return {
    roomId,
    strokes,
    partnerName: metadata?.partnerName?.trim() || undefined,
    message: metadata?.message?.trim() || undefined,
    updatedAt: new Date().toISOString(),
    revision,
    viewport,
  };
}

export function emptyPayload(
  roomId: string,
  viewport?: CanvasViewport,
): CanvasPayload {
  return createPayload(roomId, [], viewport);
}

export function normalizePayload(
  roomId: string,
  rawValue: unknown,
  fallbackViewport?: CanvasViewport,
): CanvasPayload {
  const raw = typeof rawValue === 'object' && rawValue ? rawValue : {};
  const record = raw as Partial<CanvasPayload> & {
    strokes?: unknown;
    updated_at?: string;
    room_id?: string;
    partner_name?: string;
  };

  const strokes = Array.isArray(record.strokes)
    ? record.strokes
        .map(value => {
          const candidate = value as Partial<Stroke>;
          if (!Array.isArray(candidate.points)) {
            return null;
          }

          const points = candidate.points
            .map(point => {
              const item = point as Partial<Point>;
              if (typeof item.x !== 'number' || typeof item.y !== 'number') {
                return null;
              }

              return { x: item.x, y: item.y };
            })
            .filter((point): point is Point => Boolean(point));

          if (points.length === 0) {
            return null;
          }

          return {
            id: candidate.id ?? createStrokeId(),
            color:
              typeof candidate.color === 'string'
                ? candidate.color
                : DEFAULT_COLOR,
            width:
              typeof candidate.width === 'number'
                ? candidate.width
                : DEFAULT_STROKE_WIDTH,
            points,
          };
        })
        .filter((stroke): stroke is Stroke => Boolean(stroke))
    : [];

  return {
    roomId: record.roomId ?? record.room_id ?? roomId,
    strokes,
    partnerName:
      typeof record.partnerName === 'string'
        ? record.partnerName
        : typeof record.partner_name === 'string'
          ? record.partner_name
          : undefined,
    message: typeof record.message === 'string' ? record.message : undefined,
    updatedAt:
      record.updatedAt ??
      record.updated_at ??
      new Date().toISOString(),
    revision:
      typeof record.revision === 'number' ? record.revision : Date.now(),
    viewport:
      record.viewport &&
      typeof record.viewport.width === 'number' &&
      typeof record.viewport.height === 'number'
        ? record.viewport
        : fallbackViewport,
  };
}

export function buildStrokePath(stroke: Stroke) {
  const [firstPoint, ...rest] = stroke.points;
  if (!firstPoint) {
    return '';
  }

  return rest.reduce(
    (path, point) => `${path} L ${point.x} ${point.y}`,
    `M ${firstPoint.x} ${firstPoint.y}`,
  );
}

export function formatSyncTime(timestamp?: string) {
  if (!timestamp) {
    return 'Not synced yet';
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
