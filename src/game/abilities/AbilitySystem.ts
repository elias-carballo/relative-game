// ============================================================
// ABILITY SYSTEM
// Manages the ability loadout for a single character instance.
// Abilities are registered on character creation; locked ones
// are unlocked via run progression or upgrade nodes.
//
// TODO: Persist unlocked abilities to Supabase run state.
// TODO: Skill tree system — each ability has upgrade nodes.
// TODO: Broadcast ability unlock events for UI/audio feedback.
// ============================================================

import { Ability, AbilityContext } from './Ability';

export class AbilitySystem {
  private abilities: Map<string, Ability> = new Map();

  register(ability: Ability): void {
    this.abilities.set(ability.id, ability);
  }

  has(id: string): boolean {
    const ability = this.abilities.get(id);
    return !!ability && !ability.locked;
  }

  get(id: string): Ability | undefined {
    return this.abilities.get(id);
  }

  unlock(id: string): void {
    const ability = this.abilities.get(id);
    if (!ability) {
      console.warn(`[AbilitySystem] Tried to unlock unknown ability: ${id}`);
      return;
    }
    // Cast to allow mutation — locked is readonly by intent, not runtime contract
    (ability as { locked: boolean }).locked = false;
    console.log(`[AbilitySystem] Unlocked ability: ${ability.name}`);
  }

  activate(id: string, ctx: AbilityContext): boolean {
    const ability = this.abilities.get(id);
    if (!ability || !ability.canActivate(ctx)) return false;
    ability.activate(ctx);
    return true;
  }

  update(dt: number): void {
    const ctx: AbilityContext = { dt };
    for (const ability of this.abilities.values()) {
      ability.update(ctx);
    }
  }

  list(): Ability[] {
    return Array.from(this.abilities.values());
  }
}
