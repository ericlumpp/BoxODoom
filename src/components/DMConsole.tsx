import React, { useState } from 'react';
import { Character, RollConfig, RollMode, RollType, Ability } from '../types';
import { SKILLS, ABILITIES, calculateModifier, getAbilityModifier } from '../data/dnd5eData';
import { demonAudio } from '../services/demonAudio';
import {
  Skull,
  Dices,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  User,
  Shield,
  Zap,
  HeartPulse,
  Sparkles,
  Settings,
  Plus,
  Minus,
  Sliders,
} from 'lucide-react';

interface DMConsoleProps {
  characters: Character[];
  selectedCharacterId: string;
  onSelectCharacter: (id: string) => void;
  onAddCharacter: (character: Character) => void;
  onTriggerRoll: (config: RollConfig) => void;
  isRolling: boolean;
}

export const DMConsole: React.FC<DMConsoleProps> = ({
  characters,
  selectedCharacterId,
  onSelectCharacter,
  onAddCharacter,
  onTriggerRoll,
  isRolling,
}) => {
  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId) || characters[0];

  // DM State
  const [activeTab, setActiveTab] = useState<RollType>('skill');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('stealth');
  const [selectedAbility, setSelectedAbility] = useState<Ability>('WIS');
  const [selectedSaveAbility, setSelectedSaveAbility] = useState<Ability>('DEX');
  const [rollMode, setRollMode] = useState<RollMode>('normal');
  const [dc, setDc] = useState<number>(18);
  const [isDCHiddenToPlayers, setIsDCHiddenToPlayers] = useState<boolean>(true); // user request: plays only see what is rolled and if they passed/failed
  const [situationalMod, setSituationalMod] = useState<number>(0);
  const [customStakes, setCustomStakes] = useState<string>('Save against the Archfiend’s petrification gaze!');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(demonAudio.isSoundMuted());
  const [volume, setVolume] = useState<number>(demonAudio.getVolume());
  const [customAudioUrl, setCustomAudioUrl] = useState<string>(demonAudio.getCustomUrl());
  const [showAudioSettings, setShowAudioSettings] = useState<boolean>(false);
  const [showNewCharModal, setShowNewCharModal] = useState<boolean>(false);

  // New character draft state
  const [newCharName, setNewCharName] = useState('');
  const [newCharPlayer, setNewCharPlayer] = useState('');
  const [newCharClass, setNewCharClass] = useState('Level 5 Adventurer');

  // Compute calculated modifier for preview
  const currentModifier = React.useMemo(() => {
    if (!selectedCharacter) return 0;
    if (activeTab === 'skill') {
      return calculateModifier(selectedCharacter, 'skill', selectedSkillId);
    }
    if (activeTab === 'ability') {
      return calculateModifier(selectedCharacter, 'ability', selectedAbility);
    }
    if (activeTab === 'save') {
      return calculateModifier(selectedCharacter, 'save', selectedSaveAbility);
    }
    return 0; // Death save has no base mod
  }, [selectedCharacter, activeTab, selectedSkillId, selectedAbility, selectedSaveAbility]);

  const netModifier = currentModifier + situationalMod;

  const handleRoll = () => {
    if (isRolling) return;
    const config: RollConfig = {
      characterId: selectedCharacter.id,
      rollType: activeTab,
      skillId: activeTab === 'skill' ? selectedSkillId : undefined,
      ability: activeTab === 'ability' ? selectedAbility : activeTab === 'save' ? selectedSaveAbility : undefined,
      rollMode,
      dc,
      isDCHiddenToPlayers,
      situationalModifier: situationalMod,
      customStakes: customStakes.trim() || undefined,
    };
    onTriggerRoll(config);
  };

  const handleTestAudio = () => {
    demonAudio.playDemonLaugh();
  };

  const handleToggleMute = () => {
    const muted = demonAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    demonAudio.setVolume(val);
  };

  const handleApplyAudioUrl = () => {
    demonAudio.setCustomUrl(customAudioUrl);
    demonAudio.playDemonLaugh();
  };

  const handleCreateQuickCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: newCharName.trim(),
      playerName: newCharPlayer.trim() || 'Player',
      classTitle: newCharClass.trim() || 'Adventurer',
      level: 6,
      portrait: `https://images.unsplash.com/photo-${1534447677768 + Math.floor(Math.random() * 5000)}?auto=format&fit=crop&w=200&h=200&q=80`,
      stats: { STR: 14, DEX: 14, CON: 14, INT: 12, WIS: 14, CHA: 12 },
      proficiencies: ['perception', 'stealth', 'athletics'],
      saveProficiencies: ['DEX', 'CON'],
    };
    onAddCharacter(newChar);
    onSelectCharacter(newChar.id);
    setNewCharName('');
    setNewCharPlayer('');
    setShowNewCharModal(false);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-6 text-neutral-100">
      {/* Console Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-500 shadow-md shadow-red-950/50">
            <Skull className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-lg text-neutral-100 flex items-center gap-2">
              DM Box of Doom Suite
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-sans tracking-wide">
                Foundry VTT v12
              </span>
            </h2>
            <p className="text-xs text-neutral-400">Master control console: select player, check, DC & roll parameters</p>
          </div>
        </div>

        {/* Audio controls toolbar */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={handleTestAudio}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 font-medium transition cursor-pointer"
            title="Preview Demon Laugh Voice"
          >
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>Test Laugh</span>
          </button>

          <button
            onClick={handleToggleMute}
            type="button"
            className="p-1 rounded text-neutral-400 hover:text-white transition"
            title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
          </button>

          <button
            onClick={() => setShowAudioSettings(!showAudioSettings)}
            type="button"
            className={`p-1 rounded transition ${showAudioSettings ? 'text-amber-400 bg-neutral-800' : 'text-neutral-400 hover:text-white'}`}
            title="Sound Settings & Voice Link"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Audio Settings / Voice Sound Link Manager */}
      {showAudioSettings && (
        <div className="p-3.5 bg-neutral-950 rounded-xl border border-red-900/40 text-xs flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-red-400" />
              Demon Voice & Audio Settings
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              [DEMON LAUGH AUDIO LINK]
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-neutral-400 text-[11px]">Demon Laugh Audio URL (MP3/OGG/WAV):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAudioUrl}
                onChange={(e) => setCustomAudioUrl(e.target.value)}
                placeholder="https://.../demon-laugh.mp3"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-red-500 font-mono"
              />
              <button
                type="button"
                onClick={handleApplyAudioUrl}
                className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white font-medium text-xs transition"
              >
                Apply & Test
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 italic">
              Code hook in <code>src/services/demonAudio.ts</code> is marked with <code>// [DEMON LAUGH AUDIO LINK]</code>.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-neutral-400 text-[11px]">Volume: {Math.round(volume * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-red-600 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 1. CHARACTER SELECTOR WITH PORTRAIT & NAME */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            1. Player Character (Name & Portrait Icon)
          </label>
          <button
            type="button"
            onClick={() => setShowNewCharModal(true)}
            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 underline underline-offset-2 transition"
          >
            <Plus className="w-3 h-3" /> Add Character
          </button>
        </div>

        {/* Character Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {characters.map((char) => {
            const isSelected = char.id === selectedCharacter.id;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => onSelectCharacter(char.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-red-950/70 border-red-600 ring-2 ring-red-500/40 shadow-lg shadow-red-950/60'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40'
                }`}
              >
                {/* Small portrait icon */}
                <div className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-neutral-700/80 bg-neutral-900 shadow">
                  <img
                    src={char.portrait}
                    alt={char.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback avatar
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=100&h=100&q=80';
                    }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none" />
                  )}
                </div>

                {/* Character Name & Class */}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-neutral-100 truncate flex items-center gap-1">
                    {char.name}
                  </div>
                  <div className="text-[10px] text-amber-400/90 truncate font-mono">
                    {char.playerName ? `[${char.playerName}] ` : ''}
                    {char.classTitle.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-neutral-400 truncate">
                    Level {char.level}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ROLL CATEGORY & DETAILS (Skills, Ability Checks, Saving Throws) */}
      <div className="flex flex-col gap-3">
        <label className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
          <Dices className="w-3.5 h-3.5 text-amber-400" />
          2. Pick Roll Category: Skills, Ability Checks, or Saving Throw
        </label>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('skill')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg transition text-center ${
              activeTab === 'skill'
                ? 'bg-red-700 text-white shadow-md shadow-red-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            Skills (18)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ability')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg transition text-center ${
              activeTab === 'ability'
                ? 'bg-red-700 text-white shadow-md shadow-red-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            Ability Checks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('save')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg transition text-center ${
              activeTab === 'save'
                ? 'bg-red-700 text-white shadow-md shadow-red-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            Saving Throw
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('death_save')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg transition text-center flex items-center justify-center gap-1 ${
              activeTab === 'death_save'
                ? 'bg-red-900 text-white shadow-md shadow-red-950 border border-red-500'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-red-400" />
            Death Save
          </button>
        </div>

        {/* Category Pickers */}
        <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
          {/* TAB 1: SKILLS */}
          {activeTab === 'skill' && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-neutral-400 font-medium">Select D&D 5e / Foundry Skill:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {SKILLS.map((skill) => {
                  const isSelected = selectedSkillId === skill.id;
                  const mod = calculateModifier(selectedCharacter, 'skill', skill.id);
                  const isProf = selectedCharacter.proficiencies.includes(skill.id);
                  const isExp = selectedCharacter.expertises?.includes(skill.id);

                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => setSelectedSkillId(skill.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between text-xs transition ${
                        isSelected
                          ? 'bg-red-900/60 border-red-500 text-white font-semibold'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="truncate flex items-center gap-1">
                        <span className="truncate">{skill.name}</span>
                        {isExp && <span className="text-[9px] text-amber-400 font-bold">★</span>}
                        {!isExp && isProf && <span className="text-[9px] text-emerald-400">●</span>}
                      </div>
                      <span className="font-mono text-[11px] text-amber-300 ml-1">
                        {mod >= 0 ? `+${mod}` : mod}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ABILITY CHECKS */}
          {activeTab === 'ability' && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-neutral-400 font-medium">Select Ability Check:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {ABILITIES.map((ab) => {
                  const isSelected = selectedAbility === ab.id;
                  const score = selectedCharacter.stats[ab.id];
                  const mod = getAbilityModifier(score);

                  return (
                    <button
                      key={ab.id}
                      type="button"
                      onClick={() => setSelectedAbility(ab.id)}
                      className={`p-2 rounded-xl border text-center transition ${
                        isSelected
                          ? 'bg-red-900/60 border-red-500 text-white ring-1 ring-red-400'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{ab.short}</div>
                      <div className="font-mono text-sm font-extrabold text-amber-300">
                        {mod >= 0 ? `+${mod}` : mod}
                      </div>
                      <div className="text-[10px] text-neutral-400">Score: {score}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SAVING THROWS */}
          {activeTab === 'save' && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-neutral-400 font-medium">Select Saving Throw Ability:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {ABILITIES.map((ab) => {
                  const isSelected = selectedSaveAbility === ab.id;
                  const mod = calculateModifier(selectedCharacter, 'save', ab.id);
                  const isProf = selectedCharacter.saveProficiencies.includes(ab.id);

                  return (
                    <button
                      key={ab.id}
                      type="button"
                      onClick={() => setSelectedSaveAbility(ab.id)}
                      className={`p-2 rounded-xl border text-center transition ${
                        isSelected
                          ? 'bg-red-900/60 border-red-500 text-white ring-1 ring-red-400'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3 text-red-400" />
                        {ab.short} Save
                      </div>
                      <div className="font-mono text-sm font-extrabold text-amber-300">
                        {mod >= 0 ? `+${mod}` : mod}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {isProf ? (
                          <span className="text-emerald-400 font-medium">Proficient</span>
                        ) : (
                          'Normal'
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DEATH SAVES */}
          {activeTab === 'death_save' && (
            <div className="p-2 flex items-center justify-between">
              <div>
                <h4 className="font-cinzel font-bold text-sm text-red-300">Death Saving Throw</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  DC is 10. Nat 20 restores 1 HP. Nat 1 causes 2 failures. No modifiers added.
                </p>
              </div>
              <div className="px-3 py-1 rounded bg-red-950 border border-red-700 text-xs font-mono text-red-200">
                Modifier: +0 | Base DC: 10
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. ROLL MODE (Normal / Advantage / Disadvantage) */}
      <div className="flex flex-col gap-2">
        <label className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-200">
          3. Roll Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRollMode('normal')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
              rollMode === 'normal'
                ? 'bg-neutral-800 border-neutral-500 text-white shadow'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Normal (1d20)
          </button>
          <button
            type="button"
            onClick={() => setRollMode('advantage')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
              rollMode === 'advantage'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Advantage (Take Highest)
          </button>
          <button
            type="button"
            onClick={() => setRollMode('disadvantage')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
              rollMode === 'disadvantage'
                ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-lg shadow-purple-950/40 ring-1 ring-purple-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-purple-400" />
            Disadvantage (Take Lowest)
          </button>
        </div>
      </div>

      {/* 4. DIFFICULTY CLASS (DC) & DC VISIBILITY CONTROL */}
      {/* Specifically answers user request:
          "Provide a spot for a DC to be visible so the plays only see what is rolled and if they passed/failed where the DM should be able to see the entire module." */}
      <div className="p-4 bg-neutral-950 rounded-xl border-2 border-red-900/60 shadow-inner flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-200">
              4. Target DC (Difficulty Class)
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              [Pass if Total ≥ DC]
            </span>
          </div>

          {/* SPOT FOR DC VISIBILITY TOGGLE (Core User Requirement!) */}
          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-lg border border-neutral-700">
            <button
              type="button"
              onClick={() => setIsDCHiddenToPlayers(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                isDCHiddenToPlayers
                  ? 'bg-red-800 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Players only see their roll total and Pass/Fail (DC is hidden from them)"
            >
              <EyeOff className="w-3 h-3 text-red-300" />
              <span>Hide DC from Players</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDCHiddenToPlayers(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                !isDCHiddenToPlayers
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Show target DC clearly on player screen"
            >
              <Eye className="w-3 h-3 text-amber-300" />
              <span>Make DC Visible</span>
            </button>
          </div>
        </div>

        {/* DC Numeric Controls & Presets */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-900 rounded-lg border border-neutral-700 px-2 py-1">
            <button
              type="button"
              onClick={() => setDc((prev) => Math.max(1, prev - 1))}
              className="p-1 hover:bg-neutral-800 text-neutral-300 rounded"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              min="1"
              max="40"
              value={dc}
              onChange={(e) => setDc(parseInt(e.target.value) || 10)}
              className="w-14 text-center font-cinzel font-black text-xl text-amber-300 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setDc((prev) => Math.min(40, prev + 1))}
              className="p-1 hover:bg-neutral-800 text-neutral-300 rounded"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { label: 'Easy (10)', val: 10 },
              { label: 'Medium (15)', val: 15 },
              { label: 'Hard (20)', val: 20 },
              { label: 'Extreme (25)', val: 25 },
              { label: 'Impossible (30)', val: 30 },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => setDc(preset.val)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition border ${
                  dc === preset.val
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Explanatory note confirming user requirement */}
        <div className="text-[11px] text-neutral-400 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/80 flex items-center justify-between">
          <span>
            {isDCHiddenToPlayers ? (
              <strong className="text-red-300">
                🔒 Player View: DC {dc} is HIDDEN. Players will ONLY see what is rolled and if they PASSED or FAILED.
              </strong>
            ) : (
              <strong className="text-amber-300">
                👁️ Player View: DC {dc} is VISIBLE on their Box of Doom screen.
              </strong>
            )}
          </span>
          <span className="text-[10px] text-neutral-500 hidden sm:inline">(DM Console always sees complete module)</span>
        </div>
      </div>

      {/* 5. SITUATIONAL MODIFIER & HIGH-STAKES STORY NOTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Situational Modifier (Bless, Bardic, Cover):</span>
            <span className="font-mono text-amber-400 font-bold">
              Total Mod: {netModifier >= 0 ? `+${netModifier}` : netModifier}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSituationalMod((prev) => prev - 1)}
              className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg hover:bg-neutral-800 text-neutral-300"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              value={situationalMod}
              onChange={(e) => setSituationalMod(parseInt(e.target.value) || 0)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 px-3 text-center font-mono font-bold text-neutral-100 text-sm focus:outline-none focus:border-red-500"
            />
            <button
              type="button"
              onClick={() => setSituationalMod((prev) => prev + 1)}
              className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg hover:bg-neutral-800 text-neutral-300"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSituationalMod(0)}
              className="px-2.5 py-1.5 text-xs text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-lg hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-neutral-400">High Stakes Prompt / Flavor Note:</label>
          <input
            type="text"
            value={customStakes}
            onChange={(e) => setCustomStakes(e.target.value)}
            placeholder="e.g. Brennan: If you fail, the ritual portal implodes!"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-neutral-200 focus:outline-none focus:border-red-500 placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* 6. BIG CALL-TO-ACTION: "ROLL IN THE BOX OF DOOM" */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleRoll}
          disabled={isRolling}
          className={`w-full py-4 px-6 rounded-2xl font-cinzel font-black text-lg tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer ${
            isRolling
              ? 'bg-red-950/70 border border-red-800 text-red-400 animate-pulse cursor-not-allowed'
              : 'bg-gradient-to-r from-red-800 via-red-600 to-red-800 hover:from-red-700 hover:via-red-500 hover:to-red-700 text-white shadow-xl shadow-red-900/60 border border-red-400 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          <Skull className={`w-6 h-6 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'THE DEMON LAUGHS... ROLLING...' : 'ROLL IN THE BOX OF DOOM'}</span>
          <Dices className="w-6 h-6" />
        </button>

        <p className="text-center text-[11px] text-neutral-500 mt-2">
          Plays Demonic Laugh sound, rolls 3D D20 into the Box of Doom, and broadcasts outcome to players!
        </p>
      </div>

      {/* Quick Add Character Modal */}
      {showNewCharModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateQuickCharacter}
            className="bg-neutral-900 border border-red-900/60 p-5 rounded-2xl max-w-sm w-full flex flex-col gap-4 shadow-2xl"
          >
            <h3 className="font-cinzel font-bold text-amber-200 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              Add Foundry Character
            </h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Character Name</label>
              <input
                type="text"
                required
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                placeholder="e.g. Kristen Applebees"
                className="bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Player Name</label>
              <input
                type="text"
                value={newCharPlayer}
                onChange={(e) => setNewCharPlayer(e.target.value)}
                placeholder="e.g. Ally Beardsley"
                className="bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Class & Level</label>
              <input
                type="text"
                value={newCharClass}
                onChange={(e) => setNewCharClass(e.target.value)}
                placeholder="e.g. Cleric of Twilight 8"
                className="bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewCharModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-red-700 hover:bg-red-600 text-white rounded-lg"
              >
                Create Character
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
