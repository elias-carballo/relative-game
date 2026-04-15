// ============================================================
// RIGIDBODY
// Physics state component attached to any entity that needs
// velocity-based movement and gravity.
// Kept as a plain data class; PhysicsEngine drives the logic.
// ============================================================

import { Vector2 } from '../core/Vector2';

export class Rigidbody {
  velocity:        Vector2 = Vector2.zero();
  isGrounded:      boolean = false;
  wasGrounded:     boolean = false; // previous frame grounded state

  // Coyote time: lets player jump briefly after walking off a ledge
  coyoteTimer:     number  = 0;

  // Jump buffer: lets player press jump just before landing
  jumpBufferTimer: number  = 0;

  // Gravity scale multiplier (1 = normal, 0 = floating, negative = inverted)
  gravityScale:    number  = 1;

  // If true this frame, the body is pressing against a wall
  // TODO: wall-climb / wall-grab system will read these
  touchingWallLeft:  boolean = false;
  touchingWallRight: boolean = false;
}
