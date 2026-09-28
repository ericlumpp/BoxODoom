export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export type RollType = 'skill' | 'ability' | 'save' | 'death_save';

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface SkillDefinition {
  id: string;
  name: string;
  ability: Ability;
  iconName: string;
}

export interface Character {
  id: string;
  name: string;
  playerName?: string;
  classTitle: string;
  level: number;
  portrait: string;
  stats: Record<Ability, number>; // Ability scores e.g. 18 (+4)
  proficiencies: string[]; // skill ids character is proficient in
  expertises?: string[]; // skill ids with expertise (double prof)
  saveProficiencies: Ability[]; // abilities proficient in saves
}

export interface RollConfig {
  characterId: string;
  rollType: RollType;
  skillId?: string;
  ability?: Ability;
  rollMode: RollMode;
  dc: number;
  isDCHiddenToPlayers: boolean; // When true, players only see what was rolled + Pass/Fail (no DC visible)
  situationalModifier: number;
  customStakes?: string;
}

export interface RollResult {
  id: string;
  timestamp: number;
  character: Character;
  config: RollConfig;
  rollLabel: string;
  dieRolls: number[]; // [d20_1, d20_2]
  chosenDieIndex: number;
  baseModifier: number;
  situationalModifier: number;
  totalModifier: number;
  totalScore: number;
  isPassed: boolean;
  isCritSuccess: boolean;
  isCritFail: boolean;
}
