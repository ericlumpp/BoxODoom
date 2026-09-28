import { useState } from 'react';
import { Character, RollConfig, RollResult } from './types';
import { DEFAULT_CHARACTERS, calculateModifier } from './data/dnd5eData';
import { DMConsole } from './components/DMConsole';
import { BoxOfDoomArena } from './components/BoxOfDoomArena';
import { PlayerView } from './components/PlayerView';
import { FoundryModuleExporter } from './components/FoundryModuleExporter';
import { ClientPreviewModal } from './components/ClientPreviewModal';
import { demonAudio } from './services/demonAudio';
import {
  Skull,
  Split,
  User,
  Monitor,
  FileCode,
  Sparkles,
  Volume2,
  VolumeX,
  History,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Camera,
} from 'lucide-react';

export function App() {
  const [characters, setCharacters] = useState<Character[]>(DEFAULT_CHARACTERS);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(DEFAULT_CHARACTERS[0].id);
  const [currentRoll, setCurrentRoll] = useState<RollResult | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'dm' | 'player' | 'foundry_code'>('split');
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(demonAudio.isSoundMuted());
  const [showClientPreview, setShowClientPreview] = useState<boolean>(false);

  const selectedCharacter =
    characters.find((c) => c.id === selectedCharacterId) || characters[0];

  const handleAddCharacter = (newChar: Character) => {
    setCharacters((prev) => [newChar, ...prev]);
  };

  const executeRoll = (config: RollConfig, presetRolls?: number[]) => {
    const char = characters.find((c) => c.id === config.characterId) || selectedCharacter;
    let label = '';
    let baseMod = 0;

    if (config.rollType === 'skill' && config.skillId) {
      label = `${config.skillId.replace(/_/g, ' ')} Check`;
      baseMod = calculateModifier(char, 'skill', config.skillId);
    } else if (config.rollType === 'ability' && config.ability) {
      label = `${config.ability} Ability Check`;
      baseMod = calculateModifier(char, 'ability', config.ability);
    } else if (config.rollType === 'save' && config.ability) {
      label = `${config.ability} Saving Throw`;
      baseMod = calculateModifier(char, 'save', config.ability);
    } else if (config.rollType === 'death_save') {
      label = 'Death Saving Throw';
      baseMod = 0;
    }

    // Determine dice rolls (1 or 2 dice for Advantage/Disadvantage)
    let die1 = Math.floor(Math.random() * 20) + 1;
    let die2 = Math.floor(Math.random() * 20) + 1;

    if (presetRolls && presetRolls.length > 0) {
      die1 = presetRolls[0];
      if (presetRolls[1] !== undefined) die2 = presetRolls[1];
    }

    const rolls = config.rollMode === 'normal' ? [die1] : [die1, die2];
    let chosenIndex = 0;

    if (config.rollMode === 'advantage') {
      chosenIndex = die1 >= die2 ? 0 : 1;
    } else if (config.rollMode === 'disadvantage') {
      chosenIndex = die1 <= die2 ? 0 : 1;
    }

    const chosenDie = rolls[chosenIndex];
    const totalModifier = baseMod + config.situationalModifier;
    const totalScore = chosenDie + totalModifier;
    const isPassed = totalScore >= config.dc;
    const isCritSuccess = chosenDie === 20;
    const isCritFail = chosenDie === 1;

    const newResult: RollResult = {
      id: `roll-${Date.now()}`,
      timestamp: Date.now(),
      character: char,
      config,
      rollLabel: label,
      dieRolls: rolls,
      chosenDieIndex: chosenIndex,
      baseModifier: baseMod,
      situationalModifier: config.situationalModifier,
      totalModifier,
      totalScore,
      isPassed,
      isCritSuccess,
      isCritFail,
    };

    setIsRolling(true);
    setCurrentRoll(newResult);

    setTimeout(() => {
      setIsRolling(false);
      setRollHistory((prev) => [newResult, ...prev.slice(0, 19)]);
    }, 2800);
  };

  const handleRunClientDemo = (demoType: 'nat20' | 'nat1' | 'hidden_pass' | 'hidden_fail' | 'advantage') => {
    switch (demoType) {
      case 'nat20': {
        const char = characters[0]; // Brennan / Malakor
        setSelectedCharacterId(char.id);
        executeRoll(
          {
            characterId: char.id,
            rollType: 'skill',
            skillId: 'arcana',
            rollMode: 'advantage',
            dc: 20,
            isDCHiddenToPlayers: false,
            situationalModifier: 2,
            customStakes: 'The rift of Dis begins to swallow the party! Natural 20 saves everyone!',
          },
          [20, 14]
        );
        break;
      }
      case 'nat1': {
        const char = characters[2]; // Torvald
        setSelectedCharacterId(char.id);
        executeRoll(
          {
            characterId: char.id,
            rollType: 'death_save',
            rollMode: 'normal',
            dc: 10,
            isDCHiddenToPlayers: true,
            situationalModifier: 0,
            customStakes: 'Death saving throw on the precipice of oblivion!',
          },
          [1]
        );
        break;
      }
      case 'hidden_pass': {
        const char = characters[1]; // Aurelia Paladin
        setSelectedCharacterId(char.id);
        executeRoll(
          {
            characterId: char.id,
            rollType: 'save',
            ability: 'CHA',
            rollMode: 'normal',
            dc: 19,
            isDCHiddenToPlayers: true, // Specifically tests hidden DC!
            situationalModifier: 0,
            customStakes: 'Save vs Demon Prince Mind Drain (DC 19 Hidden from player)',
          },
          [16]
        );
        break;
      }
      case 'hidden_fail': {
        const char = characters[3]; // Vesper Rogue
        setSelectedCharacterId(char.id);
        executeRoll(
          {
            characterId: char.id,
            rollType: 'skill',
            skillId: 'stealth',
            rollMode: 'normal',
            dc: 23,
            isDCHiddenToPlayers: true, // Specifically tests hidden DC!
            situationalModifier: 0,
            customStakes: 'Stealthing through the Throne Room of Dis (DC 23 Hidden)',
          },
          [11]
        );
        break;
      }
      case 'advantage': {
        const char = characters[0];
        setSelectedCharacterId(char.id);
        executeRoll(
          {
            characterId: char.id,
            rollType: 'skill',
            skillId: 'intimidation',
            rollMode: 'advantage',
            dc: 16,
            isDCHiddenToPlayers: false,
            situationalModifier: 0,
            customStakes: 'Brennan rolls with Advantage in the Box of Doom!',
          },
          [17, 8]
        );
        break;
      }
    }
  };

  const handleToggleMute = () => {
    const muted = demonAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-red-950/80 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 to-red-950 border border-red-500/80 flex items-center justify-center shadow-lg shadow-red-950/80">
              <Skull className="w-6 h-6 text-neutral-100 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel font-black text-lg sm:text-xl tracking-wider text-amber-200 uppercase">
                  Box of Doom
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700/50">
                  Foundry VTT Mod
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                Tabletop RPG High-Stakes Dice Roller with Demonic Audio & Secret DC
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-red-800 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Dual Screen: Compare DM Console and Player Screen Side-by-Side"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dual View (DM + Player)</span>
              <span className="sm:hidden">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                viewMode === 'dm'
                  ? 'bg-red-800 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="DM Console Only"
            >
              <User className="w-3.5 h-3.5" />
              <span>DM Only</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('player')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                viewMode === 'player'
                  ? 'bg-red-800 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Player Screen / Stream Overlay"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Player View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('foundry_code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                viewMode === 'foundry_code'
                  ? 'bg-amber-700 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Foundry VTT Module Code & Download Zip"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Foundry Files (.zip)</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Client Preview Showcase Reel */}
            <button
              type="button"
              onClick={() => setShowClientPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-xs uppercase tracking-wider transition shadow-md shadow-amber-950/40 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Client Showcase Reel</span>
              <span className="sm:hidden">Preview</span>
            </button>

            {/* Mute button */}
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition cursor-pointer"
              title={isMuted ? 'Unmute Demonic Sound' : 'Mute Demonic Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Banner showcasing core prompt fulfillment */}
        <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-950/60 via-neutral-900 to-red-950/60 border border-red-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>Box of Doom Active:</strong> DM picks Skills/Abilities/Saves, Advantage/Disadvantage, Player portrait token, and DC visibility.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRunClientDemo('nat20')}
              className="text-amber-300 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Try Nat 20 Demo
            </button>
            <span className="text-neutral-600">•</span>
            <button
              type="button"
              onClick={() => handleRunClientDemo('hidden_pass')}
              className="text-red-300 hover:underline flex items-center gap-1"
            >
              <Skull className="w-3 h-3 text-red-400" />
              Try Hidden DC Demo
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: DUAL SPLIT VIEW (Recommended for Client Demo) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6 columns: DM Master Console */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-400" />
                  DM Master Console (Full Module View)
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  DM sees entire module & DC
                </span>
              </div>
              <DMConsole
                characters={characters}
                selectedCharacterId={selectedCharacterId}
                onSelectCharacter={setSelectedCharacterId}
                onAddCharacter={handleAddCharacter}
                onTriggerRoll={executeRoll}
                isRolling={isRolling}
              />
            </div>

            {/* Right 6 columns: Box of Doom Visual Arena & Player Screen */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-red-400" />
                  Player View & Stream Overlay
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {currentRoll?.config.isDCHiddenToPlayers
                    ? '🔒 DC Hidden from Players (Pass/Fail Only)'
                    : '👁️ DC Visible to Players'}
                </span>
              </div>

              {/* Player Screen & Box of Doom Arena (Player view respects hidden DC setting) */}
              <PlayerView currentRoll={currentRoll} isRolling={isRolling} />
            </div>
          </div>
        )}

        {/* VIEW MODE 2: DM CONSOLE ONLY */}
        {viewMode === 'dm' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            <DMConsole
              characters={characters}
              selectedCharacterId={selectedCharacterId}
              onSelectCharacter={setSelectedCharacterId}
              onAddCharacter={handleAddCharacter}
              onTriggerRoll={executeRoll}
              isRolling={isRolling}
            />
            {currentRoll && (
              <div className="flex flex-col gap-2">
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300">
                  Box of Doom Roll Result:
                </span>
                <BoxOfDoomArena
                  currentRoll={currentRoll}
                  isRolling={isRolling}
                  rollMode={currentRoll.config.rollMode}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE 3: PLAYER SCREEN ONLY */}
        {viewMode === 'player' && (
          <div className="max-w-3xl mx-auto w-full">
            <PlayerView currentRoll={currentRoll} isRolling={isRolling} />
          </div>
        )}

        {/* VIEW MODE 4: FOUNDRY VTT MODULE FILES & EXPORT */}
        {viewMode === 'foundry_code' && (
          <div className="max-w-5xl mx-auto w-full">
            <FoundryModuleExporter />
          </div>
        )}

        {/* Past Roll History Section */}
        {rollHistory.length > 0 && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-neutral-400" />
                <h3 className="font-cinzel font-bold text-sm text-neutral-200 uppercase tracking-wider">
                  Box of Doom Roll History ({rollHistory.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRollHistory([])}
                className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear History
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {rollHistory.map((roll) => (
                <div
                  key={roll.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    roll.isPassed
                      ? 'bg-emerald-950/30 border-emerald-800/50'
                      : 'bg-red-950/30 border-red-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={roll.character.portrait}
                      alt={roll.character.name}
                      className="w-9 h-9 rounded-lg object-cover border border-neutral-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-neutral-200 truncate">{roll.character.name}</div>
                      <div className="text-[11px] text-neutral-400 truncate">{roll.rollLabel}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-sm text-neutral-100">
                      Roll: {roll.totalScore}
                    </div>
                    <div className="flex items-center justify-end gap-1 font-bold text-[10px]">
                      {roll.isPassed ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> PASSED
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-0.5">
                          <XCircle className="w-3 h-3" /> FAILED
                        </span>
                      )}
                      <span className="text-neutral-500 font-mono">
                        (DC {roll.config.dc})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950/80 px-4 py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Foundry VTT Dimension 20 Box of Doom Module • Compatible with v10, v11 & v12</span>
          <span className="text-amber-500/80 font-mono">
            Demonic voice sound anchor: <code>// [DEMON LAUGH AUDIO LINK]</code>
          </span>
        </div>
      </footer>

      {/* Client Preview Showcase Modal */}
      <ClientPreviewModal
        isOpen={showClientPreview}
        onClose={() => setShowClientPreview(false)}
        onRunDemo={handleRunClientDemo}
      />
    </div>
  );
}

export default App;
