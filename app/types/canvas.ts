export type Point = {
  x: number;
  y: number;
};

export type CanvasViewport = {
  width: number;
  height: number;
};

export type Stroke = {
  id: string;
  points: Point[];
  color: string;
  width: number;
};

export type CanvasPayload = {
  roomId: string;
  strokes: Stroke[];
  partnerName?: string;
  message?: string;
  updatedAt: string;
  revision: number;
  viewport?: CanvasViewport;
};

export type CanvasSyncState = 'idle' | 'loading' | 'syncing' | 'error';
