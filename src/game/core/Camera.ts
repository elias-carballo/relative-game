// ============================================================
// CAMERA
// Smooth-following camera with configurable deadzone/bounds.
// Applies a canvas transform so everything is drawn relative
// to the camera's view.
// TODO: Support split-screen for local co-op (one camera per player).
// ============================================================

import { Vector2 } from './Vector2';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

export interface CameraTarget {
  cx: number;
  cy: number;
}

export class Camera {
  position: Vector2;

  // World-space bounds (clamp the camera within the level)
  boundsX: number = 0;
  boundsY: number = 0;
  boundsW: number = 99999;
  boundsH: number = 99999;

  private readonly smoothing = 6; // higher = snappier follow

  constructor() {
    this.position = new Vector2(0, 0);
  }

  setBounds(x: number, y: number, w: number, h: number): void {
    this.boundsX = x;
    this.boundsY = y;
    this.boundsW = w;
    this.boundsH = h;
  }

  follow(target: CameraTarget, dt: number): void {
    const targetX = target.cx - CANVAS_WIDTH  / 2;
    const targetY = target.cy - CANVAS_HEIGHT / 2;

    // Lerp toward target
    this.position.x += (targetX - this.position.x) * this.smoothing * dt;
    this.position.y += (targetY - this.position.y) * this.smoothing * dt;

    // Clamp within world bounds
    this.position.x = Math.max(this.boundsX,
                      Math.min(this.position.x, this.boundsX + this.boundsW - CANVAS_WIDTH));
    this.position.y = Math.max(this.boundsY,
                      Math.min(this.position.y, this.boundsY + this.boundsH - CANVAS_HEIGHT));
  }

  /** Apply camera transform before rendering world-space objects */
  begin(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-Math.round(this.position.x), -Math.round(this.position.y));
  }

  /** Restore canvas state after rendering world-space objects */
  end(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }
}
