// ============================================================
// RESOURCE MANAGER
// Tracks persistent player resources across areas (currency, etc.).
// Resources persist for the duration of a run; some may persist
// across runs depending on game design.
//
// TODO: Run-death penalty — lose a % of currency on death.
// TODO: Corpse recovery mechanic — recover lost currency at death spot.
// TODO: Upgrades — spend currency at camp node shop/NPC.
// TODO: Multiple resource types: souls, rare materials, keys.
// TODO: Persist permanent upgrades to Supabase between sessions.
// ============================================================

import { eventBus, Events } from '../core/EventBus';

export class ResourceManager {
  private _currency: number = 0;

  get currency(): number {
    return this._currency;
  }

  addCurrency(amount: number): void {
    this._currency = Math.max(0, this._currency + amount);
    eventBus.emit(Events.CURRENCY_CHANGED, { currency: this._currency });
  }

  spendCurrency(amount: number): boolean {
    if (this._currency < amount) return false;
    this._currency -= amount;
    eventBus.emit(Events.CURRENCY_CHANGED, { currency: this._currency });
    return true;
  }

  /** Apply death penalty (lose a fraction of currency) */
  applyDeathPenalty(fraction: number = 0.5): number {
    const lost = Math.floor(this._currency * fraction);
    this._currency -= lost;
    // TODO: Spawn a "corpse orb" collectible at the player's death position
    return lost;
  }

  /** Reset resources at the start of a new run */
  resetForRun(): void {
    // NOTE: Currency is NOT reset between runs by design.
    // Adjust this if the game uses a run-local currency model.
  }

  serialize(): { currency: number } {
    return { currency: this._currency };
  }

  deserialize(data: { currency: number }): void {
    this._currency = data.currency ?? 0;
  }
}
