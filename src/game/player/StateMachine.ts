// ============================================================
// STATE MACHINE
// Generic finite-state machine. Drives state transitions based
// on the return value of the current state's update() call.
// Each state is registered by its ID; the machine owns instances.
// ============================================================

import { PlayerState, PlayerStateId, IPlayerContext } from './PlayerStates';

export class StateMachine {
  private states:  Map<PlayerStateId, PlayerState> = new Map();
  private current: PlayerState | null = null;

  register(state: PlayerState): void {
    this.states.set(state.id, state);
  }

  setState(id: PlayerStateId, ctx: IPlayerContext): void {
    if (this.current?.id === id) return;

    this.current?.exit(ctx);
    const next = this.states.get(id);
    if (!next) {
      console.warn(`[StateMachine] Unknown state: ${id}`);
      return;
    }
    this.current = next;
    this.current.enter(ctx);
  }

  update(ctx: IPlayerContext, dt: number): void {
    if (!this.current) return;

    const next = this.current.update(ctx, dt);
    if (next !== null && next !== this.current.id) {
      this.setState(next, ctx);
    }
  }

  get currentId(): PlayerStateId | null {
    return this.current?.id ?? null;
  }
}
