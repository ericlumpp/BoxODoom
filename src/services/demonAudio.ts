// =========================================================================
// [DEMON LAUGH AUDIO LINK]
// The custom sound link for the laughing demon voice is defined below.
// Replace this URL with your custom demonic laugh voice file (.mp3, .ogg, .wav).
// When the die rolls in the Box of Doom, this audio plays for the players & DM!
// =========================================================================
export const DEMON_LAUGH_AUDIO_URL = 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3';
// [END DEMON LAUGH AUDIO LINK]
// =========================================================================

// Additional ambient and suspense sound cues
export const SUSPENSE_RISER_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
export const CRITICAL_HIT_FANFARE = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3';
export const CRITICAL_FAIL_GONG = 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3';

class DemonAudioController {
  private audioCtx: AudioContext | null = null;
  private laughAudio: HTMLAudioElement | null = null;
  private customAudioUrl: string = DEMON_LAUGH_AUDIO_URL;
  private volume: number = 0.8;
  private isMuted: boolean = false;

  constructor() {
    this.initAudioElement();
  }

  private initAudioElement() {
    try {
      this.laughAudio = new Audio(this.customAudioUrl);
      this.laughAudio.volume = this.volume;
      this.laughAudio.preload = 'auto';
    } catch {
      // Audio element initialization fallback
    }
  }

  public setCustomUrl(url: string) {
    this.customAudioUrl = url;
    if (this.laughAudio) {
      this.laughAudio.src = url;
    }
  }

  public getCustomUrl(): string {
    return this.customAudioUrl;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.laughAudio) {
      this.laughAudio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.laughAudio) {
      this.laughAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Main function called when the Box of Doom die is rolled.
   * Plays the demonic laugh sound with procedural evil laugh fallback.
   */
  public playDemonLaugh() {
    if (this.isMuted) return;

    // Primary: Attempt HTML5 audio from the DEMON_LAUGH_AUDIO_URL
    let playedOnline = false;
    if (this.laughAudio) {
      this.laughAudio.currentTime = 0;
      this.laughAudio.volume = this.volume;
      this.laughAudio.play()
        .then(() => {
          playedOnline = true;
        })
        .catch(() => {
          // If network / browser autoplay policy restricts URL audio, play synthetic demonic laugh!
          this.synthesizeDemonicLaugh();
        });
    }

    // Layer with demonic dark rumble for intense visceral impact
    this.playDemonicRumble();

    // If online audio didn't start quickly, trigger the synthesized demon cackle
    setTimeout(() => {
      if (!playedOnline) {
        this.synthesizeDemonicLaugh();
      }
    }, 150);
  }

  /**
   * Procedural Demonic Laugh Synthesizer
   * Creates an ominous, pitch-shifting demonic cackle ("Mwahahaha") using Web Audio API
   * Guaranteed to work offline and with zero external network dependencies!
   */
  public synthesizeDemonicLaugh() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Laugh syllables: 4 descending then ascending demonic bursts: "HA... HA... HA... HAAAH!"
      const burstIntervals = [0.0, 0.22, 0.44, 0.70, 1.05];
      const baseFreqs = [140, 125, 110, 95, 80];

      burstIntervals.forEach((delay, idx) => {
        const burstTime = now + delay;
        const dur = idx === 4 ? 0.6 : 0.18;

        // Low demonic saw oscillator
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        const baseF = baseFreqs[idx];
        osc1.frequency.setValueAtTime(baseF, burstTime);
        osc1.frequency.exponentialRampToValueAtTime(baseF * 0.7, burstTime + dur);

        osc2.frequency.setValueAtTime(baseF * 1.5, burstTime);
        osc2.frequency.exponentialRampToValueAtTime(baseF * 0.9, burstTime + dur);

        // Vocal formant filter (throat gargle)
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, burstTime);
        filter.Q.setValueAtTime(5.0, burstTime);

        // Volume envelope for each chuckle
        const peakVol = (this.volume * 0.45) * (idx === 4 ? 1.2 : 0.85);
        gain.gain.setValueAtTime(0.001, burstTime);
        gain.gain.exponentialRampToValueAtTime(peakVol, burstTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, burstTime + dur);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(burstTime);
        osc2.start(burstTime);
        osc1.stop(burstTime + dur);
        osc2.stop(burstTime + dur);
      });
    } catch {
      // Audio fallback safe
    }
  }

  /**
   * Heartbeat thud during suspense roll
   */
  public playHeartbeat() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Lub
      this.triggerSubThud(now, 65, 0.15);
      // Dub
      this.triggerSubThud(now + 0.18, 55, 0.22);
    } catch {
      // Safe
    }
  }

  private triggerSubThud(time: number, freq: number, duration: number) {
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + duration);

    gain.gain.setValueAtTime(this.volume * 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Dice tumbling clatter sound
   */
  public playDiceClatter() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      for (let i = 0; i < 5; i++) {
        const hitTime = now + (i * 0.08) + (Math.random() * 0.04);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 600, hitTime);
        osc.frequency.exponentialRampToValueAtTime(200, hitTime + 0.03);

        gain.gain.setValueAtTime(this.volume * 0.25, hitTime);
        gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(hitTime);
        osc.stop(hitTime + 0.03);
      }
    } catch {
      // Safe
    }
  }

  /**
   * Sub rumble for demonic atmosphere
   */
  public playDemonicRumble() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, now);
      osc.frequency.linearRampToValueAtTime(32, now + 1.8);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    } catch {
      // Safe
    }
  }

  /**
   * Victory stinger for Pass / Natural 20
   */
  public playSuccessFanfare(isCrit: boolean) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = isCrit ? [261.63, 329.63, 392.00, 523.25, 659.25] : [329.63, 440.00, 554.37];

      notes.forEach((freq, idx) => {
        const time = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(this.volume * 0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.8);
      });
    } catch {
      // Safe
    }
  }

  /**
   * Doom gong for Failure / Natural 1
   */
  public playFailureGong(isCrit: boolean) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isCrit ? 65 : 85, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 1.5);

      gain.gain.setValueAtTime(this.volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.5);
    } catch {
      // Safe
    }
  }
}

export const demonAudio = new DemonAudioController();
