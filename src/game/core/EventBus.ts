// ============================================================
// EVENT BUS
// Lightweight publish-subscribe system for decoupled communication
// between systems (physics events, pickups, state transitions, etc.).
// ============================================================

type Listener<T = unknown> = (payload: T) => void;

export class EventBus {
  private listeners: Map<string, Listener[]> = new Map();

  on<T>(event: string, listener: Listener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener as Listener);
  }

  off<T>(event: string, listener: Listener<T>): void {
    const list = this.listeners.get(event);
    if (!list) return;
    const idx = list.indexOf(listener as Listener);
    if (idx !== -1) list.splice(idx, 1);
  }

  emit<T>(event: string, payload?: T): void {
    const list = this.listeners.get(event);
    if (!list) return;
    for (const listener of list) {
      listener(payload);
    }
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Singleton instance shared across all game systems
export const eventBus = new EventBus();

// ---- Known event names (add new events here as the game grows) ----
export const Events = {
  PLAYER_DIED:          'player:died',
  PLAYER_GROUNDED:      'player:grounded',
  COLLECTIBLE_PICKED:   'collectible:picked',
  AREA_EXIT:            'area:exit',
  AREA_ENTERED:         'area:entered',
  RUN_STARTED:          'run:started',
  RUN_ENDED:            'run:ended',
  CURRENCY_CHANGED:     'resource:currencyChanged',
  GAME_STATE_CHANGED:   'game:stateChanged',
  // TODO: Add events for co-op sync, enemy killed, ability unlocked, etc.
} as const;
