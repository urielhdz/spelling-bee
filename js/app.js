// app.js - Main application controller
var App = (function () {
  var state = {
    gameMode: "spell", // "spell" or "choose"
    words: [],
    currentIndex: 0,
    currentWord: "",
    expectedLetters: [],
    allChars: [],
    userLetters: [],
    charPointer: 0,
    results: [],
    currentVisibleLetters: [],
    inputMode: "keyboard",
    isAcceptingInput: false
  };

  var WORDS_PER_SESSION = 10;
  var ALL_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

  // ---- Difficulty Progression ----

  function getVisibleCount(wordIndex) {
    // Word 0 (first): 3 letters, Word 9 (last): 26 letters (all)
    if (wordIndex >= WORDS_PER_SESSION - 1) return 26;
    return Math.round(3 + (wordIndex / (WORDS_PER_SESSION - 1)) * 23);
  }

  function pickVisibleLetters(correctLetter, count) {
    if (count >= 26) return ALL_LETTERS.slice();

    var visible = [correctLetter];
    var pool = ALL_LETTERS.filter(function (l) { return l !== correctLetter; });

    // Shuffle pool
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }

    // Pick (count - 1) distractors
    for (var k = 0; k < count - 1 && k < pool.length; k++) {
      visible.push(pool[k]);
    }

    return visible;
  }

  function refreshKeyboardForCurrentLetter() {
    var letterIndex = state.userLetters.length;
    if (letterIndex >= state.expectedLetters.length) return;

    var correctLetter = state.expectedLetters[letterIndex];
    var count = getVisibleCount(state.currentIndex);
    var visible = pickVisibleLetters(correctLetter, count);
    state.currentVisibleLetters = visible;
    UI.updateKeyboardVisibility(visible);
  }

  // ---- Initialization ----

  function init() {
    UI.els.btnStart.addEventListener("click", showModeSelection);
    UI.els.btnNext.addEventListener("click", nextWord);
    UI.els.btnPlayAgain.addEventListener("click", showModeSelection);
    UI.els.btnSpeak.addEventListener("click", repeatWord);
    UI.els.btnToggleInput.addEventListener("click", toggleInputMode);
    UI.els.btnBackspace.addEventListener("click", undoLastLetter);
    UI.els.btnModeSpell.addEventListener("click", function () { selectMode("spell"); });
    UI.els.btnModeChoose.addEventListener("click", function () { selectMode("choose"); });

    // Physical keyboard support
    document.addEventListener("keydown", handleKeyDown);

    // Render on-screen keyboard
    UI.renderKeyboard(handleLetterInput);

    // Default to keyboard input
    state.inputMode = "keyboard";

    // Hide speech toggle if not supported
    if (!SpeechManager.isRecognitionSupported()) {
      UI.els.btnToggleInput.classList.add("hidden");
    }

    UI.showScreen("welcome");
  }

  // ---- Mode Selection ----

  function showModeSelection() {
    SoundEffects.ensureContext();
    UI.showScreen("mode-select");
  }

  function selectMode(mode) {
    state.gameMode = mode;
    startSession();
  }

  // ---- Physical Keyboard Support ----

  function handleKeyDown(e) {
    if (!state.isAcceptingInput) return;
    if (state.gameMode === "choose") return; // No keyboard input in choose mode

    var key = e.key.toLowerCase();

    // Single letter a-z — only accept if visible in current keyboard
    if (key.length === 1 && key >= "a" && key <= "z") {
      e.preventDefault();
      if (state.currentVisibleLetters.indexOf(key) >= 0) {
        handleLetterInput(key);
      }
      return;
    }

    // Backspace
    if (key === "backspace") {
      e.preventDefault();
      undoLastLetter();
    }
  }

  // ---- Session Flow ----

  function startSession() {
    state.words = SpellingWords.getRandomWords(WORDS_PER_SESSION);
    state.currentIndex = 0;
    state.results = [];

    UI.showScreen("practice");

    if (state.gameMode === "choose") {
      startChooseWord();
    } else {
      startWord();
    }
  }

  // ---- Spell Mode: Word Flow ----

  function startWord() {
    var word = state.words[state.currentIndex];
    state.currentWord = word;
    state.allChars = SpellingWords.getLetters(word);
    state.expectedLetters = SpellingWords.getAlphaLetters(word);
    state.userLetters = [];
    state.charPointer = 0;
    state.isAcceptingInput = false;

    // Ensure spelling mode UI is visible
    UI.showSpellingModeUI();

    // Update UI
    UI.updateProgress(state.currentIndex + 1, WORDS_PER_SESSION);
    UI.renderLetterSlots(word);
    UI.hideNextButton();
    UI.hideBackspace();
    UI.els.wordResult.classList.add("hidden");

    // Disable keyboard visually during countdown
    setKeyboardEnabled(false);

    // Step 1: Speak the word
    SpeechManager.speakWord(word).then(function () {
      // Step 2: 5-second countdown
      return UI.showCountdown(5);
    }).then(function () {
      // Step 3: Enable input
      state.isAcceptingInput = true;
      setKeyboardEnabled(true);
      UI.showBackspace();

      if (state.inputMode === "speech") {
        activateSpeechMode();
      } else {
        UI.showKeyboardMode();
      }

      advancePointerPastSpaces();
      refreshKeyboardForCurrentLetter();
    });
  }

  // ---- Choose Mode: Word Flow ----

  function startChooseWord() {
    var word = state.words[state.currentIndex];
    state.currentWord = word;
    state.isAcceptingInput = false;

    // Set up selection mode UI
    UI.showSelectionModeUI();
    UI.hideWordChoices();
    UI.hideSelectionResult();
    UI.hideNextButton();

    // Update progress
    UI.updateProgress(state.currentIndex + 1, WORDS_PER_SESSION);

    // Step 1: Speak the word
    SpeechManager.speakWord(word).then(function () {
      // Step 2: 5-second countdown
      return UI.showCountdown(5);
    }).then(function () {
      // Step 3: Show word choices
      state.isAcceptingInput = true;
      var choices = WordChoices.getChoices(word, 3);
      UI.renderWordChoices(choices, handleWordChoice);
    });
  }

  function handleWordChoice(selectedWord) {
    if (!state.isAcceptingInput) return;
    state.isAcceptingInput = false;

    var isCorrect = selectedWord === state.currentWord;

    UI.showChoiceResult(selectedWord, state.currentWord);

    if (isCorrect) {
      SoundEffects.wordCorrect();
    } else {
      SoundEffects.wordIncorrect();
    }

    state.results.push({
      word: state.currentWord,
      correct: isCorrect,
      userAnswer: selectedWord,
      mode: "choose"
    });

    UI.showNextButton();
    UI.els.btnNext.textContent =
      state.currentIndex < WORDS_PER_SESSION - 1 ? "Next Word" : "See Results";
  }

  // ---- Keyboard Enable/Disable ----

  function setKeyboardEnabled(enabled) {
    var keys = UI.els.keyboard.querySelectorAll(".key-btn");
    for (var i = 0; i < keys.length; i++) {
      keys[i].disabled = !enabled;
      keys[i].style.opacity = enabled ? "1" : "0.4";
    }
  }

  // ---- Letter Input ----

  function handleLetterInput(letter) {
    if (!state.isAcceptingInput) return;
    if (state.userLetters.length >= state.expectedLetters.length) return;

    var normalizedLetter = letter.toLowerCase();

    state.userLetters.push(normalizedLetter);

    UI.fillLetter(state.charPointer, normalizedLetter);

    // Immediate feedback sound
    var expectedIndex = state.userLetters.length - 1;
    var isCorrect = normalizedLetter === state.expectedLetters[expectedIndex];
    if (isCorrect) {
      SoundEffects.correctLetter();
    } else {
      SoundEffects.wrongLetter();
    }

    state.charPointer++;
    advancePointerPastSpaces();

    // Check if word is complete
    if (state.userLetters.length === state.expectedLetters.length) {
      completeWord();
    } else {
      // Refresh keyboard with new visible letters for next position
      refreshKeyboardForCurrentLetter();
    }
  }

  function advancePointerPastSpaces() {
    while (
      state.charPointer < state.allChars.length &&
      state.allChars[state.charPointer] === " "
    ) {
      state.charPointer++;
    }
  }

  function undoLastLetter() {
    if (!state.isAcceptingInput) return;
    if (state.userLetters.length === 0) return;

    state.userLetters.pop();

    // Move pointer back, skipping spaces
    state.charPointer--;
    while (
      state.charPointer > 0 &&
      state.allChars[state.charPointer] === " "
    ) {
      state.charPointer--;
    }

    UI.clearLetter(state.charPointer);
    refreshKeyboardForCurrentLetter();
  }

  // ---- Word Completion (Spell Mode) ----

  function completeWord() {
    state.isAcceptingInput = false;
    UI.hideBackspace();
    UI.showAllKeys();
    setKeyboardEnabled(false);

    if (state.inputMode === "speech") {
      SpeechManager.stopListening();
    }

    var isWordCorrect = state.userLetters.every(function (letter, i) {
      return letter === state.expectedLetters[i];
    });

    UI.showWordResult(state.currentWord, state.userLetters);

    if (isWordCorrect) {
      SoundEffects.wordCorrect();
    } else {
      SoundEffects.wordIncorrect();
    }

    state.results.push({
      word: state.currentWord,
      correct: isWordCorrect,
      userAnswer: state.userLetters.join("")
    });

    UI.showNextButton();
    UI.els.btnNext.textContent =
      state.currentIndex < WORDS_PER_SESSION - 1 ? "Next Word" : "See Results";
  }

  function nextWord() {
    state.currentIndex++;
    if (state.currentIndex >= WORDS_PER_SESSION) {
      showResults();
    } else if (state.gameMode === "choose") {
      startChooseWord();
    } else {
      startWord();
    }
  }

  // ---- Results ----

  function showResults() {
    var totalCorrect = state.results.filter(function (r) { return r.correct; }).length;
    UI.renderResults(state.results, totalCorrect, WORDS_PER_SESSION);
    UI.showScreen("results");

    // Celebration for good scores
    if (totalCorrect >= WORDS_PER_SESSION * 0.6) {
      SoundEffects.celebration();
      UI.showConfetti();
    }
  }

  // ---- Input Mode ----

  function toggleInputMode() {
    if (state.inputMode === "keyboard") {
      state.inputMode = "speech";
      if (state.isAcceptingInput) {
        activateSpeechMode();
      }
    } else {
      state.inputMode = "keyboard";
      SpeechManager.stopListening();
      if (state.isAcceptingInput) {
        UI.showKeyboardMode();
      }
    }
  }

  function activateSpeechMode() {
    UI.showSpeechMode();
    var started = SpeechManager.startListening(handleLetterInput);
    if (!started) {
      state.inputMode = "keyboard";
      UI.showKeyboardMode();
    }
  }

  // ---- Repeat Word ----

  function repeatWord() {
    SpeechManager.speakWord(state.currentWord);
  }

  // ---- Boot ----

  // Ensure voices are loaded (Chrome loads them async)
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function () {};
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { init: init };
})();
