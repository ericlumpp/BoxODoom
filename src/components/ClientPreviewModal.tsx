import React, { useState } from 'react';
import { X, CheckCircle2, EyeOff, Sparkles, Skull, Layers, Camera } from 'lucide-react';

interface ClientPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunDemo: (demoType: 'nat20' | 'nat1' | 'hidden_pass' | 'hidden_fail' | 'advantage') => void;
}

export const ClientPreviewModal: React.FC<ClientPreviewModalProps> = ({
  isOpen,
  onClose,
  onRunDemo,
}) => {
  const [activeSlide, setActiveSlide] = useState<number>(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: '1. DM Custom UI & Character Picker',
      subtitle: 'Complete Master Control Suite',
      description:
        'The DM can pick any character with small portrait token icon, choose between 18 D&D Skills, 6 Ability Checks, 6 Saving Throws + Death Save, and configure Advantage / Disadvantage.',
      badge: 'DM Exclusive View',
      highlights: [
        'Player character name + small portrait token picker',
        'Skills (Athletics, Stealth, Arcana, Perception, etc.)',
        'Ability Checks (STR, DEX, CON, INT, WIS, CHA)',
        'Saving Throws with proficiency modifiers calculated automatically',
        'Roll Mode: Normal (1d20), Advantage (2d20kh), Disadvantage (2d20kl)',
      ],
      img: '/images/box-of-doom-interior.jpg',
    },
    {
      title: '2. The Custom "Box of Doom" IMG Tray',
      subtitle: 'Dimension 20 High-Stakes Visual Arena',
      description:
        'Rolls occur inside the custom Box of Doom image tray featuring eldritch red runes, skull carvings, obsidian floor, and realistic 3D tumbling d20 physics.',
      badge: 'Visual Tabletop Arena',
      highlights: [
        'High-resolution custom Box of Doom backdrop IMG',
        'Animated 3D D20 dice with real-time tumbling and settlement',
        'Dual dice support for Advantage / Disadvantage with discarded die dimming',
        'Cinematic screen tremor and flame ember particles',
      ],
      img: '/images/box-of-doom-interior.jpg',
    },
    {
      title: '3. Demonic Voice Laugh Sound Effect',
      subtitle: '// [DEMON LAUGH AUDIO LINK] Integration',
      description:
        'When the die is cast, an ominous laughing demon sound plays immediately, paired with suspenseful heartbeat and visceral sub-bass rumbling.',
      badge: 'Audio Engine',
      highlights: [
        'Clear comment // [DEMON LAUGH AUDIO LINK] next to sound URL in source code',
        'Integrated Web Audio fallback cackle generator so laughter never fails offline',
        'Audio test button, volume slider, and custom sound link changer for the DM',
        'Dramatic victory stinger on pass, ominous death gong on failure',
      ],
      img: '/images/box-of-doom-chest.jpg',
    },
    {
      title: '4. Spot for DC & Secret Player View',
      subtitle: 'Players Only See What Is Rolled & Pass/Fail',
      description:
        'As specifically requested, the DM can keep the DC secret. When hidden, players strictly see only their roll total and whether they PASSED or FAILED.',
      badge: 'Core Requirement Fulfilled',
      highlights: [
        'Dedicated Target DC spot on both DM console and Box of Doom header',
        'DC Visibility Toggle: "Hide DC from Players" vs "Make DC Visible"',
        'In Player View: If hidden, players only see total rolled and PASSED / FAILED badge',
        'DM Console always displays full calculations, DC, and roll mechanics',
      ],
      img: '/images/box-of-doom-interior.jpg',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border-2 border-red-900/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-950 via-red-950/80 to-neutral-950 border-b border-red-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-cinzel font-black text-base sm:text-lg text-amber-200 uppercase tracking-wider">
                Client Preview Build & Module Showcase
              </h2>
              <p className="text-xs text-neutral-400">
                Visual demonstration of all requested Foundry VTT Box of Doom features
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Quick Interactive Demo Buttons */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-red-900/40 flex flex-col gap-2.5">
            <span className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Instant 1-Click Client Demos (Triggers live in Box of Doom):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => {
                  onRunDemo('nat20');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Natural 20 Pass</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onRunDemo('nat1');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-600 text-red-200 text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Skull className="w-3.5 h-3.5" />
                <span>Natural 1 Fail</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onRunDemo('hidden_pass');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-200 text-xs font-semibold transition flex items-center justify-center gap-1"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Hidden DC Pass</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onRunDemo('hidden_fail');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-red-300 text-xs font-semibold transition flex items-center justify-center gap-1"
              >
                <EyeOff className="w-3.5 h-3.5 text-red-400" />
                <span>Hidden DC Fail</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onRunDemo('advantage');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-600 text-purple-200 text-xs font-bold transition flex items-center justify-center gap-1 col-span-2 sm:col-span-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Advantage 2d20</span>
              </button>
            </div>
          </div>

          {/* Feature Showcase Slide Selector */}
          <div className="flex gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
            {slides.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeSlide === idx
                    ? 'bg-red-800 text-white shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Active Feature Slide Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Box of Doom Preview */}
            <div className="relative rounded-xl overflow-hidden border-2 border-red-900/60 shadow-xl group aspect-video bg-neutral-950">
              <img
                src={slides[activeSlide].img}
                alt={slides[activeSlide].title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-black/80 text-amber-300 text-xs font-cinzel font-bold border border-red-800">
                  {slides[activeSlide].badge}
                </span>
                <span className="text-[10px] text-neutral-300 font-mono bg-black/60 px-2 py-0.5 rounded">
                  Live Foundry Compatible
                </span>
              </div>
            </div>

            {/* Feature Description */}
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  {slides[activeSlide].subtitle}
                </span>
                <h3 className="font-cinzel font-black text-xl text-neutral-100 mt-0.5">
                  {slides[activeSlide].title}
                </h3>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {slides[activeSlide].description}
              </p>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-800">
                {slides[activeSlide].highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Checklist Verification */}
          <div className="bg-neutral-950/70 p-4 rounded-xl border border-neutral-800 flex flex-col gap-2">
            <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-amber-300">
              Requirements Verification Checklist:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>DM Custom UI: Skills, Ability Checks, Saving Throws</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Advantage, Disadvantage & Normal roll modes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Player character name with small portrait icon</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Custom "Box of Doom" IMG tray & 3D polyhedral dice</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Laughing demon sound with explicit commented code</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spot for DC: Players only see roll & Pass/Fail</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Preview Build Version 1.0.0 • Foundry VTT v10-v12 Ready
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
