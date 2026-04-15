// ============================================================
// PLAYER
// Concrete player entity. Wires together:
//   - CharacterDefinition (stats, color)
//   - Rigidbody (physics state)
//   - StateMachine (state-based behaviour)
//   - AbilitySystem (unlockable abilities)
//   - MovementController (horizontal velocity application)
//   - InputProfile (keybindings for this player)
//
// Multiple Player instances can coexist — no singleton assumptions.
// TODO: Co-op sync — snapshot/apply input state from network.
// TODO: Character switch at camp node.
// TODO: Hit-stun and death state.
// TODO: Corpse recovery — drop currency at death position.
// ============================================================

import { Entity }             from '../core/Entity';
import { Rigidbody }          from '../physics/Rigidbody';
import { InputProfile }       from '../input/InputProfile';
import { CharacterDefinition } from './CharacterData';
import { StateMachine }       from './StateMachine';
import { MovementController } from './MovementController';
import { AbilitySystem }      from '../abilities/AbilitySystem';
import { JumpAbility }        from '../abilities/JumpAbility';
import { DashAbility }        from '../abilities/DashAbility';
import { DoubleJumpAbility }  from '../abilities/DoubleJumpAbility';
import {
  PlayerStateId,
  IPlayerContext,
  IdleState,
  RunningState,
  JumpingState,
  FallingState,
} from './PlayerStates';
import { PLAYER_W, PLAYER_H } from '../constants';
import { eventBus, Events }   from '../core/EventBus';

export class Player extends Entity {
  readonly playerIndex: number;

  readonly body:       Rigidbody;
  readonly abilities:  AbilitySystem;
  readonly fsm:        StateMachine;
  readonly movement:   MovementController;

  input!: InputProfile; // set by Game after construction

  health:    number;
  maxHealth: number;
  facingDir: number = 1;

  private readonly charDef: CharacterDefinition;

  constructor(x: number, y: number, charDef: CharacterDefinition, playerIndex: number) {
    super(x, y, PLAYER_W, PLAYER_H);

    this.playerIndex = playerIndex;
    this.charDef     = charDef;
    this.maxHealth   = charDef.stats.maxHealth;
    this.health      = this.maxHealth;

    // ---- Physics ----
    this.body = new Rigidbody();

    // ---- Abilities ----
    this.abilities = new AbilitySystem();
    this.abilities.register(new JumpAbility());
    this.abilities.register(new DashAbility());
    this.abilities.register(new DoubleJumpAbility());

    // ---- State machine ----
    this.fsm = new StateMachine();
    this.fsm.register(new IdleState());
    this.fsm.register(new RunningState());
    this.fsm.register(new JumpingState());
    this.fsm.register(new FallingState());

    // ---- Movement ----
    this.movement = new MovementController();
  }

  private get ctx(): IPlayerContext {
    return {
      input:     this.input,
      body:      this.body,
      stats:     this.charDef.stats,
      abilities: this.abilities,
      facingDir: this.facingDir,
      setFacing: (dir) => { this.facingDir = dir; },
      onJump:    () => { /* velocity applied by JumpingState.enter */ },
    };
  }

  init(): void {
    this.fsm.setState(PlayerStateId.IDLE, this.ctx);
  }

  update(dt: number): void {
    if (!this.active) return;

    // ---- Update abilities (cooldowns, sustained effects) ----
    this.abilities.update(dt);

    // ---- Horizontal movement ----
    this.movement.applyHorizontal(
      this.body,
      this.input,
      this.charDef.stats.speed,
      this.charDef.stats.airControl,
      this.fsm.currentId,
    );

    // ---- Update facing direction ----
    this.facingDir = this.movement.resolveFacing(this.input.horizontalAxis, this.facingDir);

    // ---- State machine ----
    this.fsm.update(this.ctx, dt);

    // TODO: ActionSystem.update(dt) — process active combat actions
    // TODO: Check for fall-off-world → trigger death
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Simple rectangle render — replace with sprite sheets later
    ctx.fillStyle = this.charDef.color;
    ctx.fillRect(
      Math.round(this.position.x),
      Math.round(this.position.y),
      this.width,
      this.height,
    );

    // Facing indicator — small triangle on front edge
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const tx = this.facingDir === 1
      ? this.right - 4
      : this.left + 4;
    ctx.beginPath();
    ctx.arc(tx, this.cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Health bar above player
    this.renderHealthBar(ctx);
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D): void {
    const barW  = this.width;
    const barH  = 4;
    const barX  = Math.round(this.position.x);
    const barY  = Math.round(this.position.y) - 8;
    const ratio = this.health / this.maxHealth;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(barX, barY, Math.round(barW * ratio), barH);
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.active = false;
    // TODO: trigger death state in FSM
    // TODO: corpse recovery — record position in RunState
    eventBus.emit(Events.PLAYER_DIED, { playerIndex: this.playerIndex });
  }

  respawn(x: number, y: number): void {
    this.position.set(x, y);
    this.body.velocity.set(0, 0);
    this.body.isGrounded = false;
    this.health = this.maxHealth;
    this.active = true;
    this.init();
  }

  get stats() {
    return this.charDef.stats;
  }
}
