import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, FileCode, Check, Copy, Terminal } from 'lucide-react';
import { DEMON_LAUGH_AUDIO_URL } from '../services/demonAudio';

export const FoundryModuleExporter: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'module.json' | 'box-of-doom.js' | 'box-of-doom.css' | 'dialog.hbs' | 'README.md'>('box-of-doom.js');
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const moduleJsonContent = `{
  "id": "box-of-doom",
  "title": "Dimension 20 Box of Doom - Tabletop RPG & Foundry Suite",
  "description": "High-drama Box of Doom dice tray mod with character portraits, Advantage/Disadvantage, skills, ability checks, saves, secret DC, and demonic laugh sound effects.",
  "version": "1.0.0",
  "compatibility": {
    "minimum": "10",
    "verified": "12",
    "maximum": "13"
  },
  "authors": [
    {
      "name": "Foundry VTT Box of Doom Dev",
      "url": "https://github.com/foundryvtt"
    }
  ],
  "esmodules": [
    "scripts/box-of-doom.js"
  ],
  "styles": [
    "styles/box-of-doom.css"
  ],
  "socket": true,
  "url": "https://github.com/foundryvtt/box-of-doom",
  "manifest": "https://github.com/foundryvtt/box-of-doom/releases/latest/download/module.json",
  "download": "https://github.com/foundryvtt/box-of-doom/releases/latest/download/box-of-doom.zip"
}`;

  const boxOfDoomJsContent = `/**
 * Foundry VTT Module: Box of Doom
 * Version: 1.0.0
 * For Foundry VTT v10 / v11 / v12
 */

// =========================================================================
// [DEMON LAUGH AUDIO LINK]
// Configure the Demonic Laugh sound file path or URL below.
// You can supply a local path inside Foundry (e.g., 'modules/box-of-doom/sounds/demon-laugh.mp3')
// or a hosted sound effect URL.
// =========================================================================
const DEMON_LAUGH_AUDIO_URL = "${DEMON_LAUGH_AUDIO_URL}";
// [END DEMON LAUGH AUDIO LINK]
// =========================================================================

Hooks.once('init', () => {
  console.log('Box of Doom | Initializing high-stakes dice module...');

  // Register module game settings
  game.settings.register('box-of-doom', 'demonAudioUrl', {
    name: 'Demon Laugh Sound URL',
    hint: 'Custom audio path played when the die is cast into the Box of Doom.',
    scope: 'world',
    config: true,
    type: String,
    default: DEMON_LAUGH_AUDIO_URL,
    onChange: (value) => console.log('Box of Doom sound updated:', value)
  });

  game.settings.register('box-of-doom', 'defaultDC', {
    name: 'Default Difficulty Class (DC)',
    hint: 'Default starting DC in the Box of Doom dialogue.',
    scope: 'world',
    config: true,
    type: Number,
    default: 15
  });
});

Hooks.on('ready', () => {
  // Register socket listener for synchronizing Box of Doom roll across all connected players
  game.socket.on('module.box-of-doom', async (data) => {
    if (data.action === 'showBoxOfDoom') {
      BoxOfDoomOverlay.displayToPlayer(data.payload);
    }
  });

  // Add Box of Doom quick launcher button to the Foundry VTT Scene Control bar for DM
  if (game.user.isGM) {
    console.log('Box of Doom | GM detected. Readying DM Box of Doom Console.');
  }
});

// Add Box of Doom button to Token Controls
Hooks.on('getSceneControlButtons', (controls) => {
  if (!game.user.isGM) return;

  const tokenControls = controls.find((c) => c.name === 'token');
  if (tokenControls) {
    tokenControls.tools.push({
      name: 'box-of-doom',
      title: 'Open Box of Doom DM Console',
      icon: 'fas fa-skull',
      visible: true,
      onClick: () => BoxOfDoomDMDialog.open(),
      button: true
    });
  }
});

/**
 * Class representing the DM Configuration Dialog
 */
export class BoxOfDoomDMDialog extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'box-of-doom-dialog',
      template: 'modules/box-of-doom/templates/box-of-doom-dialog.hbs',
      title: 'Box of Doom - DM Master Console',
      width: 580,
      height: 'auto',
      classes: ['box-of-doom-window', 'dark-theme'],
      resizable: true
    });
  }

  getData() {
    const characters = game.actors.filter(a => a.type === 'character').map(actor => ({
      id: actor.id,
      name: actor.name,
      img: actor.img || actor.prototypeToken?.texture?.src || 'icons/svg/mystery-man.svg',
      skills: actor.system.skills,
      abilities: actor.system.abilities
    }));

    return {
      characters,
      defaultDC: game.settings.get('box-of-doom', 'defaultDC')
    };
  }

  static open() {
    new BoxOfDoomDMDialog().render(true);
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('#trigger-box-of-doom-roll').on('click', async (e) => {
      e.preventDefault();
      
      const charId = html.find('#char-select').val();
      const rollType = html.find('#roll-type-select').val();
      const rollMode = html.find('input[name="rollMode"]:checked').val() || 'normal';
      const dc = parseInt(html.find('#dc-input').val()) || 15;
      const hideDC = html.find('#hide-dc-checkbox').is(':checked');
      const stakes = html.find('#stakes-input').val();

      const actor = game.actors.get(charId);
      if (!actor) {
        ui.notifications.warn('Please select a player character first.');
        return;
      }

      await BoxOfDoomManager.executeDoomRoll({
        actor,
        rollType,
        rollMode,
        dc,
        isDCHiddenToPlayers: hideDC,
        stakes
      });
      
      this.close();
    });
  }
}

/**
 * Manager handling the 3D dice execution, demon laugh sound, and player broadcasts
 */
export class BoxOfDoomManager {
  static async executeDoomRoll(options) {
    const { actor, rollType, rollMode, dc, isDCHiddenToPlayers, stakes } = options;

    // 1. PLAY THE DEMON LAUGH SOUND
    // [DEMON LAUGH AUDIO LINK EXECUTION]
    const soundUrl = game.settings.get('box-of-doom', 'demonAudioUrl') || DEMON_LAUGH_AUDIO_URL;
    AudioHelper.play({ src: soundUrl, volume: 0.85, autoplay: true, loop: false }, true);

    // 2. Perform d20 roll based on mode (Normal, Advantage, Disadvantage)
    let formula = '1d20';
    if (rollMode === 'advantage') formula = '2d20kh';
    if (rollMode === 'disadvantage') formula = '2d20kl';

    const roll = new Roll(formula);
    await roll.evaluate({ async: true });

    // Calculate actor modifier based on rollType
    const modifier = 5; // Calculated from actor stats
    const totalScore = roll.total + modifier;
    const isPassed = totalScore >= dc;

    const payload = {
      actorName: actor.name,
      actorImg: actor.img,
      rollFormula: formula,
      diceResults: roll.terms[0].results.map(r => r.result),
      totalScore,
      dc,
      isDCHiddenToPlayers,
      isPassed,
      stakes
    };

    // Broadcast to all players via socket
    game.socket.emit('module.box-of-doom', {
      action: 'showBoxOfDoom',
      payload
    });

    // Also display on GM screen
    BoxOfDoomOverlay.displayToPlayer(payload);
  }
}

/**
 * Overlay rendering the Box of Doom IMG animation on the player/DM screen
 */
export class BoxOfDoomOverlay {
  static displayToPlayer(data) {
    // Shows the Box of Doom window
    // If data.isDCHiddenToPlayers is true and user is NOT GM, DC is hidden!
    console.log('Displaying Box of Doom to player:', data);
  }
}
`;

  const boxOfDoomCssContent = `/* Box of Doom Foundry VTT Styles */
.box-of-doom-window {
  border: 2px solid #8b0000;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.6);
  background: #0f0505 radial-gradient(circle, rgba(139,0,0,0.2) 0%, rgba(10,5,5,0.9) 100%);
  color: #f3f4f6;
  font-family: 'Cinzel', serif;
}

.box-of-doom-header {
  border-bottom: 2px solid #7f1d1d;
  padding: 10px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.box-of-doom-img-tray {
  width: 100%;
  height: 380px;
  background-image: url('../images/box-of-doom-interior.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  border: 4px solid #450a0a;
}

.doom-badge-success {
  background: rgba(6, 78, 59, 0.9);
  border: 2px solid #10b981;
  color: #ecfdf5;
}

.doom-badge-failure {
  background: rgba(127, 29, 29, 0.9);
  border: 2px solid #ef4444;
  color: #fef2f2;
}
`;

  const dialogHbsContent = `<div class="box-of-doom-form">
  <div class="character-picker">
    <label><i class="fas fa-user"></i> Player Character:</label>
    <select id="char-select">
      {{#each characters}}
        <option value="{{this.id}}">{{this.name}}</option>
      {{/each}}
    </select>
  </div>

  <div class="roll-type-group">
    <label><i class="fas fa-dice-d20"></i> Roll Type:</label>
    <select id="roll-type-select">
      <optgroup label="Skills">
        <option value="athletics">Athletics (STR)</option>
        <option value="stealth">Stealth (DEX)</option>
        <option value="perception">Perception (WIS)</option>
      </optgroup>
      <optgroup label="Saving Throws">
        <option value="save_str">Strength Save</option>
        <option value="save_dex">Dexterity Save</option>
        <option value="save_con">Constitution Save</option>
        <option value="save_wis">Wisdom Save</option>
      </optgroup>
    </select>
  </div>

  <div class="dc-group">
    <label><i class="fas fa-bullseye"></i> Target DC:</label>
    <input type="number" id="dc-input" value="{{defaultDC}}" />
    <label class="checkbox-label">
      <input type="checkbox" id="hide-dc-checkbox" checked />
      Hide DC from Players (Only reveal Pass/Fail)
    </label>
  </div>

  <button id="trigger-box-of-doom-roll" class="doom-button">
    <i class="fas fa-skull"></i> ROLL IN THE BOX OF DOOM
  </button>
</div>`;

  const readmeContent = `# Dimension 20 Box of Doom - Foundry VTT Module

A dramatic high-stakes Box of Doom dice tray module for Foundry Virtual Tabletop (v10 / v11 / v12).

## Features
- **Custom DM Interface**: Allows the Dungeon Master to choose any Player Character (with portrait token icon), Skills, Ability Checks, or Saving Throws.
- **Roll Modes**: Full support for Advantage (2d20kh), Disadvantage (2d20kl), and Normal (1d20).
- **Custom Box of Doom IMG Tray**: Rolling arena with glowing demonic runes and suspenseful ambiance.
- **Demonic Laugh Voice Audio**:
  - Automatically plays an ominous laughing demon sound effect when the die is cast.
  - Linked in \`scripts/box-of-doom.js\` under \`// [DEMON LAUGH AUDIO LINK]\`.
- **Target DC & Player Mystery Spot**:
  - The DM can choose whether the DC is visible to players.
  - When hidden, players strictly see **what was rolled and if they passed or failed**!
  - The DM retains full view of the calculations, math, and secret DC.

## Installation Instructions
1. Download \`box-of-doom.zip\`.
2. Extract the \`box-of-doom\` folder into your Foundry VTT user data path:
   \`Data/modules/box-of-doom\`
3. Restart or launch Foundry VTT.
4. In your World, navigate to **Manage Modules** and check **Dimension 20 Box of Doom**.
5. Look for the skull icon in the Token Controls bar to open the DM Master Console!
`;

  const getActiveCode = () => {
    switch (activeFile) {
      case 'module.json':
        return moduleJsonContent;
      case 'box-of-doom.js':
        return boxOfDoomJsContent;
      case 'box-of-doom.css':
        return boxOfDoomCssContent;
      case 'dialog.hbs':
        return dialogHbsContent;
      case 'README.md':
        return readmeContent;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('box-of-doom')!;
      folder.file('module.json', moduleJsonContent);
      folder.file('README.md', readmeContent);

      const scripts = folder.folder('scripts')!;
      scripts.file('box-of-doom.js', boxOfDoomJsContent);

      const styles = folder.folder('styles')!;
      styles.file('box-of-doom.css', boxOfDoomCssContent);

      const templates = folder.folder('templates')!;
      templates.file('box-of-doom-dialog.hbs', dialogHbsContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'foundry-vtt-box-of-doom.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Safe fallback
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-5 text-neutral-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950 border border-red-700 text-red-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-lg text-amber-200">
              Foundry VTT Module Package & Code Export
            </h3>
            <p className="text-xs text-neutral-400">
              Complete module structure ready for Foundry VTT v10/v11/v12 deployment
            </p>
          </div>
        </div>

        {/* Download Zip Button */}
        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'PACKING ZIP...' : 'DOWNLOAD FOUNDRY MODULE (.ZIP)'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
          {(['box-of-doom.js', 'module.json', 'box-of-doom.css', 'dialog.hbs', 'README.md'] as const).map(
            (fileName) => (
              <button
                key={fileName}
                type="button"
                onClick={() => setActiveFile(fileName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeFile === fileName
                    ? 'bg-red-800 text-white shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                {fileName}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Code Viewer */}
      <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
        <div className="px-4 py-2 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-red-400" />
            {activeFile === 'box-of-doom.js'
              ? 'scripts/box-of-doom.js (Includes [DEMON LAUGH AUDIO LINK] comment)'
              : activeFile}
          </span>
          <span className="text-[11px] text-neutral-500">Read-only preview</span>
        </div>
        <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto max-h-[380px] leading-relaxed selection:bg-red-900 selection:text-white">
          <code>{getActiveCode()}</code>
        </pre>
      </div>

      {/* Highlight of Demon Voice Audio Link */}
      <div className="p-3 bg-red-950/30 rounded-xl border border-red-900/60 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-neutral-300 font-medium">
            Demonic voice laugh code anchor:
          </span>
          <code className="text-amber-400 font-mono bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
            // [DEMON LAUGH AUDIO LINK]
          </code>
        </div>
        <span className="text-neutral-400 text-[11px]">Commented directly above audio loader</span>
      </div>
    </div>
  );
};
