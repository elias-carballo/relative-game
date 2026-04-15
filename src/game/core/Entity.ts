// ============================================================
// ENTITY
// Base class for all game objects (players, enemies, collectibles).
// Provides a unique ID, position, dimensions, and an active flag.
// ============================================================

import { Vector2 } from './Vector2';

let _nextId = 0;

export abstract class Entity {
  readonly id: number;

  position: Vector2;
  width:    number;
  height:   number;
  active:   boolean = true;

  constructor(x: number, y: number, w: number, h: number) {
    this.id       = _nextId++;
    this.position = new Vector2(x, y);
    this.width    = w;
    this.height   = h;
  }

  /** AABB left edge */
  get left():   number { return this.position.x; }
  /** AABB right edge */
  get right():  number { return this.position.x + this.width; }
  /** AABB top edge */
  get top():    number { return this.position.y; }
  /** AABB bottom edge */
  get bottom(): number { return this.position.y + this.height; }

  /** Center X */
  get cx(): number { return this.position.x + this.width  / 2; }
  /** Center Y */
  get cy(): number { return this.position.y + this.height / 2; }

  abstract update(dt: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
}

export { Entity }