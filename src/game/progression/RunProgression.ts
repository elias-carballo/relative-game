// ============================================================
// RUN PROGRESSION
// Processes a completed run's RunState to derive modifiers for
// the next run. Called when the player returns to the camp node.
//
// Currently implements a simple heuristic:
//   - Died a lot → next run is slightly easier
//   - Killed many enemies → next run has slightly more
//   - Collected lots of currency → next run has better rewards
//
// TODO: Replace heuristics with a full scoring system.
// TODO: Persist run state to Supabase with run number + timestamp.
// TODO: Unlock run modifiers (e.g., "Elite Night") after N runs.
// TODO: Co-op run state merge — average across all players.
// TODO: Run-based skill tree unlock (permanent upgrades).
// ============================================================

import { RunState, DifficultyLevel, createInitialRunState } from './RunState';

export class RunProgression {
  private current: RunState = createInitialRunState();

  getState(): RunState {
    return this.current;
  }

  startNewRun(): void {
    const prev = this.current;
    this.current = createInitialRunState();
    this.current.runNumber      = prev.runNumber + 1;
    this.current.lastRunSummary = this.buildSummary(prev);

    // ---- Carry forward derived modifiers ----
    this.current.difficultyMod  = this.calcDifficultyMod(prev);
    this.current.rewardMod      = this.calcRewardMod(prev);
    this.current.enemyCountMod  = this.calcEnemyCountMod(prev);
    this.current.difficultyLevel = this.calcDifficultyLevel(this.current.difficultyMod);

    console.log(`[RunProgression] Run ${this.current.runNumber} started.`, {
      difficultyMod:  this.current.difficultyMod,
      rewardMod:      this.current.rewardMod,
      enemyCountMod:  this.current.enemyCountMod,
    });
  }

  // ---- Tracking helpers (called during gameplay) ----

  recordAreaVisited(areaId: string): void {
    if (!this.current.areasVisited.includes(areaId)) {
      this.current.areasVisited.push(areaId);
    }
  }

  recordEnemyKilled(): void {
    this.current.enemiesKilled++;
  }

  recordDeath(): void {
    this.current.deaths++;
  }

  recordCurrencyCollected(amount: number): void {
    this.current.currencyCollected += amount;
  }

  recordInteraction(id: string): void {
    if (!this.current.interactions.includes(id)) {
      this.current.interactions.push(id);
    }
  }

  addTime(dt: number): void {
    this.current.elapsedSeconds += dt;
  }

  // ---- Private helpers ----

  private calcDifficultyMod(prev: RunState): number {
    // Died multiple times → slightly easier next run
    const deathPenalty = Math.min(prev.deaths * 0.05, 0.3);
    return Math.max(0.5, Math.min(2.0, 1.0 - deathPenalty + 0.1 * prev.enemiesKilled / 10));
  }

  private calcRewardMod(prev: RunState): number {
    const killBonus = Math.min(prev.enemiesKilled * 0.02, 0.4);
    return Math.max(0.5, Math.min(2.0, 1.0 + killBonus));
  }

  private calcEnemyCountMod(prev: RunState): number {
    // Breezy run → bump enemy count slightly
    const deathFactor = Math.max(0, 1 - prev.deaths * 0.1);
    return Math.max(0.5, Math.min(2.0, 1.0 + deathFactor * 0.2));
  }

  private calcDifficultyLevel(mod: number): DifficultyLevel {
    if (mod < 0.75) return 'easy';
    if (mod > 1.25) return 'hard';
    return 'normal';
  }

  private buildSummary(prev: RunState): string {
    const min  = Math.floor(prev.elapsedSeconds / 60);
    const sec  = Math.floor(prev.elapsedSeconds % 60);
    return `Run #${prev.runNumber}: ${prev.enemiesKilled} kills, ` +
           `${prev.deaths} deaths, ${prev.currencyCollected} currency ` +
           `(${min}m ${sec}s)`;
  }
}
