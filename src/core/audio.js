export class AudioManager {
  constructor(muted = false) {
    this.muted = muted;
    this.ctx = null;
    this.lastShot = 0;
  }

  ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  tone(freq, duration, type = "sine", volume = 0.05, slideTo = null, delay = 0) {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  click() {
    this.tone(560, 0.07, "square", 0.035);
  }

  shoot() {
    const now = performance.now();
    if (now - this.lastShot < 90) return;
    this.lastShot = now;
    this.tone(760 + Math.random() * 240, 0.05, "triangle", 0.012, 420);
  }

  gateGood() {
    this.tone(620, 0.1, "sine", 0.05);
    this.tone(880, 0.14, "sine", 0.05, null, 0.09);
  }

  gateBad() {
    this.tone(240, 0.16, "sawtooth", 0.05, 130);
  }

  pickup() {
    this.tone(700, 0.08, "triangle", 0.05);
    this.tone(1050, 0.12, "triangle", 0.045, null, 0.07);
  }

  hit() {
    this.tone(150, 0.14, "square", 0.06, 80);
  }

  bossHit() {
    this.tone(90, 0.08, "square", 0.03, 60);
  }

  victory() {
    [523, 659, 784, 1046].forEach((freq, index) => {
      this.tone(freq, 0.2, "triangle", 0.05, null, index * 0.11);
    });
  }

  defeat() {
    [330, 262, 196].forEach((freq, index) => {
      this.tone(freq, 0.26, "sawtooth", 0.045, freq * 0.7, index * 0.14);
    });
  }

  unlock() {
    this.tone(784, 0.12, "triangle", 0.05);
    this.tone(988, 0.18, "triangle", 0.05, null, 0.1);
  }
}
