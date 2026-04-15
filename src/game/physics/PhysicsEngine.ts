// ============================================================
// PHYSICS ENGINE
// Drives gravity, velocity integration, and collision resolution
// for all registered dynamic entities (players, enemies).
// Static platforms are supplied each frame by the active Area.
// ============================================================

import { GRAVITY, MAX_FALL_SPEED, COYOTE_TIME } from '../constants';
import { Entity }                    from '../core/Entity';
import { Rigidbody }                 from './Rigidbody';
import { Rect, resolveAgainstPlatforms } from './Collision';

export interface PhysicsBody {
  entity:   Entity;
  rigidbody: Rigidbody;
}

export class PhysicsEngine {
  private bodies: PhysicsBody[] = [];

  register(entity: Entity, rigidbody: Rigidbody): void {
    this.bodies.push({ entity, rigidbody });
  }

  unregister(entity: Entity): void {
    this.bodies = this.bodies.filter(b => b.entity !== entity);
  }

  clear(): void {
    this.bodies = [];
  }

  update(dt: number, platforms: Rect[]): void {
    for (const { entity, rigidbody: body } of this.bodies) {
      if (!entity.active) continue;

      body.wasGrounded = body.isGrounded;
      body.isGrounded  = false;

      // ---- Apply gravity ----
      body.velocity.y += GRAVITY * body.gravityScale * dt;
      if (body.velocity.y > MAX_FALL_SPEED) {
        body.velocity.y = MAX_FALL_SPEED;
      }

      // ---- Integrate velocity ----
      entity.position.x += body.velocity.x * dt;
      entity.position.y += body.velocity.y * dt;

      // ---- Resolve collisions ----
      resolveAgainstPlatforms(entity, body, platforms);

      // ---- Coyote time: brief grace period after walking off a ledge ----
      if (body.wasGrounded && !body.isGrounded) {
        body.coyoteTimer = COYOTE_TIME;
      } else if (body.isGrounded) {
        body.coyoteTimer = 0;
      } else {
        body.coyoteTimer = Math.max(0, body.coyoteTimer - dt);
      }

      // ---- Jump buffer: decay over time ----
      if (body.jumpBufferTimer > 0) {
        body.jumpBufferTimer = Math.max(0, body.jumpBufferTimer - dt);
      }
    }
  }
}
