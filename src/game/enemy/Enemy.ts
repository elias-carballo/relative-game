// ============================================================
// ENEMY
// Base enemy entity. Behavior is driven by a pluggable
// behavior strategy, keeping Enemy data/render separate from AI.
//
// TODO: Implement patrol behavior (move left/right between bounds).
// TODO: Implement aggro range — switch to chase behavior on detection.
// TODO: Implement attack behavior (charge, ranged, etc.).
// TODO: Integrate with PhysicsEngine (gravity, platform collision).
// TODO: Implement drop table — roll collectibles on death.
// TODO: Scale stats via RunState difficulty modifier.
// ============================================================

import { Entity }    from '../core/Entity';
import { Rigidbody } from '../physics/Rigidbody';
import { ENEMY_W, ENEMY_H } from '../constants';

export interface EnemyStats {
  health:    number;
  maxHealth: number;
  damage:    number;
  speed:     number;
}

export type EnemyBehaviorId = 'idle' | 'patrol' | 'chase' | 'attack';

export interface EnemyBehavior {
  readonly id: EnemyBehaviorId;
  update(enemy: Enemy, dt: number): void;
}

export class Enemy extends Entity {
  stats:    EnemyStats;
  body:     Rigidbody;
  behavior: EnemyBehavior;
  facingDir: number = 1;

  patrolLeft:  number;
  patrolRight: number;

  constructor(
    x: number,
    y: number,
    stats: Partial<EnemyStats> = {},
    behavior?: EnemyBehavior,
  ) {
    super(x, y, ENEMY_W, ENEMY_H);

    this.stats = {
      health:    stats.health    ?? 30,
      maxHealth: stats.maxHealth ?? 30,
      damage:    stats.damage    ?? 10,
      speed:     stats.speed     ?? 60,
    };

    this.body        = new Rigidbody();
    this.patrolLeft  = x - 80;
    this.patrolRight = x + 80;
    this.behavior    = behavior ?? new IdleBehavior();
  }

  update(dt: number): void {
    if (!this.active) return;
    this.behavior.update(this, dt);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
      Math.round(this.position.x),
      Math.round(this.position.y),
      this.width,
      this.height,
    );

    // Health bar
    const ratio = this.stats.health / this.stats.maxHealth;
    const barY  = Math.round(this.position.y) - 6;

    ctx.fillStyle = '#333';
    ctx.fillRect(Math.round(this.position.x), barY, this.width, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(Math.round(this.position.x), barY, Math.round(this.width * ratio), 3);
  }

  takeDamage(amount: number): void {
    this.stats.health = Math.max(0, this.stats.health - amount);
    if (this.stats.health <= 0) this.active = false;
  }
}

// ---- Idle Behavior ----
class IdleBehavior implements EnemyBehavior {
  readonly id = 'idle' as const;
  update(_enemy: Enemy, _dt: number): void {
    // Placeholder: enemy stands still
    // TODO: Add animation idle cycle
  }
}

// ---- Patrol Behavior (scaffold) ----
export class PatrolBehavior implements EnemyBehavior {
  readonly id = 'patrol' as const;

  update(enemy: Enemy, _dt: number): void {
    // Horizontal velocity set here; PhysicsEngine integrates it
    enemy.body.velocity.x = enemy.facingDir * enemy.stats.speed;

    if (enemy.cx >= enemy.patrolRight) enemy.facingDir = -1;
    if (enemy.cx <= enemy.patrolLeft)  enemy.facingDir =  1;
    // TODO: Flip direction on wall contact (body.touchingWallLeft/Right)
    // TODO: Switch to chase behavior when player enters aggro range
  }
}
