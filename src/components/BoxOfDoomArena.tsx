import React, { useEffect, useState, useRef } from 'react';
import { RollResult, RollMode } from '../types';
import { demonAudio } from '../services/demonAudio';
import confetti from 'canvas-confetti';
import { Skull, Flame, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

interface BoxOfDoomArenaProps {
  currentRoll: RollResult | null;
  isRolling: boolean;
  rollMode: RollMode;
  isPlayerView?: boolean;
  onRollComplete?: () => void;
}

export const BoxOfDoomArena: React.FC<BoxOfDoomArenaProps> = ({
  currentRoll,
  isRolling,
  rollMode,
  isPlayerView = false,
  onRollComplete,
}) => {
  const [stage, setStage] = useState<'idle' | 'suspense' | 'rolling' | 'settling' | 'revealed'>('idle');
  const [animatedDie1, setAnimatedDie1] = useState<number>(20);
  const [animatedDie2, setAnimatedDie2] = useState<number>(1);
  const [rotation1, setRotation1] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const [rotation2, setRotation2] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRolling && currentRoll) {
      setStage('suspense');

      // 1. Dramatic buildup heartbeat
      demonAudio.playHeartbeat();

      const suspenseTimer = setTimeout(() => {
        setStage('rolling');
        // PLAY DEMONIC LAUGH WHEN DIE ROLLS!
        demonAudio.playDemonLaugh();
        demonAudio.playDiceClatter();

        const rollStartTime = Date.now();
        const duration = 2200; // 2.2 seconds roll animation

        const animateDice = () => {
          const elapsed = Date.now() - rollStartTime;
          const progress = Math.min(1, elapsed / duration);

          // Fast random tumble
          if (progress < 0.8) {
            setAnimatedDie1(Math.floor(Math.random() * 20) + 1);
            setAnimatedDie2(Math.floor(Math.random() * 20) + 1);
            setRotation1({
              x: Math.random() * 720,
              y: Math.random() * 720,
              z: Math.random() * 360,
            });
            setRotation2({
              x: Math.random() * 720,
              y: Math.random() * 720,
              z: Math.random() * 360,
            });
          } else {
            // Settling into final roll
            setStage('settling');
            setAnimatedDie1(currentRoll.dieRolls[0]);
            if (currentRoll.dieRolls[1] !== undefined) {
              setAnimatedDie2(currentRoll.dieRolls[1]);
            }
          }

          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animateDice);
          } else {
            // Fully revealed
            setStage('revealed');
            setAnimatedDie1(currentRoll.dieRolls[0]);
            if (currentRoll.dieRolls[1] !== undefined) {
              setAnimatedDie2(currentRoll.dieRolls[1]);
            }

            if (currentRoll.isPassed) {
              demonAudio.playSuccessFanfare(currentRoll.isCritSuccess);
              confetti({
                particleCount: currentRoll.isCritSuccess ? 120 : 60,
                spread: 70,
                origin: { y: 0.6 },
                colors: currentRoll.isCritSuccess ? ['#eab308', '#f59e0b', '#ef4444', '#ffffff'] : ['#22c55e', '#10b981', '#3b82f6'],
              });
            } else {
              demonAudio.playFailureGong(currentRoll.isCritFail);
            }

            if (onRollComplete) {
              onRollComplete();
            }
          }
        };

        animationFrameRef.current = requestAnimationFrame(animateDice);
      }, 700);

      return () => {
        clearTimeout(suspenseTimer);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    } else if (!isRolling && currentRoll) {
      setStage('revealed');
      setAnimatedDie1(currentRoll.dieRolls[0]);
      if (currentRoll.dieRolls[1] !== undefined) {
        setAnimatedDie2(currentRoll.dieRolls[1]);
      }
    }
  }, [isRolling, currentRoll]);

  const hasTwoDice = (currentRoll?.config.rollMode || rollMode) !== 'normal';
  const showDC = !isPlayerView || !currentRoll?.config.isDCHiddenToPlayers;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-red-900/80 bg-neutral-950 shadow-2xl shadow-red-950/70 select-none">
      {/* Box of Doom Exterior Header / Arch */}
      <div className="relative z-10 px-4 py-2.5 bg-gradient-to-r from-neutral-950 via-red-950/90 to-neutral-950 border-b border-red-900/60 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="font-cinzel font-bold text-sm sm:text-base tracking-widest text-amber-200 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            The Box of Doom
          </span>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700/50">
            {stage === 'rolling' ? 'ROLLING IN HELLFIRE...' : stage === 'revealed' ? 'FATE SEALED' : 'AWAITING SACRIFICE'}
          </span>
        </div>

        {/* DC Visibility Badge on Box Header */}
        <div className="flex items-center gap-2">
          {currentRoll && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-900/90 border border-red-800/60 shadow-inner">
              {showDC ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-neutral-400">Target DC:</span>
                  <span className="text-amber-300 font-bold font-mono text-sm">{currentRoll.config.dc}</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400 font-medium tracking-wide">Target DC: Hidden</span>
                  {/* If DM view, still show what the secret DC actually is */}
                  {!isPlayerView && (
                    <span className="text-neutral-400 text-[11px] font-mono ml-1">(DM knows: {currentRoll.config.dc})</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* The Box of Doom Interior Arena */}
      <div
        className={`relative w-full h-[360px] sm:h-[420px] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
          stage === 'rolling' ? 'animate-shake' : ''
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(139, 0, 0, 0.45) 0%, rgba(10, 5, 8, 0.88) 75%), url('/images/box-of-doom-interior.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Demonic Runes and Glowing Rim Overlay */}
        <div className="absolute inset-0 pointer-events-none border-[12px] border-neutral-900/90 shadow-[inset_0_0_80px_rgba(220,38,38,0.7)]" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Ominous Floating Embers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(14)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-red-500/80 blur-[0.6px]"
              style={{
                left: `${(i * 19 + 7) % 95}%`,
                top: `${(i * 29 + 13) % 90}%`,
                animation: `float-ember ${3 + (i % 4)}s infinite ease-in`,
                animationDelay: `${(i * 0.4) % 3}s`,
              }}
            />
          ))}
        </div>

        {/* Rolling Status or Roll Stakes Banner */}
        {currentRoll?.config.customStakes && (
          <div className="absolute top-4 z-20 max-w-[90%] px-4 py-1.5 rounded-lg bg-neutral-950/85 border border-red-800/60 backdrop-blur-sm text-center shadow-lg">
            <span className="text-xs sm:text-sm font-cinzel text-amber-300 italic tracking-wide">
              ⚔️ {currentRoll.config.customStakes}
            </span>
          </div>
        )}

        {/* Center Arena: 3D D20 Dice Tray */}
        <div className="relative z-10 flex items-center justify-center gap-6 sm:gap-12 my-auto">
          {stage === 'idle' && !currentRoll && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-red-950/40 border-2 border-red-700/50 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse">
                <Flame className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="font-cinzel font-bold text-lg text-amber-200">The Box of Doom Awaits</h3>
              <p className="text-xs text-neutral-400 max-w-xs mt-1">
                Configure character, roll type, advantage, and DC in the DM console, then cast the die into the doom box.
              </p>
            </div>
          )}

          {/* Die 1 */}
          {(stage !== 'idle' || currentRoll) && (
            <div className="flex flex-col items-center">
              <div
                className={`relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center transition-transform duration-200 perspective-1000 ${
                  stage === 'rolling' ? 'scale-110 drop-shadow-[0_0_35px_rgba(239,68,68,0.9)]' : 'scale-100'
                }`}
                style={{
                  transform:
                    stage === 'rolling'
                      ? `rotateX(${rotation1.x}deg) rotateY(${rotation1.y}deg) rotateZ(${rotation1.z}deg)`
                      : 'none',
                }}
              >
                {/* D20 Polyhedron Visual Graphic */}
                <svg
                  viewBox="0 0 100 100"
                  className={`w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                    hasTwoDice && currentRoll && currentRoll.chosenDieIndex !== 0 && stage === 'revealed'
                      ? 'opacity-35 grayscale brightness-50'
                      : 'opacity-100'
                  }`}
                >
                  <defs>
                    <linearGradient id="d20-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7f1d1d" />
                      <stop offset="50%" stopColor="#450a0a" />
                      <stop offset="100%" stopColor="#1c0a0a" />
                    </linearGradient>
                    <radialGradient id="d20-glow-1" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Outer D20 Hexagon Base */}
                  <polygon
                    points="50,5 92,28 92,72 50,95 8,72 8,28"
                    fill="url(#d20-grad-1)"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                  />
                  {/* Facet lines */}
                  <polygon points="50,5 50,45 8,28" fill="#991b1b" fillOpacity="0.4" stroke="#ef4444" strokeWidth="1" />
                  <polygon points="50,5 92,28 50,45" fill="#7f1d1d" fillOpacity="0.5" stroke="#ef4444" strokeWidth="1" />
                  <polygon points="8,28 50,45 25,80" fill="#450a0a" fillOpacity="0.6" stroke="#b91c1c" strokeWidth="1" />
                  <polygon points="92,28 75,80 50,45" fill="#450a0a" fillOpacity="0.6" stroke="#b91c1c" strokeWidth="1" />
                  <polygon points="50,45 25,80 50,95 75,80" fill="#2d0606" fillOpacity="0.8" stroke="#ef4444" strokeWidth="1.2" />

                  {/* Center glowing triangle where the number rests */}
                  <polygon
                    points="50,22 75,68 25,68"
                    fill="rgba(20, 5, 5, 0.85)"
                    stroke="#f87171"
                    strokeWidth="1.8"
                  />
                </svg>

                {/* Animated Die Face Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`font-cinzel font-black text-3xl sm:text-4xl transition-all duration-150 ${
                      animatedDie1 === 20
                        ? 'text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,1)] scale-110'
                        : animatedDie1 === 1
                        ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]'
                        : 'text-neutral-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {animatedDie1}
                  </span>
                </div>

                {/* Discarded X badge on unused advantage/disadvantage die */}
                {hasTwoDice && currentRoll && currentRoll.chosenDieIndex !== 0 && stage === 'revealed' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-2 py-0.5 rounded bg-black/80 text-neutral-400 font-mono text-xs uppercase border border-neutral-700">
                      Discarded
                    </span>
                  </div>
                )}
              </div>

              {hasTwoDice && (
                <span className="mt-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Die #1 {hasTwoDice && currentRoll?.chosenDieIndex === 0 && stage === 'revealed' ? '(Kept)' : ''}
                </span>
              )}
            </div>
          )}

          {/* Die 2 (For Advantage / Disadvantage) */}
          {hasTwoDice && (stage !== 'idle' || currentRoll) && (
            <div className="flex flex-col items-center">
              <div
                className={`relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center transition-transform duration-200 perspective-1000 ${
                  stage === 'rolling' ? 'scale-110 drop-shadow-[0_0_35px_rgba(239,68,68,0.9)]' : 'scale-100'
                }`}
                style={{
                  transform:
                    stage === 'rolling'
                      ? `rotateX(${rotation2.x}deg) rotateY(${rotation2.y}deg) rotateZ(${rotation2.z}deg)`
                      : 'none',
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className={`w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                    currentRoll && currentRoll.chosenDieIndex !== 1 && stage === 'revealed'
                      ? 'opacity-35 grayscale brightness-50'
                      : 'opacity-100'
                  }`}
                >
                  <defs>
                    <linearGradient id="d20-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#581c87" />
                      <stop offset="50%" stopColor="#3b0764" />
                      <stop offset="100%" stopColor="#150522" />
                    </linearGradient>
                  </defs>

                  <polygon
                    points="50,5 92,28 92,72 50,95 8,72 8,28"
                    fill="url(#d20-grad-2)"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                  />
                  <polygon points="50,5 50,45 8,28" fill="#7e22ce" fillOpacity="0.4" stroke="#c084fc" strokeWidth="1" />
                  <polygon points="50,5 92,28 50,45" fill="#6b21a8" fillOpacity="0.5" stroke="#c084fc" strokeWidth="1" />
                  <polygon points="8,28 50,45 25,80" fill="#3b0764" fillOpacity="0.6" stroke="#9333ea" strokeWidth="1" />
                  <polygon points="92,28 75,80 50,45" fill="#3b0764" fillOpacity="0.6" stroke="#9333ea" strokeWidth="1" />
                  <polygon points="50,45 25,80 50,95 75,80" fill="#1e0533" fillOpacity="0.8" stroke="#c084fc" strokeWidth="1.2" />

                  <polygon
                    points="50,22 75,68 25,68"
                    fill="rgba(20, 5, 30, 0.85)"
                    stroke="#d8b4fe"
                    strokeWidth="1.8"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`font-cinzel font-black text-3xl sm:text-4xl transition-all duration-150 ${
                      animatedDie2 === 20
                        ? 'text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,1)] scale-110'
                        : animatedDie2 === 1
                        ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]'
                        : 'text-neutral-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {animatedDie2}
                  </span>
                </div>

                {currentRoll && currentRoll.chosenDieIndex !== 1 && stage === 'revealed' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-2 py-0.5 rounded bg-black/80 text-neutral-400 font-mono text-xs uppercase border border-neutral-700">
                      Discarded
                    </span>
                  </div>
                )}
              </div>

              <span className="mt-2 text-xs font-mono uppercase tracking-wider text-purple-300">
                Die #2 {currentRoll?.chosenDieIndex === 1 && stage === 'revealed' ? '(Kept)' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Dramatic Result Reveal Banner */}
        {stage === 'revealed' && currentRoll && (
          <div className="absolute bottom-3 inset-x-4 z-20 flex flex-col items-center justify-center animate-fade-in">
            {/* The Pass/Fail Doom Banner */}
            <div
              className={`w-full max-w-lg px-4 py-2.5 rounded-xl border-2 flex items-center justify-between backdrop-blur-md shadow-2xl transition-all duration-500 ${
                currentRoll.isPassed
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-emerald-950/80'
                  : 'bg-red-950/95 border-red-600 text-red-100 shadow-red-950/90'
              }`}
            >
              {/* Left Side: Roll Math or Pure Score */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentRoll.isPassed ? 'bg-emerald-800/60' : 'bg-red-800/60'
                  }`}
                >
                  {currentRoll.isPassed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-300" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel font-bold text-lg leading-tight">
                      {currentRoll.isCritSuccess
                        ? 'CRITICAL SUCCESS!'
                        : currentRoll.isCritFail
                        ? 'CRITICAL FAILURE!'
                        : currentRoll.isPassed
                        ? 'PASSED'
                        : 'FAILED'}
                    </span>
                  </div>

                  {/* SPOT FOR DC:
                      If DM hid DC: Only show Roll Total and Pass/Fail (as requested)!
                      If DC is visible: Show DC vs Total! */}
                  <div className="text-xs text-neutral-300 font-mono flex items-center gap-2 mt-0.5">
                    <span>
                      Rolled: <strong className="text-white text-sm">{currentRoll.totalScore}</strong>
                    </span>
                    <span className="text-neutral-400">
                      ({currentRoll.dieRolls[currentRoll.chosenDieIndex]} {currentRoll.totalModifier >= 0 ? `+ ${currentRoll.totalModifier}` : `- ${Math.abs(currentRoll.totalModifier)}`})
                    </span>

                    {showDC && (
                      <span className="border-l border-neutral-600 pl-2 text-amber-300 font-bold">
                        vs DC {currentRoll.config.dc}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Pass/Fail status badge */}
              <div className="text-right">
                <div
                  className={`px-3 py-1 rounded font-cinzel font-extrabold text-sm sm:text-base tracking-wider uppercase ${
                    currentRoll.isPassed
                      ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-red-700 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                  }`}
                >
                  {currentRoll.isPassed ? 'SUCCESS' : 'FAILURE'}
                </div>
                {/* Notice badge if DC is hidden from players */}
                {isPlayerView && currentRoll.config.isDCHiddenToPlayers && (
                  <span className="text-[10px] text-neutral-400 italic block mt-0.5">
                    Target DC unknown
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
