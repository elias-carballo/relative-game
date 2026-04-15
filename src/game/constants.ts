// ============================================================
// GAME CONSTANTS
// Central place for all tunable game values.
// ============================================================

export const CANVAS_WIDTH  = 800;
export const CANVAS_HEIGHT = 480;

// Physics
export const GRAVITY          = 1400;   // px/s²
export const MAX_FALL_SPEED   = 900;    // px/s (terminal velocity)
export const JUMP_FORCE       = -580;   // px/s (negative = upward)
export const JUMP_CUT_FACTOR  = 0.45;   // multiplied to vy when jump is released early
export const JUMP_BUFFER_TIME = 0.1;    // seconds of jump-press grace before grounding
export const COYOTE_TIME      = 0.1;    // seconds of airtime before losing grounded jump

// Movement
export const PLAYER_SPEED       = 220;  // px/s horizontal run speed
export const AIR_CONTROL_FACTOR = 0.85; // multiplied to horizontal speed in air

// Tile / grid reference (used for world layout)
export const TILE = 32;

// Default player size
export const PLAYER_W = 28;
export const PLAYER_H = 40;

// Enemy defaults
export const ENEMY_W = 30;
export const ENEMY_H = 38;

// Collectible defaults
export const COLLECTIBLE_SIZE = 16;

// Game loop
export const TARGET_FPS = 60;
export const MAX_DELTA   = 1 / 20; // clamp dt to prevent spiral-of-death

// Run progression defaults
export const BASE_ENEMY_COUNT    = 2;
export const BASE_CURRENCY_DROPS = 3;
