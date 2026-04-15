// ============================================================
// INPUT PROFILE
// Defines the key bindings for a single player.
// Each player in the game gets their own InputProfile,
// which enables independent simultaneous controls.
// TODO: Add gamepad support (Gamepad API) per profile.
// TODO: Co-op sync will consume serialized InputSnapshot per tick.
// ============================================================

export interface KeyBindings {
  left:            string;
  right:           string;
  jump:            string;
  jumpAlt:         string;
  dash:            string;       // TODO: unlock via AbilitySystem
  primaryAction:   string;       // melee
  secondaryAction: string;       // ranged / spell
  utilityAction:   string;       // interact
  pause:           string;
}

export const DEFAULT_BINDINGS_P1: KeyBindings = {
  left:            'ArrowLeft',
  right:           'ArrowRight',
  jump:            'ArrowUp',
  jumpAlt:         ' ',          // Space
  dash:            'Shift',
  primaryAction:   'z',
  secondaryAction: 'x',
  utilityAction:   'c',
  pause:           'Escape',
};

export const DEFAULT_BINDINGS_P2: KeyBindings = {
  left:            'a',
  right:           'd',
  jump:            'w',
  jumpAlt:         'w',
  dash:            'q',
  primaryAction:   'g',
  secondaryAction: 'h',
  utilityAction:   'f',
  pause:           'Escape',
};

export class InputProfile {
  bindings: KeyBindings;

  private _held:    Set<string> = new Set();
  private _pressed: Set<string> = new Set(); // truthy for one tick
  private _released:Set<string> = new Set(); // truthy for one tick

  constructor(bindings: KeyBindings) {
    this.bindings = bindings;
  }

  // ---- Called by InputManager on keyboard events ----

  recordKeyDown(key: string): void {
    if (!this._held.has(key)) {
      this._pressed.add(key);
    }
    this._held.add(key);
  }

  recordKeyUp(key: string): void {
    this._held.delete(key);
    this._released.add(key);
  }

  /** Must be called at end of each frame to clear one-tick sets */
  flush(): void {
    this._pressed.clear();
    this._released.clear();
  }

  // ---- Query helpers ----

  isHeld(action: keyof KeyBindings): boolean {
    const key = this.bindings[action];
    return this._held.has(key);
  }

  isPressed(action: keyof KeyBindings): boolean {
    const key = this.bindings[action];
    return this._pressed.has(key);
  }

  isReleased(action: keyof KeyBindings): boolean {
    const key = this.bindings[action];
    return this._released.has(key);
  }

  /** Horizontal axis: -1 left, 0 neutral, 1 right */
  get horizontalAxis(): number {
    const l = this.isHeld('left')  ? -1 : 0;
    const r = this.isHeld('right') ?  1 : 0;
    return l + r;
  }
}
