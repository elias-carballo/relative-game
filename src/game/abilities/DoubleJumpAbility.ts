// ============================================================
// DOUBLE JUMP ABILITY (LOCKED — scaffold only)
//
// TODO: Implement double jump:
//   - Track remainingJumps (default 1 extra, reset on grounded).
//   - In FallingState / JumpingState, check ability.canActivate()
//     before allowing a second jump.
//   - On activate: apply jumpForce, decrement remainingJumps.
//   - Reset remainingJumps in IdleState.enter() / RunningState.enter().
// TODO: Add WALL_JUMP ability as a related extension.
// TODO: Some archetypes (Rogue) may start with this unlocked.
// ============================================================

import { Ability, AbilityContext } from './Ability';

export class DoubleJumpAbility extends Ability {
  readonly id     = 'doubleJump';
  readonly name   = 'Double Jump';
  readonly locked = true;

  private remainingJumps = 1;

  activate(_ctx: AbilityContext): void {
    if (this.remainingJumps <= 0) return;
    this.remainingJumps--;
    // TODO: Apply jumpForce to player rigidbody
  }

  /** Call this when the player lands */
  resetJumps(): void {
    this.remainingJumps = 1;
  }

  canActivate(_ctx: AbilityContext): boolean {
    if (this.locked) return false;
    return this.remainingJumps > 0;
  }
}
