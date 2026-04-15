// ============================================================
// CHARACTER DATA
// Defines the stat profiles and ability loadouts for each
// playable character archetype. New characters are added here
// without touching movement or combat code.
//
// TODO: Add archetype-specific passive abilities.
// TODO: Unlock additional characters via run progression.
// TODO: Per-character skill tree nodes (speed, jump, damage, etc.).
// ============================================================

export interface CharacterStats {
  speed:          number; // horizontal run speed (px/s)
  jumpForce:      number; // initial vertical velocity on jump
  airControl:     number; // fraction of ground speed while airborne (0–1)
  maxHealth:      number;
  maxMana:        number;  // TODO: mana / resource system
}

export type AbilitySlot = 'jump' | 'dash' | 'doubleJump' | 'wallClimb' | 'wallJump';

export interface CharacterDefinition {
  id:              string;
  displayName:     string;
  color:           string; // debug render tint
  stats:           CharacterStats;
  startingAbilities: AbilitySlot[];
  // TODO: uniquePassive: string (passive ability key)
  // TODO: characterArchetype: 'knight' | 'mage' | 'rogue' etc.
}

// ---- Character roster ----
export const CHARACTERS: Record<string, CharacterDefinition> = {
  knight: {
    id:          'knight',
    displayName: 'Knight',
    color:       '#4a9eff',
    stats: {
      speed:      220,
      jumpForce: -580,
      airControl: 0.85,
      maxHealth:  100,
      maxMana:    50,
    },
    startingAbilities: ['jump'],
    // TODO: unique passive — shield block on parry
  },

  rogue: {
    id:          'rogue',
    displayName: 'Rogue',
    color:       '#22c55e',
    stats: {
      speed:      260,       // faster than knight
      jumpForce: -550,
      airControl: 0.92,      // more air control
      maxHealth:  75,        // squishier
      maxMana:    30,
    },
    startingAbilities: ['jump'],
    // TODO: unique passive — dash does not cost resource
  },

  // TODO: Add mage, ranger, and additional archetypes here
};

export const DEFAULT_CHARACTER_ID = 'knight';
