// ============================================================
// CURRENCY PICKUP
// Basic in-world coin/soul collectible.
// TODO: Differentiate by value (small/medium/large drop).
// TODO: On player death — drop a "corpse orb" at death position
//       containing accumulated currency. Recover it next run.
// ============================================================

import { Collectible, CollectContext } from './Collectible';

export class CurrencyPickup extends Collectible {
  readonly type = 'currency';

  constructor(x: number, y: number, public value: number = 1) {
    super(x, y);
  }

  onCollect(ctx: CollectContext): void {
    ctx.addCurrency(this.value);
    this.active = false;
  }

  render(renderCtx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    const x = Math.round(this.cx);
    const y = Math.round(this.visualY + this.height / 2);
    const r = this.width / 2;

    // Glowing gold circle
    renderCtx.save();
    renderCtx.shadowColor  = '#fbbf24';
    renderCtx.shadowBlur   = 8;
    renderCtx.fillStyle    = '#fbbf24';
    renderCtx.beginPath();
    renderCtx.arc(x, y, r, 0, Math.PI * 2);
    renderCtx.fill();

    renderCtx.fillStyle    = '#fef3c7';
    renderCtx.beginPath();
    renderCtx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2);
    renderCtx.fill();
    renderCtx.restore();
  }
}
