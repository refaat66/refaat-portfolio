// Subtle UI sounds, generated with Web Audio (no audio files). Off by default.
(() => {
  const KEY = 're-sound';
  let on = false, ctx = null, master = null;
  try { on = localStorage.getItem(KEY) === 'on'; } catch {}

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, vol, type = 'sine', endFreq) {
    const c = audio(); if (!c) return;
    const t = c.currentTime + start;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }

  const sounds = {
    tick: () => { tone(1800, 0, 0.045, 0.12, 'triangle', 1200); },
    flip: () => { tone(380, 0, 0.16, 0.12, 'sine', 920); tone(1400, 0.1, 0.06, 0.05, 'triangle'); },
    ding: () => { tone(880, 0, 0.35, 0.1); tone(1320, 0.07, 0.45, 0.08); },
    on:   () => { tone(660, 0, 0.12, 0.1); tone(990, 0.08, 0.2, 0.09); }
  };

  window.reSound = (name) => { if (on && sounds[name]) sounds[name](); };

  const btn = document.getElementById('soundBtn');
  function render() {
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    btn.title = on ? 'Sound on' : 'Sound off';
  }
  render();
  if (btn) btn.addEventListener('click', e => {
    e.stopPropagation();
    on = !on;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch {}
    render();
    if (on) sounds.on();
  });

  // Only real clicks make a sound, never the scripted demo cursor in the hero
  document.addEventListener('click', e => {
    if (!on || !e.isTrusted) return;
    const el = e.target.closest('[data-sound], a, button, [role="button"], [role="switch"]');
    if (!el || el === btn) return;
    sounds[el.dataset.sound || 'tick']();
  }, true);
})();
