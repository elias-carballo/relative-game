// ============================================================
// ENEMY MANAGER
// Owns all enemy instances in the current area.
// Bridges enemies to PhysicsEngine and handles contact damage.
//
// TODO: Enemy spawning from spawn-point definitions in ConnectorArea.
// TODO: Difficulty scaling via RunState (more enemies, higher stats).
// TODO: On-death loot table integration with CollectibleManager.
// TODO: Co-op enemy sync — enemies are server-authoritative.
// ============================================================

import { Enemy }         from './Enemy';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { overlapsEntity } from '../physics/Collision';
import { Player }        from '../player/Player';

export class EnemyManager {
  private enemies: Enemy[] = [];

  constructor(private physics: PhysicsEngine) {}

  add(enemy: Enemy): void {
    this.enemies.push(enemy);
    this.physics.register(enemy, enemy.body);
  }

  clear(): void {
    for (const e of this.enemies) {
      this.physics.unregister(e);
    }
    this.enemies = [];
  }

  update(_dt: number, players: Player[]): void {
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      enemy.update(_dt);

      // ---- Contact damage to players ----
      for (const player of players) {
        if (!player.active) continue;
        if (overlapsEntity(enemy, player)) {
          player.takeDamage(enemy.stats.damage);
          // Simple knockback — push player away from enemy center
          const dir = player.cx > enemy.cx ? 1 : -1;
          player.body.velocity.x = dir  * 200;
          player.body.velocity.y = -200;
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const enemy of this.enemies) {
      enemy.render(ctx);
    }
  }

  getAll(): Enemy[] {
    return this.enemies;
  }

  countActive(): number {
    return this.enemies.filter(e => e.active).length;
  }
}
