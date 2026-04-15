// ============================================================
// COLLECTIBLE MANAGER
// Manages all collectibles in the current area.
// Handles player overlap detection and pickup dispatch.
// ============================================================

import { Collectible, CollectContext } from './Collectible';
import { overlapsEntity }              from '../physics/Collision';
import { Player }                      from '../player/Player';

export class CollectibleManager {
  private collectibles: Collectible[] = [];

  add(collectible: Collectible): void {
    this.collectibles.push(collectible);
  }

  clear(): void {
    this.collectibles = [];
  }

  update(dt: number, players: Player[], ctx: CollectContext): void {
    for (const item of this.collectibles) {
      if (!item.active) continue;

      item.update(dt);

      for (const player of players) {
        if (!player.active) continue;
        if (overlapsEntity(item, player)) {
          item.onCollect(ctx);
        }
      }
    }
  }

  render(renderCtx: CanvasRenderingContext2D): void {
    for (const item of this.collectibles) {
      item.render(renderCtx);
    }
  }

  getAll(): Collectible[] {
    return this.collectibles;
  }

  countActive(): number {
    return this.collectibles.filter(c => c.active).length;
  }
}
