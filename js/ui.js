// ui.js - DOM manipulation and UI rendering
var UI = (function () {
  var screens = {
    welcome: document.getElementById("screen-welcome"),
    "mode-select": document.getElementById("screen-mode-select"),
    practice: document.getElementById("screen-practice"),
    results: document.getElementById("screen-results")
  };

  var els = {
    btnStart: document.getElementById("btn-start"),
    btnNext: document.getElementById("btn-next"),
    btnPlayAgain: document.getElementById("btn-play-again"),
    btnSpeak: document.getElementById("btn-speak"),
    btnToggleInput: document.getElementById("btn-toggle-input"),
    btnBackspace: document.getElementById("btn-backspace"),
    letterSlots: document.getElementById("letter-slots"),
    keyboard: document.getElementById("keyboard"),
    speechIndicator: document.getElementById("speech-indicator"),
    progressFill: document.getElementById("progress-fill"),
    currentWordNum: document.getElementById("current-word-num"),
    totalWords: document.getElementById("total-words"),
    countdownOverlay: document.getElementById("countdown-overlay"),
    countdownNumber: document.getElementById("countdown-number"),
    wordResult: document.getElementById("word-result"),
    wordChoices: document.getElementById("word-choices"),
    selectionResult: document.getElementById("selection-result"),
    btnModeSpell: document.getElementById("btn-mode-spell"),
    btnModeChoose: document.getElementById("btn-mode-choose"),
    starRating: document.getElementById("star-rating"),
    score: document.getElementById("score"),
    resultsList: document.getElementById("results-list")
  };

  // ---- Screen Management ----

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.remove("active");
    });
    screens[name].classList.add("active");
  }

  // ---- Keyboard (QWERTY Layout) ----

  var QWERTY_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"]
  ];

  function renderKeyboard(onKeyPress) {
    els.keyboard.innerHTML = "";
    QWERTY_ROWS.forEach(function (row) {
      var rowDiv = document.createElement("div");
      rowDiv.className = "keyboard-row";
      row.forEach(function (letter) {
        var btn = document.createElement("button");
        btn.className = "key-btn";
        btn.textContent = letter.toUpperCase();
        btn.setAttribute("data-letter", letter);
        btn.setAttribute("aria-label", "Letter " + letter.toUpperCase());
        (function (l) {
          btn.addEventListener("click", function () { onKeyPress(l); });
        })(letter);
        rowDiv.appendChild(btn);
      });
      els.keyboard.appendChild(rowDiv);
    });
  }

  function updateKeyboardVisibility(visibleLetters) {
    var allKeys = els.keyboard.querySelectorAll(".key-btn");
    for (var i = 0; i < allKeys.length; i++) {
      var letter = allKeys[i].getAttribute("data-letter");
      if (visibleLetters.indexOf(letter) >= 0) {
        allKeys[i].classList.remove("key-hidden");
        allKeys[i].disabled = false;
      } else {
        allKeys[i].classList.add("key-hidden");
        allKeys[i].disabled = true;
      }
    }
  }

  function showAllKeys() {
    var allKeys = els.keyboard.querySelectorAll(".key-btn");
    for (var i = 0; i < allKeys.length; i++) {
      allKeys[i].classList.remove("key-hidden");
      allKeys[i].disabled = false;
    }
  }

  // ---- Letter Slots ----

  function renderLetterSlots(word) {
    els.letterSlots.innerHTML = "";
    var chars = word.split("");
    chars.forEach(function (ch, index) {
      if (ch === " ") {
        var spacer = document.createElement("span");
        spacer.className = "letter-spacer";
        els.letterSlots.appendChild(spacer);
      } else {
        var slot = document.createElement("span");
        slot.className = "letter-slot";
        slot.setAttribute("data-index", index);
        slot.textContent = "_";
        els.letterSlots.appendChild(slot);
      }
    });
  }

  function fillLetter(index, letter) {
    var slot = els.letterSlots.querySelector('[data-index="' + index + '"]');
    if (!slot) return;
    slot.textContent = letter.toUpperCase();
    slot.classList.add("filled");
    // Restart animation
    slot.style.animation = "none";
    void slot.offsetHeight;
    slot.style.animation = "popIn 0.3s ease";
  }

  function clearLetter(index) {
    var slot = els.letterSlots.querySelector('[data-index="' + index + '"]');
    if (!slot) return;
    slot.textContent = "_";
    slot.classList.remove("filled", "correct", "incorrect");
    slot.removeAttribute("data-correct");
    slot.style.animation = "";
  }

  function showWordResult(word, userLetters) {
    var chars = word.split("");
    var userIdx = 0;
    chars.forEach(function (ch, i) {
      if (ch === " ") return;
      var slot = els.letterSlots.querySelector('[data-index="' + i + '"]');
      if (!slot) return;

      var userLetter = userLetters[userIdx] || "";
      var isCorrect = userLetter.toLowerCase() === ch.toLowerCase();
      slot.classList.add(isCorrect ? "correct" : "incorrect");

      // Show correct letter if wrong
      if (!isCorrect) {
        slot.setAttribute("data-correct", ch.toUpperCase());
      }
      userIdx++;
    });

    els.wordResult.textContent = "The word was: " + word;
    els.wordResult.classList.remove("hidden");
  }

  // ---- Countdown ----

  function showCountdown(seconds) {
    return new Promise(function (resolve) {
      els.countdownOverlay.classList.remove("hidden");
      var remaining = seconds;

      function tick() {
        if (remaining <= 0) {
          els.countdownOverlay.classList.add("hidden");
          resolve();
          return;
        }
        els.countdownNumber.textContent = remaining;
        els.countdownNumber.style.animation = "none";
        void els.countdownNumber.offsetHeight;
        els.countdownNumber.style.animation = "countPulse 1s ease";
        SoundEffects.tick();
        remaining--;
        setTimeout(tick, 1000);
      }
      tick();
    });
  }

  // ---- Progress ----

  function updateProgress(current, total) {
    els.currentWordNum.textContent = current;
    els.totalWords.textContent = total;
    els.progressFill.style.width = ((current / total) * 100) + "%";
  }

  // ---- Input Mode ----

  function showKeyboardMode() {
    els.keyboard.classList.remove("hidden");
    els.speechIndicator.classList.add("hidden");
    els.btnToggleInput.textContent = "Switch to Voice";
  }

  function showSpeechMode() {
    els.keyboard.classList.add("hidden");
    els.speechIndicator.classList.remove("hidden");
    els.btnToggleInput.textContent = "Switch to Keyboard";
  }

  // ---- Results ----

  function renderResults(results, totalCorrect, totalWords) {
    var pct = totalCorrect / totalWords;
    var stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;

    els.starRating.innerHTML = "";
    for (var i = 0; i < 3; i++) {
      var star = document.createElement("span");
      star.className = "star " + (i < stars ? "star-filled" : "star-empty");
      star.textContent = "\u2605";
      star.style.animationDelay = (i * 0.2) + "s";
      els.starRating.appendChild(star);
    }

    els.score.textContent = totalCorrect + " / " + totalWords;

    els.resultsList.innerHTML = "";
    results.forEach(function (r) {
      var li = document.createElement("li");
      li.className = r.correct ? "result-correct" : "result-incorrect";

      var wordSpan = document.createElement("span");
      wordSpan.className = "result-word";
      wordSpan.textContent = r.word;

      var iconSpan = document.createElement("span");
      iconSpan.className = "result-icon";
      iconSpan.textContent = r.correct ? "\u2713" : "\u2717";

      li.appendChild(wordSpan);
      li.appendChild(iconSpan);

      if (!r.correct) {
        var answerSpan = document.createElement("span");
        answerSpan.className = "result-user-answer";
        answerSpan.textContent = (r.mode === "choose" ? "You chose: " : "You spelled: ") + r.userAnswer;
        li.appendChild(answerSpan);
      }

      els.resultsList.appendChild(li);
    });
  }

  // ---- Word Choices (Selection Mode) ----

  function renderWordChoices(choices, onSelect) {
    els.wordChoices.innerHTML = "";
    choices.forEach(function (word) {
      var btn = document.createElement("button");
      btn.className = "word-choice-btn";
      btn.textContent = word;
      (function (w) {
        btn.addEventListener("click", function () { onSelect(w); });
      })(word);
      els.wordChoices.appendChild(btn);
    });
    els.wordChoices.classList.remove("hidden");
  }

  function showChoiceResult(selectedWord, correctWord) {
    var buttons = els.wordChoices.querySelectorAll(".word-choice-btn");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.disabled = true;
      var btnWord = btn.textContent;
      if (btnWord === correctWord) {
        btn.classList.add("choice-correct");
      } else if (btnWord === selectedWord) {
        btn.classList.add("choice-incorrect");
      } else {
        btn.classList.add("choice-dimmed");
      }
    }

    var isCorrect = selectedWord === correctWord;
    els.selectionResult.textContent = isCorrect
      ? "Correct!"
      : "The word was: " + correctWord;
    els.selectionResult.className = "selection-result " + (isCorrect ? "result-correct" : "result-incorrect");
    els.selectionResult.classList.remove("hidden");
  }

  function hideWordChoices() {
    els.wordChoices.classList.add("hidden");
    els.wordChoices.innerHTML = "";
  }

  function hideSelectionResult() {
    els.selectionResult.classList.add("hidden");
    els.selectionResult.className = "selection-result hidden";
  }

  function showSpellingModeUI() {
    els.wordChoices.classList.add("hidden");
    els.selectionResult.classList.add("hidden");
    document.querySelector(".word-area").classList.remove("hidden");
    els.keyboard.classList.remove("hidden");
    document.querySelector(".action-buttons").classList.remove("hidden");
    els.btnToggleInput.classList.remove("hidden");
  }

  function showSelectionModeUI() {
    document.querySelector(".word-area").classList.add("hidden");
    els.keyboard.classList.add("hidden");
    els.speechIndicator.classList.add("hidden");
    document.querySelector(".action-buttons").classList.remove("hidden");
    els.btnToggleInput.classList.add("hidden");
    els.btnBackspace.classList.add("hidden");
    els.selectionResult.classList.add("hidden");
  }

  // ---- Confetti ----

  function showConfetti() {
    var container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);

    var colors = ["#FF6B6B", "#FFD700", "#77DD77", "#7EC8E3", "#FF8C42", "#DDA0DD"];
    for (var i = 0; i < 50; i++) {
      var piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 2 + "s";
      piece.style.animationDuration = (2 + Math.random() * 2) + "s";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
      piece.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      container.appendChild(piece);
    }

    setTimeout(function () {
      container.remove();
    }, 5000);
  }

  // ---- Visibility Helpers ----

  function showNextButton() { els.btnNext.classList.remove("hidden"); }
  function hideNextButton() { els.btnNext.classList.add("hidden"); }
  function showBackspace() { els.btnBackspace.classList.remove("hidden"); }
  function hideBackspace() { els.btnBackspace.classList.add("hidden"); }

  return {
    els: els,
    showScreen: showScreen,
    renderKeyboard: renderKeyboard,
    updateKeyboardVisibility: updateKeyboardVisibility,
    showAllKeys: showAllKeys,
    renderLetterSlots: renderLetterSlots,
    fillLetter: fillLetter,
    clearLetter: clearLetter,
    showWordResult: showWordResult,
    showCountdown: showCountdown,
    updateProgress: updateProgress,
    showKeyboardMode: showKeyboardMode,
    showSpeechMode: showSpeechMode,
    renderResults: renderResults,
    showConfetti: showConfetti,
    showNextButton: showNextButton,
    hideNextButton: hideNextButton,
    showBackspace: showBackspace,
    hideBackspace: hideBackspace,
    renderWordChoices: renderWordChoices,
    showChoiceResult: showChoiceResult,
    hideWordChoices: hideWordChoices,
    hideSelectionResult: hideSelectionResult,
    showSpellingModeUI: showSpellingModeUI,
    showSelectionModeUI: showSelectionModeUI
  };
})();
