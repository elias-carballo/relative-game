// ============================================================
// CAMP NODE
// The player's safe home base. Persistent across runs.
// Spawns at this area after dying or completing a connector.
//
// Contains:
//   - Simple platform layout
//   - Exit to the first connector
//   - HUD display (currency + last run summary) rendered by Renderer
//
// TODO: Add campfire NPC (rest/upgrade interaction).
// TODO: Add character selection point.
// TODO: Add upgrade shop — spend currency on permanent upgrades.
// TODO: Add corpse-recovery orb if player died last run.
// ============================================================

import { NodeArea }  from '../NodeArea';
import { Platform }  from '../Platform';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';

export class CampNode extends NodeArea {
  readonly id   = 'camp';
  readonly name = 'The Camp';

  constructor() {
    super(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.spawnX = 120;
    this.spawnY = CANVAS_HEIGHT - 120;
    this.buildLayout();
  }

  private buildLayout(): void {
    const W = this.width;
    const H = this.height;

    // Ground floor
    this.platforms.push(new Platform(0, H - 40, W, 40, '#374151'));

    // Left ledge
    this.platforms.push(new Platform(40, H - 130, 120, 16, '#4b5563'));

    // Middle raised platform (campfire position)
    this.platforms.push(new Platform(W / 2 - 80, H - 180, 160, 16, '#4b5563'));

    // Right small shelf
    this.platforms.push(new Platform(W - 160, H - 130, 100, 16, '#4b5563'));

    // ---- Exit to Forest Connector ----
    this.exits.push({
      rect:   { x: W - 36, y: H - 40 - 80, w: 32, h: 80 },
      target: 'forest_connector',
      label:  'Forest',
    });
  }

  renderBackground(ctx: CanvasRenderingContext2D): void {
    // Warm twilight sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0,   '#1c1a2e');
    gradient.addColorStop(0.6, '#2d1b3d');
    gradient.addColorStop(1,   '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars (static, not animated to keep it simple)
    this.renderStars(ctx);

    // Campfire glow
    const fireX = this.width / 2;
    const fireY = this.height - 180 - 20;
    this.renderCampfire(ctx, fireX, fireY);
  }

  private renderStars(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    const starPos = [
      [80,30],[200,60],[400,20],[550,45],[680,25],[720,80],
      [140,90],[320,70],[460,50],[600,80],[750,35],
    ];
    for (const [sx, sy] of starPos) {
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderCampfire(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Glow
    const glow = ctx.createRadialGradient(x, y, 2, x, y, 60);
    glow.addColorStop(0,   'rgba(255, 160, 50, 0.25)');
    glow.addColorStop(1,   'rgba(255, 100, 20, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    // Log base
    ctx.fillStyle = '#5c3317';
    ctx.fillRect(x - 14, y + 2, 28, 8);

    // Flame (simple triangle)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x - 10, y + 2);
    ctx.lineTo(x + 10, y + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x - 5, y + 2);
    ctx.lineTo(x + 5, y + 2);
    ctx.closePath();
    ctx.fill();

    // "CAMP" label
    ctx.fillStyle    = 'rgba(255,200,100,0.6)';
    ctx.font         = '11px monospace';
    ctx.textAlign    = 'center';
    ctx.fillText('CAMP', x, y - 26);
  }

  onEnter(): void {
    super.onEnter();
    // TODO: Play camp ambient sound
    // TODO: Show upgrade shop if currency >= threshold
  }
}
