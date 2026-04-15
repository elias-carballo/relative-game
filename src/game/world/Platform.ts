// ============================================================
// PLATFORM
// Static solid surface. Used by PhysicsEngine for collision.
// ============================================================

import { Rect } from '../physics/Collision';

export class Platform implements Rect {
  constructor(
    public x:      number,
    public y:      number,
    public w:      number,
    public h:      number,
    public color:  string = '#4b5563',
  ) {}

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    // Top edge highlight
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(this.x, this.y, this.w, 2);
  }

  toRect(): Rect {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
