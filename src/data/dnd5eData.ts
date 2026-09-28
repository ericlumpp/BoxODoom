import { Ability, SkillDefinition, Character } from '../types';

export const ABILITIES: { id: Ability; name: string; short: string; description: string }[] = [
  { id: 'STR', name: 'Strength', short: 'STR', description: 'Athletics, raw muscular power' },
  { id: 'DEX', name: 'Dexterity', short: 'DEX', description: 'Agility, stealth, acrobatics, reflexes' },
  { id: 'CON', name: 'Constitution', short: 'CON', description: 'Endurance, stamina, poison resistance' },
  { id: 'INT', name: 'Intelligence', short: 'INT', description: 'Arcana, history, investigation, knowledge' },
  { id: 'WIS', name: 'Wisdom', short: 'WIS', description: 'Perception, insight, medicine, survival' },
  { id: 'CHA', name: 'Charisma', short: 'CHA', description: 'Persuasion, deception, intimidation, presence' },
];

export const SKILLS: SkillDefinition[] = [
  { id: 'athletics', name: 'Athletics', ability: 'STR', iconName: 'Dumbbell' },
  { id: 'acrobatics', name: 'Acrobatics', ability: 'DEX', iconName: 'Activity' },
  { id: 'sleight_of_hand', name: 'Sleight of Hand', ability: 'DEX', iconName: 'Hand' },
  { id: 'stealth', name: 'Stealth', ability: 'DEX', iconName: 'Footprints' },
  { id: 'arcana', name: 'Arcana', ability: 'INT', iconName: 'Sparkles' },
  { id: 'history', name: 'History', ability: 'INT', iconName: 'BookOpen' },
  { id: 'investigation', name: 'Investigation', ability: 'INT', iconName: 'Search' },
  { id: 'nature', name: 'Nature', ability: 'INT', iconName: 'Leaf' },
  { id: 'religion', name: 'Religion', ability: 'INT', iconName: 'Sun' },
  { id: 'animal_handling', name: 'Animal Handling', ability: 'WIS', iconName: 'HeartHandshake' },
  { id: 'insight', name: 'Insight', ability: 'WIS', iconName: 'Eye' },
  { id: 'medicine', name: 'Medicine', ability: 'WIS', iconName: 'Cross' },
  { id: 'perception', name: 'Perception', ability: 'WIS', iconName: 'ScanEye' },
  { id: 'survival', name: 'Survival', ability: 'WIS', iconName: 'Compass' },
  { id: 'deception', name: 'Deception', ability: 'CHA', iconName: 'Masks' },
  { id: 'intimidation', name: 'Intimidation', ability: 'CHA', iconName: 'Flame' },
  { id: 'performance', name: 'Performance', ability: 'CHA', iconName: 'Music' },
  { id: 'persuasion', name: 'Persuasion', ability: 'CHA', iconName: 'MessageSquare' },
];

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'char-1',
    name: 'Malakor Nightbreeze',
    playerName: 'Brennan',
    classTitle: 'Tiefling Fiend Warlock 8',
    level: 8,
    portrait: '/images/avatars/tiefling_warlock.jpg',
    stats: {
      STR: 10,
      DEX: 14,
      CON: 14,
      INT: 12,
      WIS: 12,
      CHA: 19,
    },
    proficiencies: ['arcana', 'deception', 'intimidation', 'investigation'],
    expertises: ['deception'],
    saveProficiencies: ['WIS', 'CHA'],
  },
  {
    id: 'char-2',
    name: 'Lady Aurelia Valen',
    playerName: 'Aabria',
    classTitle: 'High Elf Oath of Devotion Paladin 8',
    level: 8,
    portrait: '/images/avatars/elf_paladin.jpg',
    stats: {
      STR: 18,
      DEX: 10,
      CON: 16,
      INT: 10,
      WIS: 12,
      CHA: 16,
    },
    proficiencies: ['athletics', 'insight', 'persuasion', 'religion'],
    saveProficiencies: ['WIS', 'CHA'],
  },
  {
    id: 'char-3',
    name: 'Torvald Deepforge',
    playerName: 'Lou',
    classTitle: 'Mountain Dwarf Berserker Barbarian 8',
    level: 8,
    portrait: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&h=200&q=80',
    stats: {
      STR: 20,
      DEX: 14,
      CON: 18,
      INT: 8,
      WIS: 12,
      CHA: 8,
    },
    proficiencies: ['athletics', 'intimidation', 'perception', 'survival'],
    saveProficiencies: ['STR', 'CON'],
  },
  {
    id: 'char-4',
    name: 'Vesper Shadowstep',
    playerName: 'Emily',
    classTitle: 'Half-Elf Arcane Trickster Rogue 8',
    level: 8,
    portrait: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=200&h=200&q=80',
    stats: {
      STR: 8,
      DEX: 19,
      CON: 12,
      INT: 14,
      WIS: 13,
      CHA: 14,
    },
    proficiencies: ['acrobatics', 'deception', 'insight', 'investigation', 'perception', 'sleight_of_hand', 'stealth'],
    expertises: ['stealth', 'sleight_of_hand'],
    saveProficiencies: ['DEX', 'INT'],
  },
];

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(1 + level / 4);
}

export function calculateModifier(character: Character, rollType: string, id?: string): number {
  const profBonus = getProficiencyBonus(character.level);

  if (rollType === 'death_save') {
    return 0;
  }

  if (rollType === 'ability' && id) {
    const ability = id as Ability;
    return getAbilityModifier(character.stats[ability] || 10);
  }

  if (rollType === 'save' && id) {
    const ability = id as Ability;
    const baseMod = getAbilityModifier(character.stats[ability] || 10);
    const isProf = character.saveProficiencies.includes(ability);
    return baseMod + (isProf ? profBonus : 0);
  }

  if (rollType === 'skill' && id) {
    const skill = SKILLS.find((s) => s.id === id);
    if (!skill) return 0;
    const baseMod = getAbilityModifier(character.stats[skill.ability] || 10);
    const isProf = character.proficiencies.includes(id);
    const isExpertise = character.expertises?.includes(id);
    if (isExpertise) return baseMod + profBonus * 2;
    if (isProf) return baseMod + profBonus;
    return baseMod;
  }

  return 0;
}
