// ============================================================
// GAME
// Root class. Owns all systems and drives the main loop.
//
// Lifecycle:
//   new Game(canvas) → game.init() → [loop starts automatically]
//   game.destroy()   → cleans up event listeners + loop
//
// System ownership:
//   InputManager → PhysicsEngine → World → Players
//   → EnemyManager → CollectibleManager → Renderer
//
// TODO: Add loading state for async asset loading.
// TODO: Co-op sync entry point — tick from server snapshot instead
//       of local requestAnimationFrame.
// TODO: Pause menu with ability viewer and controls reference.
// TODO: Supabase integration for run history and meta-progression.
// ============================================================

import { GameState }          from './GameState';
import { InputManager }       from './input/InputManager';
import { PhysicsEngine }      from './physics/PhysicsEngine';
import { Camera }             from './core/Camera';
import { Player }             from './player/Player';
import { EnemyManager }       from './enemy/EnemyManager';
import { CollectibleManager } from './collectibles/CollectibleManager';
import { ResourceManager }    from './resources/ResourceManager';
import { RunProgression }     from './progression/RunProgression';
import { World }              from './world/World';
import { CampNode }           from './world/areas/CampNode';
import { ForestConnector }    from './world/areas/ForestConnector';
import { Renderer }           from './renderer/Renderer';
import { eventBus, Events }   from './core/EventBus';
import { CHARACTERS, DEFAULT_CHARACTER_ID } from './player/CharacterData';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_DELTA } from './constants';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private rafId:   number = 0;
  private lastTime: number = 0;

  // ---- State ----
  private gameState: GameState = GameState.MENU;

  // ---- Systems ----
  private input:        InputManager;
  private physics:      PhysicsEngine;
  private camera:       Camera;
  private resources:    ResourceManager;
  private progression:  RunProgression;
  private world:        World;
  private renderer:     Renderer;

  // ---- Per-area managers (reset on area transition) ----
  private enemyManager:      EnemyManager;
  private collectibleManager: CollectibleManager;

  // ---- Entities ----
  private players: Player[] = [];

  constructor(canvas: HTMLCanvasElement) {
    canvas.width  = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    this.ctx = ctx;

    // ---- Instantiate systems ----
    this.input       = new InputManager();
    this.physics     = new PhysicsEngine();
    this.camera      = new Camera();
    this.resources   = new ResourceManager();
    this.progression = new RunProgression();
    this.world       = new World();
    this.renderer    = new Renderer(this.ctx, this.camera);

    this.enemyManager      = new EnemyManager(this.physics);
    this.collectibleManager = new CollectibleManager();
  }

  init(): void {
    // ---- Input ----
    this.input.init();

    // ---- Register areas ----
    this.world.registerArea(new CampNode());
    this.world.registerArea(new ForestConnector());

    // ---- Listen for start input to transition from menu ----
    this.listenForMenuStart();

    // ---- Event subscriptions ----
    eventBus.on(Events.PLAYER_DIED, () => this.handlePlayerDeath());

    // ---- Start the loop ----
    this.lastTime = performance.now();
    this.rafId    = requestAnimationFrame(this.loop.bind(this));
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    this.input.destroy();
    eventBus.clear();
  }

  // ============================================================
  // MAIN LOOP
  // ============================================================

  private loop(timestamp: number): void {
    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, MAX_DELTA);

    switch (this.gameState) {
      case GameState.MENU:
        this.updateMenu();
        this.renderer.renderMenu(this.ctx);
        break;

      case GameState.PLAYING:
        this.update(dt);
        this.render();
        break;

      case GameState.PAUSED:
        this.updatePause();
        this.render();
        this.renderer.renderPause(this.ctx);
        break;
    }

    this.input.flush();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  // ============================================================
  // MENU
  // ============================================================

  private listenForMenuStart(): void {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        window.removeEventListener('keydown', handler);
        this.startGame();
      }
    };
    window.addEventListener('keydown', handler);
  }

  private updateMenu(): void {
    // Menu is static; input handled by listenForMenuStart
  }

  // ============================================================
  // START / RESTART
  // ============================================================

  private startGame(): void {
    this.gameState = GameState.PLAYING;
    this.progression.startNewRun();
    this.loadArea('camp');
  }

  private loadArea(areaId: string): void {
    const runState = this.progression.getState();
    const area     = this.world.transitionTo(areaId, runState);
    if (!area) return;

    this.progression.recordAreaVisited(areaId);

    // ---- Reset per-area systems ----
    this.enemyManager.clear();
    this.collectibleManager.clear();
    this.physics.clear();

    // ---- Spawn / reset players ----
    if (this.players.length === 0) {
      this.spawnPlayers(area.spawnX, area.spawnY);
    } else {
      for (const player of this.players) {
        player.respawn(area.spawnX, area.spawnY);
        this.physics.register(player, player.body);
      }
    }

    // ---- If connector, load dynamic spawn ----
    const ForestConnector = this.world.getArea('forest_connector');
    if (areaId !== 'camp' && ForestConnector && 'getSpawn' in ForestConnector) {
      const spawn = (ForestConnector as import('./world/areas/ForestConnector').ForestConnector).getSpawn();
      for (const enemy of spawn.enemies) {
        this.enemyManager.add(enemy);
      }
      for (const collectible of spawn.collectibles) {
        this.collectibleManager.add(collectible);
      }
    }

    // ---- Camera bounds ----
    this.camera.setBounds(0, 0, area.width, area.height);

    // Snap camera immediately on first load
    if (this.players.length > 0) {
      for (let i = 0; i < 30; i++) {
        this.camera.follow(this.players[0], 1);
      }
    }
  }

  private spawnPlayers(x: number, y: number): void {
    // Spawn player 1 (always)
    const charDef = CHARACTERS[DEFAULT_CHARACTER_ID];
    const p1      = new Player(x, y, charDef, 0);
    const profile = this.input.getProfile(0);
    if (!profile) throw new Error('No input profile for player 0');
    p1.input = profile;
    p1.init();
    this.players.push(p1);
    this.physics.register(p1, p1.body);

    // TODO: Spawn player 2 when co-op mode is active
    // const p2 = new Player(x + 40, y, CHARACTERS['rogue'], 1);
    // p2.input = this.input.getProfile(1)!;
    // p2.init();
    // this.players.push(p2);
    // this.physics.register(p2, p2.body);
  }

  // ============================================================
  // UPDATE
  // ============================================================

  private update(dt: number): void {
    const profile = this.input.getProfile(0);

    // ---- Pause ----
    if (profile?.isPressed('pause')) {
      this.gameState = GameState.PAUSED;
      return;
    }

    // ---- Track run time ----
    this.progression.addTime(dt);

    // ---- Update players ----
    for (const player of this.players) {
      player.update(dt);
    }

    // ---- Physics ----
    this.physics.update(dt, this.world.getPlatformRects());

    // ---- Enemies ----
    this.enemyManager.update(dt, this.players);

    // ---- Collectibles ----
    this.collectibleManager.update(dt, this.players, {
      addCurrency: (amount) => {
        this.resources.addCurrency(amount);
        this.progression.recordCurrencyCollected(amount);
      },
    });

    // ---- Camera ----
    if (this.players.length > 0) {
      this.camera.follow(this.players[0], dt);
    }

    // ---- Check area transitions ----
    const exitTarget = this.world.checkExitTriggers(this.players);
    if (exitTarget) {
      this.loadArea(exitTarget);
    }
  }

  // ============================================================
  // PAUSE
  // ============================================================

  private updatePause(): void {
    const profile = this.input.getProfile(0);
    if (profile?.isPressed('pause')) {
      this.gameState = GameState.PLAYING;
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  private render(): void {
    const area = this.world.getCurrentArea();
    if (!area) return;

    this.renderer.renderFrame(
      area,
      this.players,
      this.enemyManager,
      this.collectibleManager,
      this.resources,
      this.progression.getState(),
    );
  }

  // ============================================================
  // EVENTS
  // ============================================================

  private handlePlayerDeath(): void {
    this.progression.recordDeath();
    this.resources.applyDeathPenalty(0.5);

    // Brief delay then return to camp
    setTimeout(() => {
      this.progression.startNewRun();
      this.loadArea('camp');
    }, 1200);
  }
}
