// ============================================================
// ABILITY (BASE)
// An ability is a self-contained unit of gameplay behaviour that
// can be locked/unlocked independently of the character's core
// movement code. Abilities are registered with the AbilitySystem.
//
// TODO: Add cooldown tracking here for timed abilities.
// TODO: Add resource cost deduction (mana, stamina).
// TODO: Ability upgrade tiers (e.g., dash I → dash II).
// ============================================================

export interface AbilityContext {
  dt:     number;
  [key: string]: unknown; // allows abilities to consume arbitrary context data
}

export abstract class Ability {
  abstract readonly id:       string;
  abstract readonly name:     string;
  abstract readonly locked:   boolean;

  /** Override to define what happens when this ability is activated */
  abstract activate(ctx: AbilityContext): void;

  /** Override for abilities with per-frame logic (e.g., sustained dash) */
  update(_ctx: AbilityContext): void {}

  /** Whether this ability can be triggered right now */
  abstract canActivate(ctx: AbilityContext): boolean;
}


export { Ability }