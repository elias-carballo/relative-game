// ============================================================
// ACTION (BASE)
// An Action represents a single combat or interaction move
// (primary attack, ranged shot, utility). Designed to be
// triggered by the ActionSystem.
//
// TODO: Implement hitbox generation on activate().
// TODO: Add animation binding (action → sprite frames).
// TODO: Add resource cost (mana, stamina).
// TODO: Add on-hit callbacks for damage application.
// ============================================================

export abstract class Action {
  abstract readonly id:   string;
  abstract readonly name: string;

  protected cooldown:    number = 0;
  readonly cooldownMax:  number = 0;

  abstract activate(context: ActionContext): void;

  canActivate(_ctx: ActionContext): boolean {
    return this.cooldown <= 0;
  }

  update(dt: number): void {
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - dt);
    }
  }
}

export interface ActionContext {
  dt:        number;
  playerX:   number;
  playerY:   number;
  facingDir: number;
  // TODO: Add reference to EnemyManager for hit detection
  // TODO: Add reference to ResourceManager for cost deduction
}


export { Action }