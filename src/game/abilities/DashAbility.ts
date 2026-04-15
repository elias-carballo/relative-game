// ============================================================
// DASH ABILITY (LOCKED — scaffold only)
// Unlocked through run progression or upgrades.
//
// TODO: Implement dash:
//   - On activate, override velocity to facingDir * dashSpeed.
//   - Apply a short invincibility window (iframes).
//   - Set a cooldown timer; canActivate returns false while cooling.
//   - Optionally trigger a dash particle trail.
//   - Add DASHING state to StateMachine that blocks other actions.
// ============================================================

import { Ability, AbilityContext } from './Ability';

export class DashAbility extends Ability {
  readonly id     = 'dash';
  readonly name   = 'Dash';
  readonly locked = true;

  private cooldown    = 0;
  readonly cooldownMax = 0.6; // seconds between dashes

  activate(_ctx: AbilityContext): void {
    // TODO: Set player velocity to dash velocity
    // TODO: Start iframes window
    this.cooldown = this.cooldownMax;
  }

  update(ctx: AbilityContext): void {
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - ctx.dt);
    }
  }

  canActivate(_ctx: AbilityContext): boolean {
    if (this.locked) return false;
    return this.cooldown <= 0;
    // TODO: Check resource cost (stamina/mana)
  }
}
