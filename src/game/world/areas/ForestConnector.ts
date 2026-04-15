// ============================================================
// FOREST CONNECTOR
// The first dynamic area between the camp and deeper nodes.
// Layout is hand-authored but enemy count and rewards scale
// with RunState modifiers.
//
// TODO: Add multiple layout variants selectable by run seed.
// TODO: Add hazard layer (spikes, falling rocks) at higher difficulty.
// TODO: Add boss encounter trigger at high run count.
// TODO: Implement proper enemy spawn points rather than hardcoded positions.
// ============================================================

import { ConnectorArea } from '../ConnectorArea';
import { Platform }      from '../Platform';
import { RunState }      from '../../progression/RunState';
import { Enemy, PatrolBehavior } from '../../enemy/Enemy';
import { CurrencyPickup }        from '../../collectibles/CurrencyPickup';
import { BASE_ENEMY_COUNT, BASE_CURRENCY_DROPS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';

export interface ForestConnectorSpawn {
  enemies:     Enemy[];
  collectibles: CurrencyPickup[];
}

export class ForestConnector extends ConnectorArea {
  readonly id   = 'forest_connector';
  readonly name = 'Forest Path';

  private _spawn: ForestConnectorSpawn = { enemies: [], collectibles: [] };

  constructor() {
    super(CANVAS_WIDTH * 2, CANVAS_HEIGHT); // wider than a single screen
    this.spawnX = 60;
    this.spawnY = CANVAS_HEIGHT - 120;
    this.buildLayout();
  }

  configure(runState: RunState): void {
    const { enemyCountMod, rewardMod } = runState;

    const enemyCount    = Math.round(BASE_ENEMY_COUNT    * enemyCountMod);
    const currencyCount = Math.round(BASE_CURRENCY_DROPS * rewardMod);

    const enemies: Enemy[] = [];

    // ---- Spawn enemies at predefined anchor points ----
    const anchorX = [380, 680, 950, 1100, 1300];
    const groundY = CANVAS_HEIGHT - 40;

    for (let i = 0; i < Math.min(enemyCount, anchorX.length); i++) {
      const e = new Enemy(
        anchorX[i],
        groundY - 38,
        {
          health:    Math.round(30 * runState.difficultyMod),
          maxHealth: Math.round(30 * runState.difficultyMod),
          damage:    Math.round(10 * runState.difficultyMod),
          speed:     60,
        },
        new PatrolBehavior(),
      );
      e.patrolLeft  = anchorX[i] - 80;
      e.patrolRight = anchorX[i] + 80;
      enemies.push(e);
    }

    // ---- Currency drops (floating in mid-air) ----
    const collectibles: CurrencyPickup[] = [];
    const dropPositions = [
      [300, groundY - 120],
      [550, groundY - 160],
      [750, groundY - 80],
      [900, groundY - 200],
      [1150, groundY - 120],
      [1350, groundY - 80],
    ];

    for (let i = 0; i < Math.min(currencyCount, dropPositions.length); i++) {
      const [dx, dy] = dropPositions[i];
      collectibles.push(new CurrencyPickup(dx, dy, 1));
    }

    this._spawn = { enemies, collectibles };
  }

  /** Returns spawned enemies and collectibles for this run */
  getSpawn(): ForestConnectorSpawn {
    return this._spawn;
  }

  private buildLayout(): void {
    const W = this.width;
    const H = this.height;
    const ground = '#374151';
    const ledge  = '#4b5563';
    const ledgeD = '#3d4452';

    // ---- Ground floor ----
    this.platforms.push(new Platform(0, H - 40, W, 40, ground));

    // ---- Platform staircase (left side) ----
    this.platforms.push(new Platform(200, H - 110, 120, 16, ledge));
    this.platforms.push(new Platform(380, H - 170, 100, 16, ledge));
    this.platforms.push(new Platform(520, H - 130, 80,  16, ledgeD));

    // ---- Mid section ----
    this.platforms.push(new Platform(620, H - 220, 140, 16, ledge));
    this.platforms.push(new Platform(800, H - 160, 100, 16, ledgeD));
    this.platforms.push(new Platform(940, H - 240, 80,  16, ledge));

    // ---- Right section ----
    this.platforms.push(new Platform(1060, H - 180, 120, 16, ledge));
    this.platforms.push(new Platform(1220, H - 140, 100, 16, ledgeD));
    this.platforms.push(new Platform(1380, H - 200, 80,  16, ledge));

    // ---- Exit back to camp ----
    this.exits.push({
      rect:   { x: 0, y: H - 40 - 80, w: 32, h: 80 },
      target: 'camp',
      label:  'Camp',
    });

    // ---- Optional forward exit (to next node — placeholder) ----
    this.exits.push({
      rect:   { x: W - 36, y: H - 40 - 80, w: 32, h: 80 },
      target: 'camp',        // TODO: Replace with next node ID
      label:  'Deeper',
    });
  }

  renderBackground(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0,   '#0f172a');
    gradient.addColorStop(0.7, '#1e2a1a');
    gradient.addColorStop(1,   '#111827');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Background tree silhouettes
    this.renderTrees(ctx);

    // Area name watermark
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.font      = 'bold 80px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.width / 2, this.height / 2 + 20);
  }

  private renderTrees(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(10, 30, 10, 0.7)';
    const treePositions = [150, 350, 600, 850, 1050, 1250, 1450];
    for (const tx of treePositions) {
      const h = 100 + (tx % 60);
      const w = 40 + (tx % 30);
      const y = this.height - 40 - h;
      // Trunk
      ctx.fillRect(tx + w / 2 - 5, y + h - 20, 10, 20);
      // Canopy (triangle approximation via two rects)
      ctx.beginPath();
      ctx.moveTo(tx + w / 2, y);
      ctx.lineTo(tx,         y + h);
      ctx.lineTo(tx + w,     y + h);
      ctx.closePath();
      ctx.fill();
    }
  }
}
