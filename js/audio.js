// audio.js - Procedural sound effects via Web Audio API
var SoundEffects = (function () {
  var audioCtx = null;

  function ensureContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(frequency, duration, type, volume) {
    type = type || "sine";
    volume = volume || 0.3;
    var ctx = ensureContext();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  function correctLetter() {
    playTone(880, 0.15, "sine", 0.25);
  }

  function wrongLetter() {
    playTone(300, 0.25, "sine", 0.2);
  }

  function wordCorrect() {
    playTone(523, 0.15, "sine", 0.3);
    setTimeout(function () { playTone(659, 0.15, "sine", 0.3); }, 150);
    setTimeout(function () { playTone(784, 0.3, "sine", 0.3); }, 300);
  }

  function wordIncorrect() {
    playTone(400, 0.2, "sine", 0.2);
    setTimeout(function () { playTone(330, 0.3, "sine", 0.2); }, 200);
  }

  function celebration() {
    var notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach(function (freq, i) {
      setTimeout(function () { playTone(freq, 0.2, "square", 0.15); }, i * 120);
    });
  }

  function tick() {
    playTone(600, 0.08, "square", 0.15);
  }

  return {
    correctLetter: correctLetter,
    wrongLetter: wrongLetter,
    wordCorrect: wordCorrect,
    wordIncorrect: wordIncorrect,
    celebration: celebration,
    tick: tick,
    ensureContext: ensureContext
  };
})();
