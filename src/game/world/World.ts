// ============================================================
// WORLD
// Manages the registry of all areas and handles transitions.
// Emits AREA_EXIT / AREA_ENTERED events consumed by Game.
//
// TODO: Add loading screen between transitions.
// TODO: Preload adjacent areas for seamless travel.
// TODO: Support multi-room connector stitching.
// TODO: Unlock new node areas after achieving objectives.
// ============================================================

import { Area }         from './Area';
import { eventBus, Events } from '../core/EventBus';
import { RunState }     from '../progression/RunState';
import { ConnectorArea } from './ConnectorArea';
import { Rect } from '../physics/Collision';
import { Player }       from '../player/Player';

export class World {
  private areas:   Map<string, Area>     = new Map();
  private current: Area | null           = null;

  registerArea(area: Area): void {
    this.areas.set(area.id, area);
  }

  getArea(id: string): Area | undefined {
    return this.areas.get(id);
  }

  getCurrentArea(): Area | null {
    return this.current;
  }

  /**
   * Transitions to the area with the given ID.
   * If the area is a ConnectorArea, configure() is called with runState.
   */
  transitionTo(areaId: string, runState: RunState): Area | null {
    const next = this.areas.get(areaId);
    if (!next) {
      console.warn(`[World] Unknown area: ${areaId}`);
      return null;
    }

    if (this.current) {
      this.current.onExit();
    }

    if (next instanceof ConnectorArea) {
      next.configure(runState);
    }

    this.current = next;
    this.current.onEnter();

    eventBus.emit(Events.AREA_ENTERED, { areaId });
    return this.current;
  }

  getPlatformRects(): Rect[] {
    return this.current?.getPlatformRects() ?? [];
  }

  /**
   * Check if any player is overlapping an exit zone.
   * Returns the exit target area ID if triggered, or null.
   */
  checkExitTriggers(players: Player[]): string | null {
    if (!this.current) return null;

    for (const exit of this.current.exits) {
      for (const player of players) {
        if (!player.active) continue;

        // Treat exit rect as an entity-shaped rect for overlap check
        const fakeEntity = {
          left:   exit.rect.x,
          right:  exit.rect.x + exit.rect.w,
          top:    exit.rect.y,
          bottom: exit.rect.y + exit.rect.h,
        };

        if (
          player.right  > fakeEntity.left  &&
          player.left   < fakeEntity.right &&
          player.bottom > fakeEntity.top   &&
          player.top    < fakeEntity.bottom
        ) {
          return exit.target;
        }
      }
    }

    return null;
  }
}
