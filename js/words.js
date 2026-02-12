// words.js - Word list data module
const SpellingWords = (() => {
  const ALL_WORDS = [
    "action", "add", "advice", "after", "all", "almost", "always", "amount",
    "back", "bake", "banner", "baseball", "basket", "bear", "behind", "bell",
    "belt", "best", "bike", "blouse", "boat", "book", "boots", "boring", "bow",
    "box", "brave", "brush", "buckle", "bunny", "cake", "camera", "cannot",
    "care", "castle", "catch", "caught", "chased", "chew", "child", "children",
    "choke", "cinema", "city", "climb", "cloudy", "clown", "coat", "coffee",
    "cold", "come", "computer", "cookies", "corn", "couch", "cracker", "cubs",
    "cup", "daily", "doll", "dream", "dress", "drive", "drove", "dryer", "duck",
    "egg", "eight", "elevator", "eleven", "face", "find", "fire", "five",
    "flour", "foggy", "football", "fork", "fur", "fuzzy", "garage", "gift",
    "give", "goodbye", "grapes", "great", "grown", "happy", "hard", "have",
    "heart", "help", "hot", "hungry", "important", "island", "jacket", "jokes",
    "jump", "keep", "kept", "key", "kind", "king", "kiss", "kite", "koala",
    "later", "laugh", "leaves", "lemon", "lesson", "live", "look", "love",
    "make", "many", "marsupial", "meet", "mice", "midday", "minute", "most",
    "mouth", "muscle", "new", "nobody", "noisy", "nut", "oil", "our", "paint",
    "pants", "parrot", "people", "picnic", "pies", "pillow", "pirate", "place",
    "plane", "played", "please", "pretty", "puddle", "punch", "purple", "quiet",
    "rain", "ready", "reason", "region", "rented", "rest", "right", "ring",
    "rough", "said", "salad", "save", "says", "scarf", "scary", "school",
    "seasons", "seldom", "shape", "share", "shark", "shelf", "sing", "skirt",
    "slices", "smoke", "snail", "socks", "spoon", "spring", "star", "storm",
    "student", "subway", "summer", "sunny", "supper", "sweater", "sweet",
    "swing", "table", "take care", "teddy bear", "tell", "tent", "than",
    "thank", "that", "the", "their", "them", "today", "top", "town", "train",
    "travel", "trip", "uncle", "until", "vest", "wait", "waiter", "walk",
    "want", "water", "weekend", "went", "when", "win", "wing", "winter", "young"
  ];

  function getRandomWords(count) {
    count = count || 10;
    var shuffled = ALL_WORDS.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled.slice(0, count);
  }

  function getLetters(word) {
    return word.split("");
  }

  function getAlphaLetters(word) {
    return word.replace(/\s/g, "").split("");
  }

  return { ALL_WORDS: ALL_WORDS, getRandomWords: getRandomWords, getLetters: getLetters, getAlphaLetters: getAlphaLetters };
})();
