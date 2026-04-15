// ============================================================
// VECTOR2
// Immutable-style 2D vector utility used throughout the engine.
// ============================================================

export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  scale(s: number): Vector2 {
    return new Vector2(this.x * s, this.y * s);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalized(): Vector2 {
    const len = this.length();
    if (len === 0) return new Vector2(0, 0);
    return new Vector2(this.x / len, this.y / len);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  copyFrom(v: Vector2): void {
    this.x = v.x;
    this.y = v.y;
  }

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static from(x: number, y: number): Vector2 {
    return new Vector2(x, y);
  }
}
