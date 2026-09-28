import React from 'react';
import { RollResult } from '../types';
import { BoxOfDoomArena } from './BoxOfDoomArena';
import { Skull, Shield, Sparkles, CheckCircle2, XCircle, EyeOff, Eye } from 'lucide-react';

interface PlayerViewProps {
  currentRoll: RollResult | null;
  isRolling: boolean;
}

export const PlayerView: React.FC<PlayerViewProps> = ({ currentRoll, isRolling }) => {
  if (!currentRoll && !isRolling) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[460px]">
        <div className="w-20 h-20 rounded-full bg-red-950/40 border border-red-800/60 flex items-center justify-center mb-4 text-red-500 animate-pulse">
          <Skull className="w-10 h-10" />
        </div>
        <h3 className="font-cinzel font-bold text-xl text-amber-200">The Box of Doom</h3>
        <p className="text-neutral-400 text-sm max-w-sm mt-1">
          Waiting for the Dungeon Master to cast the die into the doom tray...
        </p>
        <span className="text-[11px] text-neutral-500 font-mono mt-4 px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">
          Player Screen & Stream Overlay Sync Active
        </span>
      </div>
    );
  }

  const char = currentRoll?.character;
  const isDCHidden = currentRoll?.config.isDCHiddenToPlayers ?? true;

  return (
    <div className="bg-neutral-950 border-2 border-red-900/60 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-neutral-100 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: Character with small portrait Icon, Name, and Roll Type */}
      {char && (
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl shadow-lg">
          {/* Character name and small portrait icon */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-red-700/80 shadow-md shrink-0 bg-neutral-800">
              <img
                src={char.portrait}
                alt={char.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/40" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel font-black text-base text-neutral-100">{char.name}</h3>
                {char.playerName && (
                  <span className="text-[10px] text-amber-400/90 font-mono">({char.playerName})</span>
                )}
              </div>
              <div className="text-xs text-neutral-400">{char.classTitle}</div>
            </div>
          </div>

          {/* Roll Type & Mode Badges */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800/80 text-xs font-bold text-amber-200 flex items-center gap-1.5 font-cinzel tracking-wider">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span>{currentRoll.rollLabel}</span>
            </div>

            {currentRoll.config.rollMode !== 'normal' && (
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                  currentRoll.config.rollMode === 'advantage'
                    ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                    : 'bg-purple-950/80 border border-purple-600 text-purple-300'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {currentRoll.config.rollMode.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* The Custom Box of Doom IMG rolling arena */}
      <BoxOfDoomArena
        currentRoll={currentRoll}
        isRolling={isRolling}
        rollMode={currentRoll?.config.rollMode || 'normal'}
        isPlayerView={true}
      />

      {/* Player Screen Status & DC Reveal Spot */}
      {currentRoll && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {/* Box 1: What was rolled */}
          <div className="p-3.5 bg-neutral-900/90 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                Total Roll
              </div>
              <div className="font-mono text-2xl font-black text-neutral-100 mt-0.5">
                {currentRoll.totalScore}
              </div>
            </div>
            <div className="text-right text-xs text-neutral-400 font-mono">
              <div>d20 ({currentRoll.dieRolls[currentRoll.chosenDieIndex]})</div>
              <div>Modifier ({currentRoll.totalModifier >= 0 ? `+${currentRoll.totalModifier}` : currentRoll.totalModifier})</div>
            </div>
          </div>

          {/* Box 2: Spot for DC & Pass/Fail */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              currentRoll.isPassed
                ? 'bg-emerald-950/50 border-emerald-700/60'
                : 'bg-red-950/50 border-red-700/60'
            }`}
          >
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1">
                {isDCHidden ? (
                  <span className="text-neutral-400 flex items-center gap-1">
                    <EyeOff className="w-3 h-3 text-red-400" />
                    Target DC: Secret
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-amber-400" />
                    Target DC: {currentRoll.config.dc}
                  </span>
                )}
              </div>

              {/* Strict player requirement: Players only see what was rolled and if they passed/failed */}
              <div className="font-cinzel text-xl font-black tracking-wide mt-0.5 flex items-center gap-1.5">
                {currentRoll.isPassed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300">PASSED</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">FAILED</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  currentRoll.isPassed ? 'bg-emerald-900/60 text-emerald-200' : 'bg-red-900/60 text-red-200'
                }`}
              >
                {currentRoll.isPassed ? 'Safe' : 'Doomed'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
