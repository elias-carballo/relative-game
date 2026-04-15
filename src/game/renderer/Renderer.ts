// ============================================================
// RENDERER
// Orchestrates all drawing calls for a single frame.
// Separates HUD (screen-space) from world-space rendering.
//
// Rendering order:
//   1. Background (area-specific)
//   2. Platforms
//   3. Exits (debug guides)
//   4. Collectibles
//   5. Enemies
//   6. Players
//   7. HUD (screen-space, no camera transform)
//
// TODO: Add sprite sheet support to replace rect-based rendering.
// TODO: Add particle system layer.
// TODO: Add screen-shake effect (offset camera transform).
// TODO: Split-screen HUD for local co-op.
// ============================================================

import { Camera }          from '../core/Camera';
import { Area }            from '../world/Area';
import { Player }          from '../player/Player';
import { EnemyManager }    from '../enemy/EnemyManager';
import { CollectibleManager } from '../collectibles/CollectibleManager';
import { ResourceManager } from '../resources/ResourceManager';
import { RunState }        from '../progression/RunState';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

export class Renderer {
  constructor(
    private ctx:     CanvasRenderingContext2D,
    private camera:  Camera,
  ) {}

  renderFrame(
    area:         Area,
    players:      Player[],
    enemies:      EnemyManager,
    collectibles: CollectibleManager,
    resources:    ResourceManager,
    runState:     RunState,
  ): void {
    const ctx = this.ctx;

    // ---- Clear ----
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ---- World space ----
    area.renderBackground(ctx);

    this.camera.begin(ctx);
      area.renderPlatforms(ctx);
      area.renderExits(ctx);
      collectibles.render(ctx);
      enemies.render(ctx);
      for (const player of players) {
        player.render(ctx);
      }
    this.camera.end(ctx);

    // ---- HUD (screen space) ----
    this.renderHUD(ctx, players, resources, runState, area.name);
  }

  private renderHUD(
    ctx:       CanvasRenderingContext2D,
    players:   Player[],
    resources: ResourceManager,
    runState:  RunState,
    areaName:  string,
  ): void {
    // ---- Top bar backdrop ----
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 44);

    // Area name — top center
    ctx.fillStyle    = 'rgba(255,255,255,0.55)';
    ctx.font         = '11px monospace';
    ctx.textAlign    = 'center';
    ctx.fillText(areaName.toUpperCase(), CANVAS_WIDTH / 2, 16);

    // Run info — top center (smaller)
    ctx.fillStyle = 'rgba(255,220,100,0.5)';
    ctx.font      = '10px monospace';
    ctx.fillText(`Run #${runState.runNumber}  |  ${runState.lastRunSummary}`, CANVAS_WIDTH / 2, 32);

    // Currency — top left
    ctx.fillStyle = '#fbbf24';
    ctx.font      = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`◆ ${resources.currency}`, 12, 20);

    // Difficulty indicator — top left, below currency
    const diffColor: Record<string, string> = {
      easy:   '#4ade80',
      normal: '#60a5fa',
      hard:   '#f87171',
    };
    ctx.fillStyle = diffColor[runState.difficultyLevel] ?? '#aaa';
    ctx.font      = '10px monospace';
    ctx.fillText(`[${runState.difficultyLevel.toUpperCase()}]`, 12, 36);

    // Player health bars — bottom left
    players.forEach((player, i) => {
      this.renderPlayerHUD(ctx, player, i);
    });

    // Debug: state label (can remove in production)
    if (players.length > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font      = '10px monospace';
      ctx.textAlign = 'right';
      const p = players[0];
      const state = p.fsm.currentId ?? 'none';
      ctx.fillText(`state: ${state}`, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 8);
    }
  }

  private renderPlayerHUD(
    ctx:    CanvasRenderingContext2D,
    player: Player,
    index:  number,
  ): void {
    const barW  = 120;
    const barH  = 10;
    const barX  = 12;
    const barY  = CANVAS_HEIGHT - 28 - index * 24;
    const ratio = player.health / player.stats.maxHealth;

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font      = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`P${index + 1}`, barX, barY - 2);

    // Bar BG
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX + 20, barY - barH + 2, barW, barH);

    // Bar fill
    ctx.fillStyle = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(barX + 20, barY - barH + 2, Math.round(barW * ratio), barH);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(barX + 20, barY - barH + 2, barW, barH);
  }

  renderMenu(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#f8fafc';
    ctx.font      = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HOLLOW FOUNDATION', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font      = '13px monospace';
    ctx.fillText('Press ENTER or SPACE to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font      = '10px monospace';
    ctx.fillText('WASD / Arrows to move  |  Space / Up to jump', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
  }

  renderPause(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#f8fafc';
    ctx.font      = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font      = '12px monospace';
    ctx.fillText('Press ESC to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  }
}
