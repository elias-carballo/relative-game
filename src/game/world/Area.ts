// ============================================================
// AREA (BASE)
// Abstract base for all game areas. Every area has:
//   - A unique ID and display name
//   - A list of platforms (collision geometry)
//   - An exit zone (rect that triggers a transition to the next area)
//   - Player spawn point
//   - Background drawing method
//   - Width/Height for camera bounds
//
// Subclasses:
//   - NodeArea   — fixed, persistent areas (camp, towns, dungeons)
//   - ConnectorArea — dynamic areas between nodes
// ============================================================

import { Platform }    from './Platform';
import { Rect }        from '../physics/Collision';

export interface AreaExit {
  rect:   Rect;
  target: string; // area ID to transition to
  label:  string;
}

abstract class Area {
  abstract readonly id:   string;
  abstract readonly name: string;

  readonly width:  number;
  readonly height: number;

  platforms: Platform[] = [];
  exits:     AreaExit[] = [];

  spawnX: number = 64;
  spawnY: number = 200;

  constructor(width: number, height: number) {
    this.width  = width;
    this.height = height;
  }

  /** Called once when the area is activated */
  abstract onEnter(): void;

  /** Called once when the area is deactivated */
  abstract onExit(): void;

  abstract renderBackground(ctx: CanvasRenderingContext2D): void;

  renderPlatforms(ctx: CanvasRenderingContext2D): void {
    for (const p of this.platforms) {
      p.render(ctx);
    }
  }

  renderExits(ctx: CanvasRenderingContext2D): void {
    for (const exit of this.exits) {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
      ctx.fillRect(exit.rect.x, exit.rect.y, exit.rect.w, exit.rect.h);

      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth   = 2;
      ctx.strokeRect(exit.rect.x, exit.rect.y, exit.rect.w, exit.rect.h);

      ctx.fillStyle    = '#4ade80';
      ctx.font         = '11px monospace';
      ctx.textAlign    = 'center';
      ctx.fillText(
        `→ ${exit.label}`,
        exit.rect.x + exit.rect.w / 2,
        exit.rect.y + exit.rect.h / 2 + 4,
      );
    }
  }

  getPlatformRects(): Rect[] {
    return this.platforms.map(p => p.toRect());
  }
}

export { Area }