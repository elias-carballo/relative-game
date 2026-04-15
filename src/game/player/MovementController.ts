// ============================================================
// MOVEMENT CONTROLLER
// Translates input into velocity deltas each frame.
// Applied on top of physics integration done by PhysicsEngine.
//
// Design: this module ONLY handles horizontal motion and facing.
// Vertical motion (jumping/gravity) is initiated by states and
// integrated by PhysicsEngine.
//
// TODO: Dash — override velocity for a fixed duration.
// TODO: Wall-climb — set vy = -climbSpeed while wall key held.
// TODO: Wall-jump — set velocity toward opposite wall on jump.
// TODO: Knockback — temporary velocity override with decay.
// ============================================================

import { Rigidbody }    from '../physics/Rigidbody';
import { InputProfile } from '../input/InputProfile';
import { PlayerStateId } from './PlayerStates';

export class MovementController {
  applyHorizontal(
    body:      Rigidbody,
    input:     InputProfile,
    speed:     number,
    airControl: number,
    stateId:   PlayerStateId | null,
  ): void {
    const axis = input.horizontalAxis;

    if (axis !== 0) {
      const airborne = stateId === PlayerStateId.JUMPING ||
                       stateId === PlayerStateId.FALLING;
      const targetSpeed = speed * (airborne ? airControl : 1);

      // Celeste-style instant direction control: set velocity directly
      body.velocity.x = axis * targetSpeed;
    } else {
      // Instant stop on ground; light deceleration in air
      const grounded = body.isGrounded;
      if (grounded) {
        body.velocity.x = 0;
      } else {
        body.velocity.x *= 0.85; // air friction
      }
    }
  }

  /** Returns -1 or 1 based on horizontal input, or keeps previous facing */
  resolveFacing(axis: number, currentFacing: number): number {
    if (axis > 0) return  1;
    if (axis < 0) return -1;
    return currentFacing;
  }
}
