// ============================================================
// COLLISION
// AABB (Axis-Aligned Bounding Box) utilities and resolution
// against static platform rectangles.
//
// Resolution order: vertical first, then horizontal.
// This gives stable ground-detection and wall-detection.
// ============================================================

import { Entity }    from '../core/Entity';
import { Rigidbody } from './Rigidbody';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** True if the entity's AABB overlaps the rect */
export function overlapsRect(entity: Entity, rect: Rect): boolean {
  return (
    entity.right  > rect.x         &&
    entity.left   < rect.x + rect.w &&
    entity.bottom > rect.y         &&
    entity.top    < rect.y + rect.h
  );
}

/** True if two entities overlap */
export function overlapsEntity(a: Entity, b: Entity): boolean {
  return (
    a.right  > b.left  &&
    a.left   < b.right &&
    a.bottom > b.top   &&
    a.top    < b.bottom
  );
}

/**
 * Resolve a dynamic entity against a list of static platform rects.
 * Modifies entity.position and body.velocity in-place.
 * Sets body.isGrounded / touchingWallLeft / touchingWallRight.
 */
export function resolveAgainstPlatforms(
  entity:    Entity,
  body:      Rigidbody,
  platforms: Rect[],
): void {
  body.touchingWallLeft  = false;
  body.touchingWallRight = false;

  for (const plat of platforms) {
    if (!overlapsRect(entity, plat)) continue;

    // Compute overlap on each axis
    const overlapLeft  = entity.right  - plat.x;
    const overlapRight = (plat.x + plat.w) - entity.left;
    const overlapTop   = entity.bottom - plat.y;
    const overlapBot   = (plat.y + plat.h) - entity.top;

    // Determine minimum-penetration axis (resolve smallest overlap first)
    const minH = Math.min(overlapLeft, overlapRight);
    const minV = Math.min(overlapTop,  overlapBot);

    if (minV <= minH) {
      // ---- Vertical resolution ----
      if (overlapTop < overlapBot) {
        // Entity coming from above — landed on platform
        entity.position.y -= overlapTop;
        if (body.velocity.y > 0) body.velocity.y = 0;
        body.isGrounded = true;
      } else {
        // Entity coming from below — hit ceiling
        entity.position.y += overlapBot;
        if (body.velocity.y < 0) body.velocity.y = 0;
      }
    } else {
      // ---- Horizontal resolution ----
      if (overlapLeft < overlapRight) {
        entity.position.x -= overlapLeft;
        if (body.velocity.x > 0) body.velocity.x = 0;
        body.touchingWallRight = true;
      } else {
        entity.position.x += overlapRight;
        if (body.velocity.x < 0) body.velocity.x = 0;
        body.touchingWallLeft = true;
      }
    }
  }
}
