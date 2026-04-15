// ============================================================
// ACTION SYSTEM
// Manages the three combat slots per player: primary, secondary,
// and utility. Delegates input detection to the player layer.
//
// TODO: Fully implement melee hitbox sweep on primary activate.
// TODO: Implement projectile spawning on secondary activate.
// TODO: Add combo system (chain primary actions for extra hits).
// TODO: Add parry / block window triggered on utility timing.
// ============================================================

import { Action, ActionContext } from './Action';

export type ActionSlot = 'primary' | 'secondary' | 'utility';

export class ActionSystem {
  private slots: Map<ActionSlot, Action | null> = new Map([
    ['primary',   null],
    ['secondary', null],
    ['utility',   null],
  ]);

  setAction(slot: ActionSlot, action: Action): void {
    this.slots.set(slot, action);
  }

  trigger(slot: ActionSlot, ctx: ActionContext): boolean {
    const action = this.slots.get(slot);
    if (!action || !action.canActivate(ctx)) return false;
    action.activate(ctx);
    return true;
  }

  update(dt: number): void {
    for (const action of this.slots.values()) {
      action?.update(dt);
    }
  }

  getAction(slot: ActionSlot): Action | null {
    return this.slots.get(slot) ?? null;
  }
}
