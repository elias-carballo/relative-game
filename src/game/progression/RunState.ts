// ============================================================
// RUN STATE
// A serializable snapshot of everything meaningful about the
// current run. Passed to dynamic areas (Connectors) so they
// can adapt difficulty, enemy count, and reward density.
//
// Stored in-memory during a run; persisted to Supabase at
// run-end for analytics and cross-session meta-progression.
//
// TODO: Persist full run history to Supabase.
// TODO: Use run stats to drive a procedural difficulty curve.
// TODO: Expand performanceRating into a multi-axis score
//       (speed, deaths, currency, objectives).
// TODO: Run modifiers (e.g., "elite night" — enemies harder,
//       rewards better) generated from run history.
// ============================================================

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface ObjectiveRecord {
  id:        string;
  completed: boolean;
  optional:  boolean;
}

export interface RunState {
  runNumber:         number;
  areasVisited:      string[];        // area IDs visited this run
  enemiesKilled:     number;
  deaths:            number;
  currencyCollected: number;
  objectives:        ObjectiveRecord[];
  interactions:      string[];        // NPC / object interaction IDs
  elapsedSeconds:    number;

  // Influence fields — used by ConnectorArea to adjust content
  difficultyLevel:   DifficultyLevel;
  difficultyMod:     number;  // 0.5–2.0 multiplier applied to enemy stats
  rewardMod:         number;  // 0.5–2.0 multiplier applied to drop rates
  enemyCountMod:     number;  // 0.5–2.0 multiplier on base enemy spawn count

  // Last run summary — shown in camp HUD
  lastRunSummary:    string;

  // TODO: layoutVariantSeed — use to select connector layout variations
  // TODO: modifiers: RunModifier[] — active run modifiers (buffs/debuffs)
}

export function createInitialRunState(): RunState {
  return {
    runNumber:         1,
    areasVisited:      [],
    enemiesKilled:     0,
    deaths:            0,
    currencyCollected: 0,
    objectives:        [],
    interactions:      [],
    elapsedSeconds:    0,
    difficultyLevel:   'normal',
    difficultyMod:     1.0,
    rewardMod:         1.0,
    enemyCountMod:     1.0,
    lastRunSummary:    'No previous run.',
  };
}
