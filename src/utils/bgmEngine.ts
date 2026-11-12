/**
 * Procedural Web Audio API Background Music Engine
 * 
 * Provides unique, tailored, seamless looping background music
 * for every Party Channel game and the Homescreen (HUB).
 * Zero external dependencies, 0MB asset weight, zero CORS issues, instant playback.
 */

import { SubAppId } from '../types';

export type BgmTrackId = SubAppId | 'HUB';

interface NoteEvent {
  time: number; // offset in beats within loop
  freq: number; // frequency in Hz
  duration: number; // duration in seconds
  type?: OscillatorType;
  volume?: number;
  decay?: number;
}

class BgmEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrack: BgmTrackId | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private loopTimer: number | null = null;
  private currentLoopStartTime: number = 0;
  private currentLoopDuration: number = 4;
  private activeNodes: Array<AudioNode> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('party_channels_sound_muted');
        if (saved !== null) {
          this.isMuted = saved === 'true';
        }
      } catch {}
    }
  }

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('party_channels_sound_muted', String(muted));
    } catch {}

    if (this.ctx && this.masterGain) {
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.08, t + 0.1);
    }

    if (!muted && !this.isPlaying && this.currentTrack) {
      this.play(this.currentTrack);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentTrack(): BgmTrackId | null {
    return this.currentTrack;
  }

  /**
   * Play the background music tailored for the specified channel/app
   * All background music has been removed per user request.
   */
  public play(_trackId?: BgmTrackId) {
    this.isPlaying = false;
    this.stopCurrentLoop();
  }

  public stop() {
    this.isPlaying = false;
    this.stopCurrentLoop();
  }

  private stopCurrentLoop() {
    if (this.loopTimer !== null) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.activeNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeNodes = [];
  }

  private scheduleNextLoop() {
    if (!this.isPlaying || !this.ctx || !this.currentTrack || !this.masterGain) return;

    const pattern = this.getTrackPattern(this.currentTrack);
    const bpm = pattern.bpm;
    const beatSec = 60 / bpm;
    const loopDuration = pattern.beats * beatSec;
    this.currentLoopDuration = loopDuration;

    const now = this.ctx.currentTime;
    const startTime = Math.max(now + 0.05, this.currentLoopStartTime + this.currentLoopDuration);
    this.currentLoopStartTime = startTime;

    // Schedule all notes for this loop iteration
    pattern.notes.forEach(note => {
      const noteTime = startTime + note.time * beatSec;
      if (noteTime >= now) {
        this.playSynthesizedNote(note, noteTime, pattern.filterFreq);
      }
    });

    // Schedule the next cycle slightly before current cycle finishes (lookahead)
    const msUntilNextSchedule = Math.max(100, (startTime + loopDuration - now - 0.25) * 1000);
    this.loopTimer = window.setTimeout(() => {
      this.scheduleNextLoop();
    }, msUntilNextSchedule);
  }

  private playSynthesizedNote(note: NoteEvent, startTime: number, filterFreq = 1800) {
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = note.type || 'sine';
      osc.frequency.setValueAtTime(note.freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, startTime);

      const targetVol = (note.volume ?? 0.15);
      const decay = note.decay ?? 0.18;

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.linearRampToValueAtTime(targetVol, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(0.05, note.duration + decay));

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(startTime);
      const stopTime = startTime + note.duration + decay + 0.05;
      osc.stop(stopTime);

      this.activeNodes.push(osc);
      this.activeNodes.push(noteGain);

      setTimeout(() => {
        const oscIdx = this.activeNodes.indexOf(osc);
        if (oscIdx !== -1) this.activeNodes.splice(oscIdx, 1);
        const gainIdx = this.activeNodes.indexOf(noteGain);
        if (gainIdx !== -1) this.activeNodes.splice(gainIdx, 1);
      }, (stopTime - this.ctx.currentTime + 0.1) * 1000);
    } catch {}
  }

  /**
   * Musical patterns for every channel and homescreen
   */
  private getTrackPattern(trackId: BgmTrackId): { bpm: number; beats: number; filterFreq?: number; notes: NoteEvent[] } {
    switch (trackId) {
      // 1. WII HUB / HOMESCREEN: Peaceful, bouncy iconic Wii Shop / Wii Menu vibe
      case 'HUB':
        return {
          bpm: 114,
          beats: 16,
          filterFreq: 2200,
          notes: [
            // Bouncy marimba melody
            { time: 0, freq: 523.25, duration: 0.2, type: 'triangle', volume: 0.16 }, // C5
            { time: 1.5, freq: 659.25, duration: 0.2, type: 'triangle', volume: 0.14 }, // E5
            { time: 2, freq: 783.99, duration: 0.22, type: 'triangle', volume: 0.18 }, // G5
            { time: 3.5, freq: 880.00, duration: 0.18, type: 'triangle', volume: 0.15 }, // A5
            { time: 4, freq: 1046.5, duration: 0.25, type: 'sine', volume: 0.14 }, // C6
            { time: 6, freq: 783.99, duration: 0.2, type: 'triangle', volume: 0.15 }, // G5
            { time: 7.5, freq: 659.25, duration: 0.2, type: 'triangle', volume: 0.14 }, // E5
            { time: 8, freq: 587.33, duration: 0.22, type: 'triangle', volume: 0.16 }, // D5
            { time: 9.5, freq: 659.25, duration: 0.2, type: 'triangle', volume: 0.14 }, // E5
            { time: 10, freq: 523.25, duration: 0.28, type: 'triangle', volume: 0.16 }, // C5
            { time: 12, freq: 440.00, duration: 0.25, type: 'sine', volume: 0.13 }, // A4
            { time: 14, freq: 493.88, duration: 0.25, type: 'sine', volume: 0.14 }, // B4
            // Cozy bass foundation
            { time: 0, freq: 130.81, duration: 0.45, type: 'sine', volume: 0.18 }, // C3
            { time: 4, freq: 174.61, duration: 0.45, type: 'sine', volume: 0.18 }, // F3
            { time: 8, freq: 196.00, duration: 0.45, type: 'sine', volume: 0.18 }, // G3
            { time: 12, freq: 146.83, duration: 0.45, type: 'sine', volume: 0.17 }, // D3
          ],
        };

      // 2. PUB GOLF: Upbeat Irish/Scottish tavern reel
      case 'PUB_GOLF':
        return {
          bpm: 128,
          beats: 16,
          filterFreq: 2400,
          notes: [
            // Folk acoustic accordion / flute arpeggio
            { time: 0, freq: 392.00, duration: 0.15, type: 'triangle', volume: 0.16 },
            { time: 0.5, freq: 493.88, duration: 0.15, type: 'triangle', volume: 0.14 },
            { time: 1, freq: 587.33, duration: 0.15, type: 'triangle', volume: 0.17 },
            { time: 1.5, freq: 783.99, duration: 0.2, type: 'sine', volume: 0.19 },
            { time: 2, freq: 587.33, duration: 0.15, type: 'triangle', volume: 0.14 },
            { time: 3, freq: 493.88, duration: 0.2, type: 'triangle', volume: 0.15 },
            { time: 4, freq: 440.00, duration: 0.15, type: 'triangle', volume: 0.16 },
            { time: 5, freq: 523.25, duration: 0.15, type: 'triangle', volume: 0.15 },
            { time: 6, freq: 659.25, duration: 0.25, type: 'sine', volume: 0.18 },
            { time: 8, freq: 392.00, duration: 0.15, type: 'triangle', volume: 0.16 },
            { time: 9, freq: 587.33, duration: 0.15, type: 'triangle', volume: 0.15 },
            { time: 10, freq: 783.99, duration: 0.25, type: 'sine', volume: 0.18 },
            { time: 12, freq: 880.00, duration: 0.2, type: 'triangle', volume: 0.17 },
            { time: 13, freq: 783.99, duration: 0.15, type: 'triangle', volume: 0.15 },
            { time: 14, freq: 587.33, duration: 0.25, type: 'triangle', volume: 0.16 },
            // Tavern bass pulse
            { time: 0, freq: 98.00, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 2, freq: 146.83, duration: 0.25, type: 'sine', volume: 0.15 },
            { time: 4, freq: 110.00, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 6, freq: 164.81, duration: 0.25, type: 'sine', volume: 0.15 },
            { time: 8, freq: 98.00, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 10, freq: 146.83, duration: 0.25, type: 'sine', volume: 0.15 },
            { time: 12, freq: 130.81, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 14, freq: 146.83, duration: 0.25, type: 'sine', volume: 0.15 },
          ],
        };

      // 3. CHWAZI: Ambient electronic chill pad with sparkling pulse
      case 'CHWAZI':
        return {
          bpm: 96,
          beats: 16,
          filterFreq: 1400,
          notes: [
            { time: 0, freq: 261.63, duration: 1.2, type: 'sine', volume: 0.14 },
            { time: 2, freq: 392.00, duration: 0.8, type: 'sine', volume: 0.12 },
            { time: 4, freq: 440.00, duration: 1.2, type: 'sine', volume: 0.14 },
            { time: 6, freq: 523.25, duration: 0.8, type: 'sine', volume: 0.15 },
            { time: 8, freq: 349.23, duration: 1.2, type: 'sine', volume: 0.14 },
            { time: 10, freq: 392.00, duration: 0.8, type: 'sine', volume: 0.13 },
            { time: 12, freq: 329.63, duration: 1.5, type: 'sine', volume: 0.14 },
            // Deep sub pulse
            { time: 0, freq: 65.41, duration: 1.8, type: 'sine', volume: 0.22 },
            { time: 8, freq: 87.31, duration: 1.8, type: 'sine', volume: 0.22 },
          ],
        };

      // 4. DICE: Funky casino jazz swing groove
      case 'DICE':
        return {
          bpm: 120,
          beats: 16,
          filterFreq: 2000,
          notes: [
            // Walking upright bass
            { time: 0, freq: 110.00, duration: 0.35, type: 'sine', volume: 0.22 },
            { time: 1, freq: 138.59, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 2, freq: 164.81, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 3, freq: 174.61, duration: 0.3, type: 'sine', volume: 0.19 },
            { time: 4, freq: 146.83, duration: 0.35, type: 'sine', volume: 0.22 },
            { time: 5, freq: 164.81, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 6, freq: 174.61, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 7, freq: 220.00, duration: 0.3, type: 'sine', volume: 0.19 },
            // Jazzy Rhodes chords
            { time: 0.75, freq: 440.00, duration: 0.2, type: 'triangle', volume: 0.15 },
            { time: 0.75, freq: 554.37, duration: 0.2, type: 'triangle', volume: 0.12 },
            { time: 2.5, freq: 493.88, duration: 0.22, type: 'triangle', volume: 0.15 },
            { time: 4.75, freq: 587.33, duration: 0.2, type: 'triangle', volume: 0.16 },
            { time: 6.5, freq: 659.25, duration: 0.22, type: 'triangle', volume: 0.15 },
            { time: 8.75, freq: 440.00, duration: 0.2, type: 'triangle', volume: 0.15 },
          ],
        };

      // 5. SCORE KEEPER: Triumphant brass sports parade fanfare
      case 'SCORE_KEEPER':
        return {
          bpm: 124,
          beats: 16,
          filterFreq: 2600,
          notes: [
            { time: 0, freq: 523.25, duration: 0.25, type: 'sawtooth', volume: 0.13 },
            { time: 0.75, freq: 523.25, duration: 0.15, type: 'sawtooth', volume: 0.12 },
            { time: 1.5, freq: 523.25, duration: 0.18, type: 'sawtooth', volume: 0.13 },
            { time: 2, freq: 659.25, duration: 0.45, type: 'sawtooth', volume: 0.16 },
            { time: 3, freq: 783.99, duration: 0.65, type: 'sawtooth', volume: 0.18 },
            { time: 4.5, freq: 659.25, duration: 0.2, type: 'sawtooth', volume: 0.14 },
            { time: 5, freq: 783.99, duration: 0.25, type: 'sawtooth', volume: 0.16 },
            { time: 6, freq: 1046.5, duration: 0.8, type: 'sawtooth', volume: 0.2 },
            // Marching bass drum / low brass
            { time: 0, freq: 130.81, duration: 0.35, type: 'triangle', volume: 0.2 },
            { time: 2, freq: 130.81, duration: 0.35, type: 'triangle', volume: 0.2 },
            { time: 4, freq: 174.61, duration: 0.35, type: 'triangle', volume: 0.2 },
            { time: 6, freq: 196.00, duration: 0.4, type: 'triangle', volume: 0.22 },
          ],
        };

      // 6. RNG: Playful 8-bit retro arcade Chiptune melody
      case 'RNG':
        return {
          bpm: 135,
          beats: 16,
          filterFreq: 3000,
          notes: [
            { time: 0, freq: 440.00, duration: 0.12, type: 'square', volume: 0.08 },
            { time: 0.5, freq: 554.37, duration: 0.12, type: 'square', volume: 0.08 },
            { time: 1, freq: 659.25, duration: 0.12, type: 'square', volume: 0.09 },
            { time: 1.5, freq: 880.00, duration: 0.18, type: 'square', volume: 0.1 },
            { time: 2.5, freq: 783.99, duration: 0.15, type: 'square', volume: 0.09 },
            { time: 3, freq: 659.25, duration: 0.12, type: 'square', volume: 0.08 },
            { time: 4, freq: 493.88, duration: 0.12, type: 'square', volume: 0.08 },
            { time: 4.5, freq: 659.25, duration: 0.15, type: 'square', volume: 0.09 },
            { time: 5, freq: 987.77, duration: 0.22, type: 'square', volume: 0.1 },
            // Chiptune bass
            { time: 0, freq: 110.00, duration: 0.2, type: 'triangle', volume: 0.18 },
            { time: 2, freq: 138.59, duration: 0.2, type: 'triangle', volume: 0.18 },
            { time: 4, freq: 164.81, duration: 0.2, type: 'triangle', volume: 0.18 },
            { time: 6, freq: 146.83, duration: 0.2, type: 'triangle', volume: 0.18 },
          ],
        };

      // 7. WHEEL: Carnival / game show spinning waltz
      case 'WHEEL':
        return {
          bpm: 140,
          beats: 12,
          filterFreq: 2200,
          notes: [
            // 3/4 oom-pah-pah waltz
            { time: 0, freq: 130.81, duration: 0.35, type: 'sine', volume: 0.2 },
            { time: 1, freq: 523.25, duration: 0.2, type: 'triangle', volume: 0.13 },
            { time: 2, freq: 523.25, duration: 0.2, type: 'triangle', volume: 0.13 },
            { time: 3, freq: 196.00, duration: 0.35, type: 'sine', volume: 0.2 },
            { time: 4, freq: 587.33, duration: 0.2, type: 'triangle', volume: 0.13 },
            { time: 5, freq: 587.33, duration: 0.2, type: 'triangle', volume: 0.13 },
            // Glockenspiel melody
            { time: 0, freq: 783.99, duration: 0.3, type: 'sine', volume: 0.16 },
            { time: 1.5, freq: 880.00, duration: 0.2, type: 'sine', volume: 0.15 },
            { time: 3, freq: 1046.5, duration: 0.45, type: 'sine', volume: 0.18 },
            { time: 6, freq: 880.00, duration: 0.35, type: 'sine', volume: 0.15 },
            { time: 7.5, freq: 783.99, duration: 0.2, type: 'sine', volume: 0.14 },
            { time: 9, freq: 659.25, duration: 0.5, type: 'sine', volume: 0.17 },
          ],
        };

      // 8. SLABAKKEN: Authentic Dutch brown café accordion drinking song
      case 'SLABAKKEN':
        return {
          bpm: 126,
          beats: 16,
          filterFreq: 2400,
          notes: [
            // Dutch accordion bounce
            { time: 0, freq: 440.00, duration: 0.22, type: 'sawtooth', volume: 0.12 },
            { time: 1, freq: 523.25, duration: 0.2, type: 'sawtooth', volume: 0.12 },
            { time: 2, freq: 659.25, duration: 0.3, type: 'sawtooth', volume: 0.14 },
            { time: 3.5, freq: 587.33, duration: 0.18, type: 'sawtooth', volume: 0.12 },
            { time: 4, freq: 523.25, duration: 0.25, type: 'sawtooth', volume: 0.13 },
            { time: 5.5, freq: 440.00, duration: 0.2, type: 'sawtooth', volume: 0.12 },
            { time: 6, freq: 392.00, duration: 0.35, type: 'sawtooth', volume: 0.13 },
            { time: 8, freq: 440.00, duration: 0.22, type: 'sawtooth', volume: 0.13 },
            { time: 9, freq: 587.33, duration: 0.2, type: 'sawtooth', volume: 0.13 },
            { time: 10, freq: 659.25, duration: 0.35, type: 'sawtooth', volume: 0.15 },
            // Bruin café bass
            { time: 0, freq: 110.00, duration: 0.35, type: 'sine', volume: 0.2 },
            { time: 2, freq: 164.81, duration: 0.25, type: 'sine', volume: 0.16 },
            { time: 4, freq: 130.81, duration: 0.35, type: 'sine', volume: 0.2 },
            { time: 6, freq: 146.83, duration: 0.25, type: 'sine', volume: 0.16 },
          ],
        };

      // 9. TEAM MAKER: Whimsical marching toy band (tuba & playful bells)
      case 'TEAM_MAKER':
        return {
          bpm: 118,
          beats: 16,
          filterFreq: 2200,
          notes: [
            // Bouncy tuba
            { time: 0, freq: 98.00, duration: 0.3, type: 'triangle', volume: 0.22 },
            { time: 1, freq: 146.83, duration: 0.2, type: 'triangle', volume: 0.18 },
            { time: 2, freq: 98.00, duration: 0.3, type: 'triangle', volume: 0.22 },
            { time: 3, freq: 130.81, duration: 0.2, type: 'triangle', volume: 0.18 },
            // Toy glockenspiel
            { time: 0.5, freq: 659.25, duration: 0.15, type: 'sine', volume: 0.15 },
            { time: 1.5, freq: 783.99, duration: 0.18, type: 'sine', volume: 0.16 },
            { time: 2.5, freq: 880.00, duration: 0.2, type: 'sine', volume: 0.16 },
            { time: 4, freq: 659.25, duration: 0.25, type: 'sine', volume: 0.15 },
            { time: 5.5, freq: 587.33, duration: 0.18, type: 'sine', volume: 0.14 },
            { time: 6, freq: 523.25, duration: 0.3, type: 'sine', volume: 0.15 },
          ],
        };

      // 10. TOURNAMENT: Epic esports championship anthem
      case 'TOURNAMENT':
        return {
          bpm: 122,
          beats: 16,
          filterFreq: 2400,
          notes: [
            { time: 0, freq: 220.00, duration: 0.8, type: 'sawtooth', volume: 0.14 },
            { time: 2, freq: 261.63, duration: 0.8, type: 'sawtooth', volume: 0.14 },
            { time: 4, freq: 293.66, duration: 0.8, type: 'sawtooth', volume: 0.15 },
            { time: 6, freq: 329.63, duration: 1.2, type: 'sawtooth', volume: 0.17 },
            { time: 8, freq: 440.00, duration: 0.7, type: 'sawtooth', volume: 0.18 },
            { time: 10, freq: 392.00, duration: 0.6, type: 'sawtooth', volume: 0.16 },
            { time: 12, freq: 329.63, duration: 1.2, type: 'sawtooth', volume: 0.18 },
            // Power synth bass
            { time: 0, freq: 55.00, duration: 1.8, type: 'triangle', volume: 0.24 },
            { time: 4, freq: 73.42, duration: 1.8, type: 'triangle', volume: 0.24 },
            { time: 8, freq: 87.31, duration: 1.8, type: 'triangle', volume: 0.24 },
            { time: 12, freq: 65.41, duration: 1.8, type: 'triangle', volume: 0.24 },
          ],
        };

      // 11. CROCODILE: Sneaky jungle swamp suspense groove
      case 'CROCODILE':
        return {
          bpm: 104,
          beats: 16,
          filterFreq: 1600,
          notes: [
            // Sneaky tip-toe bass
            { time: 0, freq: 82.41, duration: 0.2, type: 'sine', volume: 0.22 },
            { time: 1, freq: 92.50, duration: 0.18, type: 'sine', volume: 0.2 },
            { time: 2, freq: 98.00, duration: 0.22, type: 'sine', volume: 0.22 },
            { time: 3, freq: 110.00, duration: 0.25, type: 'sine', volume: 0.2 },
            // Hollow jungle woodblocks
            { time: 0.5, freq: 587.33, duration: 0.08, type: 'triangle', volume: 0.16 },
            { time: 1.5, freq: 783.99, duration: 0.08, type: 'triangle', volume: 0.16 },
            { time: 2.75, freq: 880.00, duration: 0.09, type: 'triangle', volume: 0.18 },
            { time: 4.5, freq: 659.25, duration: 0.08, type: 'triangle', volume: 0.16 },
          ],
        };

      // 12. BOMB: High-tension ticking stealth / countdown thriller
      case 'BOMB':
        return {
          bpm: 130,
          beats: 16,
          filterFreq: 1900,
          notes: [
            // Ticking hi-hat pulse
            { time: 0, freq: 1200, duration: 0.03, type: 'triangle', volume: 0.1 },
            { time: 1, freq: 1200, duration: 0.03, type: 'triangle', volume: 0.1 },
            { time: 2, freq: 1200, duration: 0.03, type: 'triangle', volume: 0.1 },
            { time: 3, freq: 1200, duration: 0.03, type: 'triangle', volume: 0.1 },
            { time: 4, freq: 1600, duration: 0.04, type: 'triangle', volume: 0.14 },
            { time: 5, freq: 1200, duration: 0.03, type: 'triangle', volume: 0.1 },
            { time: 6, freq: 1200, duration: 0.03, type: 'triangle', volume: 0.1 },
            { time: 7, freq: 1800, duration: 0.05, type: 'triangle', volume: 0.15 },
            // Stealth bass throb
            { time: 0, freq: 73.42, duration: 0.35, type: 'sine', volume: 0.24 },
            { time: 2, freq: 77.78, duration: 0.35, type: 'sine', volume: 0.23 },
            { time: 4, freq: 73.42, duration: 0.35, type: 'sine', volume: 0.24 },
            { time: 6, freq: 69.30, duration: 0.35, type: 'sine', volume: 0.22 },
          ],
        };

      // 13. CAMEL RACE: Arabian desert caravan market dance
      case 'CAMEL_RACE':
        return {
          bpm: 125,
          beats: 16,
          filterFreq: 2500,
          notes: [
            // Middle eastern harmonic minor scale
            { time: 0, freq: 440.00, duration: 0.2, type: 'sawtooth', volume: 0.14 },
            { time: 1, freq: 466.16, duration: 0.2, type: 'sawtooth', volume: 0.15 },
            { time: 2, freq: 554.37, duration: 0.3, type: 'sawtooth', volume: 0.16 },
            { time: 3.5, freq: 587.33, duration: 0.25, type: 'sawtooth', volume: 0.16 },
            { time: 4.5, freq: 659.25, duration: 0.3, type: 'sawtooth', volume: 0.18 },
            { time: 6, freq: 554.37, duration: 0.25, type: 'sawtooth', volume: 0.15 },
            { time: 7, freq: 466.16, duration: 0.25, type: 'sawtooth', volume: 0.14 },
            { time: 8, freq: 440.00, duration: 0.5, type: 'sawtooth', volume: 0.16 },
            // Caravan desert bass
            { time: 0, freq: 110.00, duration: 0.35, type: 'sine', volume: 0.22 },
            { time: 2, freq: 116.54, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 4, freq: 110.00, duration: 0.35, type: 'sine', volume: 0.22 },
            { time: 6, freq: 138.59, duration: 0.3, type: 'sine', volume: 0.2 },
          ],
        };

      // 14. CARD CATALOG: Classy, smooth lounge bossa nova
      case 'CARD_CATALOG':
        return {
          bpm: 110,
          beats: 16,
          filterFreq: 1800,
          notes: [
            // Smooth bossa jazz chords
            { time: 0, freq: 392.00, duration: 0.4, type: 'triangle', volume: 0.14 },
            { time: 1.5, freq: 493.88, duration: 0.3, type: 'triangle', volume: 0.13 },
            { time: 3, freq: 587.33, duration: 0.35, type: 'triangle', volume: 0.14 },
            { time: 4, freq: 349.23, duration: 0.4, type: 'triangle', volume: 0.14 },
            { time: 5.5, freq: 440.00, duration: 0.3, type: 'triangle', volume: 0.13 },
            { time: 7, freq: 523.25, duration: 0.35, type: 'triangle', volume: 0.14 },
            // Gentle nylon bass
            { time: 0, freq: 98.00, duration: 0.45, type: 'sine', volume: 0.2 },
            { time: 2.5, freq: 146.83, duration: 0.35, type: 'sine', volume: 0.16 },
            { time: 4, freq: 87.31, duration: 0.45, type: 'sine', volume: 0.2 },
            { time: 6.5, freq: 130.81, duration: 0.35, type: 'sine', volume: 0.16 },
          ],
        };

      // 15. BOER ZOEKT VROUW: Romantic Dutch countryside folk guitar ballad
      case 'BOER_ZOEKT_VROUW':
        return {
          bpm: 105,
          beats: 16,
          filterFreq: 2100,
          notes: [
            // Acoustic folk melody
            { time: 0, freq: 392.00, duration: 0.35, type: 'sine', volume: 0.16 },
            { time: 1.5, freq: 440.00, duration: 0.2, type: 'sine', volume: 0.14 },
            { time: 2, freq: 493.88, duration: 0.3, type: 'sine', volume: 0.15 },
            { time: 3.5, freq: 587.33, duration: 0.4, type: 'sine', volume: 0.17 },
            { time: 5, freq: 493.88, duration: 0.25, type: 'sine', volume: 0.14 },
            { time: 6, freq: 392.00, duration: 0.5, type: 'sine', volume: 0.16 },
            // Strummed folk bass
            { time: 0, freq: 98.00, duration: 0.4, type: 'triangle', volume: 0.18 },
            { time: 2, freq: 146.83, duration: 0.35, type: 'triangle', volume: 0.16 },
            { time: 4, freq: 110.00, duration: 0.4, type: 'triangle', volume: 0.18 },
            { time: 6, freq: 146.83, duration: 0.35, type: 'triangle', volume: 0.16 },
          ],
        };

      // 16. MII MAKER: Iconic bouncy Mii Plaza synthesizer tune
      case 'MII_MAKER':
        return {
          bpm: 116,
          beats: 16,
          filterFreq: 2400,
          notes: [
            // Famous Mii Channel melody motif
            { time: 0, freq: 587.33, duration: 0.2, type: 'triangle', volume: 0.18 }, // D5
            { time: 1.5, freq: 659.25, duration: 0.18, type: 'triangle', volume: 0.16 }, // E5
            { time: 2, freq: 587.33, duration: 0.2, type: 'triangle', volume: 0.18 }, // D5
            { time: 3.5, freq: 493.88, duration: 0.18, type: 'triangle', volume: 0.16 }, // B4
            { time: 4, freq: 440.00, duration: 0.28, type: 'triangle', volume: 0.17 }, // A4
            { time: 6, freq: 493.88, duration: 0.2, type: 'triangle', volume: 0.16 }, // B4
            { time: 7, freq: 587.33, duration: 0.25, type: 'triangle', volume: 0.18 }, // D5
            { time: 8, freq: 659.25, duration: 0.35, type: 'sine', volume: 0.19 }, // E5
            { time: 10, freq: 783.99, duration: 0.3, type: 'sine', volume: 0.18 }, // G5
            { time: 12, freq: 587.33, duration: 0.4, type: 'triangle', volume: 0.18 }, // D5
            // Bouncy bass
            { time: 0, freq: 146.83, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 2, freq: 196.00, duration: 0.25, type: 'sine', volume: 0.18 },
            { time: 4, freq: 110.00, duration: 0.3, type: 'sine', volume: 0.2 },
            { time: 6, freq: 146.83, duration: 0.25, type: 'sine', volume: 0.18 },
          ],
        };

      // 17. THIRTY SECONDS: High-energy quiz show countdown
      case 'THIRTY_SECONDS':
        return {
          bpm: 132,
          beats: 16,
          filterFreq: 2600,
          notes: [
            // Urgent game show pulse
            { time: 0, freq: 440.00, duration: 0.15, type: 'square', volume: 0.08 },
            { time: 1, freq: 440.00, duration: 0.15, type: 'square', volume: 0.08 },
            { time: 2, freq: 554.37, duration: 0.2, type: 'square', volume: 0.09 },
            { time: 3, freq: 659.25, duration: 0.25, type: 'square', volume: 0.1 },
            { time: 4, freq: 440.00, duration: 0.15, type: 'square', volume: 0.08 },
            { time: 5, freq: 440.00, duration: 0.15, type: 'square', volume: 0.08 },
            { time: 6, freq: 783.99, duration: 0.2, type: 'square', volume: 0.1 },
            { time: 7, freq: 880.00, duration: 0.3, type: 'square', volume: 0.12 },
            // Driving bass
            { time: 0, freq: 110.00, duration: 0.25, type: 'triangle', volume: 0.2 },
            { time: 2, freq: 110.00, duration: 0.25, type: 'triangle', volume: 0.2 },
            { time: 4, freq: 138.59, duration: 0.25, type: 'triangle', volume: 0.2 },
            { time: 6, freq: 164.81, duration: 0.3, type: 'triangle', volume: 0.22 },
          ],
        };

      // 18. WIE IS: Sneaky comedic mystery / detective tiptoe theme
      case 'WIE_IS':
        return {
          bpm: 112,
          beats: 16,
          filterFreq: 2000,
          notes: [
            // Sneaky pizzicato detective tune (Pink Panther / Inspector Clouseau vibe)
            { time: 0, freq: 329.63, duration: 0.15, type: 'triangle', volume: 0.17 }, // E4
            { time: 0.75, freq: 349.23, duration: 0.15, type: 'triangle', volume: 0.18 }, // F4
            { time: 1.5, freq: 369.99, duration: 0.15, type: 'triangle', volume: 0.18 }, // F#4
            { time: 2, freq: 392.00, duration: 0.3, type: 'triangle', volume: 0.2 }, // G4
            { time: 3.5, freq: 369.99, duration: 0.15, type: 'triangle', volume: 0.16 }, // F#4
            { time: 4, freq: 349.23, duration: 0.25, type: 'triangle', volume: 0.17 }, // F4
            { time: 5.5, freq: 329.63, duration: 0.4, type: 'triangle', volume: 0.19 }, // E4
            { time: 8, freq: 440.00, duration: 0.15, type: 'triangle', volume: 0.17 }, // A4
            { time: 9.5, freq: 493.88, duration: 0.2, type: 'triangle', volume: 0.18 }, // B4
            { time: 10, freq: 523.25, duration: 0.35, type: 'sine', volume: 0.2 }, // C5
            // Tiptoe bass
            { time: 0, freq: 82.41, duration: 0.25, type: 'sine', volume: 0.22 },
            { time: 2, freq: 98.00, duration: 0.25, type: 'sine', volume: 0.22 },
            { time: 4, freq: 87.31, duration: 0.25, type: 'sine', volume: 0.2 },
            { time: 6, freq: 82.41, duration: 0.25, type: 'sine', volume: 0.22 },
          ],
        };

      // 19. UNDERCOVER: Mysterious atmospheric sci-fi space/alien synthwave
      case 'UNDERCOVER':
        return {
          bpm: 110,
          beats: 16,
          filterFreq: 1800,
          notes: [
            // Sci-fi synth arp
            { time: 0, freq: 293.66, duration: 0.35, type: 'sawtooth', volume: 0.12 }, // D4
            { time: 1, freq: 349.23, duration: 0.3, type: 'sawtooth', volume: 0.11 }, // F4
            { time: 2, freq: 440.00, duration: 0.35, type: 'sawtooth', volume: 0.13 }, // A4
            { time: 3, freq: 523.25, duration: 0.4, type: 'sine', volume: 0.15 }, // C5
            { time: 4, freq: 587.33, duration: 0.5, type: 'sine', volume: 0.16 }, // D5
            { time: 6, freq: 440.00, duration: 0.35, type: 'sawtooth', volume: 0.12 }, // A4
            { time: 7, freq: 349.23, duration: 0.3, type: 'sawtooth', volume: 0.11 }, // F4
            { time: 8, freq: 261.63, duration: 0.4, type: 'sawtooth', volume: 0.12 }, // C4
            { time: 10, freq: 329.63, duration: 0.35, type: 'sawtooth', volume: 0.12 }, // E4
            { time: 12, freq: 392.00, duration: 0.6, type: 'sine', volume: 0.15 }, // G4
            // Cosmic deep bass drone
            { time: 0, freq: 73.42, duration: 1.8, type: 'sine', volume: 0.24 }, // D2
            { time: 8, freq: 65.41, duration: 1.8, type: 'sine', volume: 0.24 }, // C2
          ],
        };

      default:
        // Generic fallback pleasant loop
        return {
          bpm: 120,
          beats: 16,
          notes: [
            { time: 0, freq: 523.25, duration: 0.25, type: 'sine', volume: 0.15 },
            { time: 2, freq: 659.25, duration: 0.25, type: 'sine', volume: 0.15 },
            { time: 4, freq: 783.99, duration: 0.25, type: 'sine', volume: 0.15 },
          ],
        };
    }
  }
}

export const bgmEngine = new BgmEngine();
