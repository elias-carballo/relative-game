// ============================================================
// INPUT MANAGER
// Registers global keyboard listeners and routes events to the
// correct player's InputProfile.
//
// Design: each player index maps to exactly one InputProfile.
// All profiles listen to the same keyboard events; each profile
// filters for its own keybindings.
//
// TODO: Add Gamepad API polling here (one gamepad per player).
// TODO: For online co-op, replace direct input with serialized
//       InputSnapshot packets received from the network layer.
// ============================================================

import { InputProfile, DEFAULT_BINDINGS_P1, DEFAULT_BINDINGS_P2 } from './InputProfile';

export class InputManager {
  private profiles: InputProfile[] = [];
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp:   (e: KeyboardEvent) => void;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp   = this.handleKeyUp.bind(this);
  }

  init(): void {
    // Register default profiles for up to 2 local players
    this.addProfile(new InputProfile(DEFAULT_BINDINGS_P1));
    this.addProfile(new InputProfile(DEFAULT_BINDINGS_P2));

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup',   this.boundKeyUp);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup',   this.boundKeyUp);
  }

  addProfile(profile: InputProfile): void {
    this.profiles.push(profile);
  }

  getProfile(playerIndex: number): InputProfile | undefined {
    return this.profiles[playerIndex];
  }

  /** Called at end of each game frame to clear one-tick buffers */
  flush(): void {
    for (const p of this.profiles) {
      p.flush();
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent default browser scroll / space behavior during gameplay
    const blocked = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (blocked.includes(e.key)) e.preventDefault();

    for (const profile of this.profiles) {
      profile.recordKeyDown(e.key);
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    for (const profile of this.profiles) {
      profile.recordKeyUp(e.key);
    }
  }
}
