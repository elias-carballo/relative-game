// ============================================================
// CONNECTOR AREA
// A dynamic area between nodes. Layout and contents can vary
// between runs based on RunState modifiers.
//
// ConnectorArea subclasses implement configure(runState) to
// swap enemy configs, platform layouts, and reward pools.
//
// TODO: Procedural layout generation hook — configure() selects
//       from a pool of hand-designed layout variants indexed by
//       runState.layoutVariantSeed.
// TODO: Dynamic enemy spawn groups based on difficultyMod.
// TODO: Dynamic reward density based on rewardMod.
// TODO: Hazard injection (spikes, projectile traps) based on difficulty.
// ============================================================

import { Area }     from './Area';
import { RunState } from '../progression/RunState';

export abstract class ConnectorArea extends Area {
  readonly isPersistent = false;

  /** Called each time the connector is activated.
   *  Use runState to scale enemies, rewards, and layout. */
  abstract configure(runState: RunState): void;

  onEnter(): void {
    console.log(`[ConnectorArea] Entered: ${this.name}`);
  }

  onExit(): void {
    console.log(`[ConnectorArea] Exited: ${this.name}`);
  }
}


export { ConnectorArea }