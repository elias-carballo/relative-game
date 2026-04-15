// ============================================================
// NODE AREA
// A fixed, persistent area. Layout never changes between runs.
// Used for: safe zones (camp), major dungeons, towns.
//
// TODO: Support NPC instances per node.
// TODO: Support persistent unlock state (e.g., unlocked doors).
// TODO: Support upgrade shop interface at camp node.
// ============================================================

import { Area } from './Area';

export abstract class NodeArea extends Area {
  readonly isPersistent = true;

  // TODO: npcs: NPC[] = [];
  // TODO: upgrades: UpgradeNode[] = [];
  // TODO: isSafeZone: boolean = false; (enemies won't follow player here)

  onEnter(): void {
    console.log(`[NodeArea] Entered: ${this.name}`);
  }

  onExit(): void {
    console.log(`[NodeArea] Exited: ${this.name}`);
  }
}


export { NodeArea }