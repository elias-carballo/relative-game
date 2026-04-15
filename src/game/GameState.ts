// ============================================================
// GAME STATE
// Top-level application states driving which systems are active.
// ============================================================

export enum GameState {
  MENU    = 'menu',
  PLAYING = 'playing',
  PAUSED  = 'paused',
  // TODO: Add GAME_OVER, CUTSCENE, LOADING, etc.
}
