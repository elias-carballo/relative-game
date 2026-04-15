// ============================================================
// COLLECTIBLE (BASE)
// Base class for all pickups. Subclasses define what happens
// on pickup via onCollect().
//
// TODO: Add magnetic pickup (player proximity auto-collect).
// TODO: Add animated sprite on collect (particle burst).
// TODO: Advanced collectibles: keys, relics, ability shards.
// ============================================================

import { Entity } from '../core/Entity';
import { COLLECTIBLE_SIZE } from '../constants';

abstract class Collectible extends Entity {
  abstract readonly type: string;

  protected bobOffset: number = Math.random() * Math.PI * 2; // phase offset for bobbing

  constructor(x: number, y: number) {
    super(x, y, COLLECTIBLE_SIZE, COLLECTIBLE_SIZE);
  }

  update(dt: number): void {
    if (!this.active) return;
    // Gentle bobbing animation
    this.bobOffset += dt * 2.5;
  }

  /** Implement what this collectible does when picked up */
  abstract onCollect(context: CollectContext): void;

  protected get visualY(): number {
    return this.position.y + Math.sin(this.bobOffset) * 3;
  }
}

export interface CollectContext {
  addCurrency: (amount: number) => void;
  // TODO: grantItem, restoreHealth, unlockAbility, etc.
}

export { Collectible }