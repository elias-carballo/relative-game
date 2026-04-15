// ============================================================
// JUMP ABILITY
// Default starting ability. Integrated into the state machine
// (JumpingState.enter handles the actual velocity application).
// This class serves as the registry entry and unlock gate.
// ============================================================

import { Ability, AbilityContext } from './Ability';

export class JumpAbility extends Ability {
  readonly id     = 'jump';
  readonly name   = 'Jump';
  readonly locked = false; // every character starts with this

  activate(_ctx: AbilityContext): void {
    // Jump initiation is handled directly in JumpingState.enter()
    // via the state machine. This method is a no-op.
  }

  canActivate(_ctx: AbilityContext): boolean {
    return true;
  }
}
