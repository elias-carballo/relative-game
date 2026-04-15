// ============================================================
// PLAYER STATES
// Enum of all possible player states and the abstract base class
// for state objects. Each state encapsulates its own enter/update/exit
// logic, making it trivial to add new states without touching existing ones.
//
// TODO: Add states: DASH, DOUBLE_JUMP, WALL_GRAB, WALL_JUMP,
//       LEDGE_HANG, ATTACK, HIT_STUN, DEAD.
// ============================================================

import { JUMP_CUT_FACTOR, JUMP_BUFFER_TIME } from '../constants';
import { InputProfile } from '../input/InputProfile';
import { Rigidbody }    from '../physics/Rigidbody';

// Context interface used by all states to read player data without
// creating a hard dependency on the concrete Player class.
export interface IPlayerContext {
  input:     InputProfile;
  body:      Rigidbody;
  stats:     { speed: number; jumpForce: number; airControl: number };
  abilities: { has: (id: string) => boolean };
  facingDir: number;
  setFacing: (dir: number) => void;
  onJump:    () => void;
}

export enum PlayerStateId {
  IDLE         = 'idle',
  RUNNING      = 'running',
  JUMPING      = 'jumping',
  FALLING      = 'falling',
  // TODO: DASHING, DOUBLE_JUMPING, WALL_GRABBING, WALL_JUMPING,
  //       LEDGE_HANGING, ATTACKING, HIT_STUN, DEAD
}

export abstract class PlayerState {
  abstract readonly id: PlayerStateId;

  enter(_ctx: IPlayerContext): void {}
  abstract update(ctx: IPlayerContext, dt: number): PlayerStateId | null;
  exit(_ctx: IPlayerContext): void {}
}

// ============================================================
// STATE: IDLE
// ============================================================
export class IdleState extends PlayerState {
  readonly id = PlayerStateId.IDLE;

  update(ctx: IPlayerContext, _dt: number): PlayerStateId | null {
    const { input, body } = ctx;

    if (!body.isGrounded && body.coyoteTimer <= 0) return PlayerStateId.FALLING;

    if (shouldJump(ctx)) {
      ctx.onJump();
      return PlayerStateId.JUMPING;
    }

    if (input.horizontalAxis !== 0) return PlayerStateId.RUNNING;

    return null;
  }
}

// ============================================================
// STATE: RUNNING
// ============================================================
export class RunningState extends PlayerState {
  readonly id = PlayerStateId.RUNNING;

  update(ctx: IPlayerContext, _dt: number): PlayerStateId | null {
    const { input, body } = ctx;

    if (!body.isGrounded && body.coyoteTimer <= 0) return PlayerStateId.FALLING;

    if (shouldJump(ctx)) {
      ctx.onJump();
      return PlayerStateId.JUMPING;
    }

    if (input.horizontalAxis === 0) return PlayerStateId.IDLE;

    return null;
  }
}

// ============================================================
// STATE: JUMPING
// ============================================================
export class JumpingState extends PlayerState {
  readonly id = PlayerStateId.JUMPING;

  enter(ctx: IPlayerContext): void {
    ctx.body.velocity.y  = ctx.stats.jumpForce;
    ctx.body.isGrounded  = false;
    ctx.body.coyoteTimer = 0;
    ctx.body.jumpBufferTimer = 0;
  }

  update(ctx: IPlayerContext, _dt: number): PlayerStateId | null {
    const { input, body } = ctx;

    // Variable-height jump: release early to jump lower (Celeste-style)
    if (
      (input.isReleased('jump') || input.isReleased('jumpAlt')) &&
      body.velocity.y < 0
    ) {
      body.velocity.y *= JUMP_CUT_FACTOR;
    }

    // TODO: DOUBLE_JUMP — check ability here before falling

    if (body.velocity.y >= 0) return PlayerStateId.FALLING;

    return null;
  }
}

// ============================================================
// STATE: FALLING
// ============================================================
export class FallingState extends PlayerState {
  readonly id = PlayerStateId.FALLING;

  update(ctx: IPlayerContext, _dt: number): PlayerStateId | null {
    const { body, input } = ctx;

    // Buffer a jump press so it registers if pressed slightly before landing
    if (input.isPressed('jump') || input.isPressed('jumpAlt')) {
      body.jumpBufferTimer = JUMP_BUFFER_TIME;
    }

    if (body.isGrounded) {
      return input.horizontalAxis !== 0 ? PlayerStateId.RUNNING : PlayerStateId.IDLE;
    }

    // TODO: DOUBLE_JUMP — check ability & extra jump count here

    return null;
  }
}

// ---- Shared helper ----
function shouldJump(ctx: IPlayerContext): boolean {
  const jumpPressed = ctx.input.isPressed('jump') || ctx.input.isPressed('jumpAlt');
  const canJump     = ctx.body.isGrounded || ctx.body.coyoteTimer > 0;
  const buffered    = ctx.body.jumpBufferTimer > 0;
  return (jumpPressed || buffered) && canJump;
}

export { PlayerState }