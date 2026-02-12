// speech.js - Speech synthesis and recognition
var SpeechManager = (function () {
  // ===========================
  // Text-to-Speech
  // ===========================
  var synth = window.speechSynthesis || null;

  function speakWord(word) {
    return new Promise(function (resolve) {
      if (!synth) { resolve(); return; }
      synth.cancel();

      var utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      var voices = synth.getVoices();
      var preferred = voices.find(function (v) {
        return v.lang === "en-US" && v.name.toLowerCase().includes("female");
      }) || voices.find(function (v) {
        return v.lang === "en-US";
      }) || voices.find(function (v) {
        return v.lang.startsWith("en") && v.name.toLowerCase().includes("female");
      }) || voices.find(function (v) {
        return v.lang.startsWith("en");
      });
      if (preferred) utterance.voice = preferred;

      utterance.onend = resolve;
      utterance.onerror = function () { resolve(); };
      synth.speak(utterance);
    });
  }

  function isTTSSupported() {
    return !!synth;
  }

  // ===========================
  // Speech Recognition
  // ===========================
  var SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var recognition = null;
  var onLetterCallback = null;
  var isListening = false;

  var LETTER_MAP = {
    // Direct single-letter matches
    "a": "a", "b": "b", "c": "c", "d": "d", "e": "e",
    "f": "f", "g": "g", "h": "h", "i": "i", "j": "j",
    "k": "k", "l": "l", "m": "m", "n": "n", "o": "o",
    "p": "p", "q": "q", "r": "r", "s": "s", "t": "t",
    "u": "u", "v": "v", "w": "w", "x": "x", "y": "y",
    "z": "z",
    // Phonetic letter names
    "ay": "a", "eh": "a",
    "bee": "b", "be": "b",
    "see": "c", "sea": "c", "cee": "c",
    "dee": "d",
    "ee": "e",
    "ef": "f", "eff": "f",
    "gee": "g", "ji": "g", "jee": "g",
    "aitch": "h", "ach": "h", "age": "h", "each": "h",
    "eye": "i",
    "jay": "j", "je": "j",
    "kay": "k", "ok": "k", "okay": "k", "kaye": "k", "que": "k",
    "el": "l", "elle": "l", "ale": "l",
    "em": "m",
    "en": "n",
    "oh": "o", "owe": "o",
    "pee": "p",
    "cue": "q", "queue": "q", "qu": "q", "kew": "q",
    "are": "r", "ar": "r",
    "es": "s", "ess": "s",
    "tee": "t", "tea": "t", "ti": "t",
    "you": "u", "yu": "u", "ew": "u",
    "vee": "v", "ve": "v",
    "double you": "w", "double u": "w", "doubleyou": "w", "dub": "w",
    "ex": "x", "eggs": "x",
    "why": "y", "wie": "y", "wye": "y",
    "zee": "z", "zed": "z", "ze": "z", "set": "z",
    // NATO phonetic alphabet
    "alpha": "a", "bravo": "b", "charlie": "c", "delta": "d",
    "echo": "e", "foxtrot": "f", "golf": "g", "hotel": "h",
    "india": "i", "juliet": "j", "kilo": "k", "lima": "l",
    "mike": "m", "november": "n", "oscar": "o", "papa": "p",
    "quebec": "q", "romeo": "r", "sierra": "s", "tango": "t",
    "uniform": "u", "victor": "v", "whiskey": "w", "xray": "x",
    "yankee": "y", "zulu": "z",
    // Common mishearings
    "hey": "a", "aye": "i", "bi": "b", "si": "c",
    "he": "e", "she": "c", "pea": "p", "key": "k"
  };

  function resolveToLetter(transcript) {
    var cleaned = transcript.toLowerCase().trim().replace(/[^a-z\s]/g, "");

    if (LETTER_MAP[cleaned] !== undefined) {
      return LETTER_MAP[cleaned];
    }

    if (cleaned.length === 1 && /[a-z]/.test(cleaned)) {
      return cleaned;
    }

    var keys = Object.keys(LETTER_MAP);
    for (var idx = 0; idx < keys.length; idx++) {
      var mapKey = keys[idx];
      if (mapKey.length > 1 && cleaned.indexOf(mapKey) === 0) {
        return LETTER_MAP[mapKey];
      }
    }

    return null;
  }

  function startListening(callback) {
    if (!SpeechRecognitionAPI) return false;

    onLetterCallback = callback;

    recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.lang = "en-US";

    recognition.onresult = function (event) {
      for (var i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;

        var foundLetter = null;
        for (var j = 0; j < event.results[i].length; j++) {
          var transcript = event.results[i][j].transcript;
          foundLetter = resolveToLetter(transcript);
          if (foundLetter) break;
        }

        if (foundLetter && onLetterCallback) {
          onLetterCallback(foundLetter);
        }
      }
    };

    recognition.onerror = function (event) {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("Speech recognition error:", event.error);
      }
    };

    recognition.onend = function () {
      if (isListening) {
        try { recognition.start(); } catch (e) { /* already started */ }
      }
    };

    try {
      recognition.start();
      isListening = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  function stopListening() {
    isListening = false;
    if (recognition) {
      try { recognition.stop(); } catch (e) { /* ignore */ }
      recognition = null;
    }
  }

  function isRecognitionSupported() {
    return !!SpeechRecognitionAPI;
  }

  return {
    speakWord: speakWord,
    isTTSSupported: isTTSSupported,
    startListening: startListening,
    stopListening: stopListening,
    isRecognitionSupported: isRecognitionSupported,
    resolveToLetter: resolveToLetter
  };
})();
