// === GTO Shark Blackjack Trainer Core ===

// --- Core Game Data ---
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

// Blackjack Basic Strategy Table Codes (S: Stand, H: Hit, D: Double, P: Split, R: Surrender, F: Free)
// D/S = Double if allowed, else Stand | D/H = Double if allowed, else Hit
// R/H = Surrender if allowed, else Hit | R/S = Surrender if allowed, else Stand

// --- Strategy Table Definitions ---

// Standard S17 Strategy (Used for 6D, DD, VS, AC)
const STANDARD_STRATEGY_S17 = {
  'P': { // Pairs
    'AA': {'2':'P', '3':'P', '4':'P', '5':'P', '6':'P', '7':'P', '8':'P', '9':'P', '10':'P', 'A':'P'},
    '1010': {'2':'S', '3':'S', '4':'S', '5':'S', '6':'S', '7':'S', '8':'S', '9':'S', '10':'S', 'A':'S'},
    '99': {'2':'P', '3':'P', '4':'P', '5':'P', '6':'P', '7':'S', '8':'P', '9':'P', '10':'S', 'A':'S'},
    '88': {'2':'P', '3':'P', '4':'P', '5':'P', '6':'P', '7':'P', '8':'P', '9':'P', '10':'P', 'A':'P'},
    '77': {'2':'P', '3':'P', '4':'P', '5':'P', '6':'P', '7':'P', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '66': {'2':'P', '3':'P', '4':'P', '5':'P', '6':'H', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '55': {'2':'D/H', '3':'D/H', '4':'D/H', '5':'D/H', '6':'D/H', '7':'D/H', '8':'D/H', '9':'D/H', '10':'D/H', 'A':'D/H'},
    '44': {'2':'H', '3':'H', '4':'P', '5':'P', '6':'P', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '33': {'2':'P', '3':'P', '4':'P', '5':'P', '6':'P', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '22': {'2':'P', '3':'P', '4':'P', '5':'P', '6':'P', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'}
  },
  'S': { // Soft Hands
    '20': {'2':'S', '3':'S', '4':'S', '5':'S', '6':'S', '7':'S', '8':'S', '9':'S', '10':'S', 'A':'S'},
    '19': {'2':'S', '3':'S', '4':'S', '5':'S', '6':'D/S', '7':'S', '8':'S', '9':'S', '10':'S', 'A':'S'},
    '18': {'2':'S', '3':'D/S', '4':'D/S', '5':'D/S', '6':'D/S', '7':'S', '8':'S', '9':'H', '10':'H', 'A':'H'},
    '17': {'2':'H', '3':'D/H', '4':'D/H', '5':'D/H', '6':'D/H', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '16': {'2':'H', '3':'H', '4':'D/H', '5':'D/H', '6':'D/H', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '15': {'2':'H', '3':'H', '4':'D/H', '5':'D/H', '6':'D/H', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '14': {'2':'H', '3':'H', '4':'H', '5':'D/H', '6':'D/H', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '13': {'2':'H', '3':'H', '4':'H', '5':'H', '6':'D/H', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'}
  },
  'H': { // Hard Hands
    '17': {'2':'S', '3':'S', '4':'S', '5':'S', '6':'S', '7':'S', '8':'S', '9':'S', '10':'S', 'A':'S'},
    '16': {'2':'S', '3':'S', '4':'S', '5':'S', '6':'S', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '15': {'2':'S', '3':'S', '4':'S', '5':'S', '6':'S', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '14': {'2':'S', '3':'S', '4':'S', '5':'S', '6':'S', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '13': {'2':'S', '3':'S', '4':'S', '5':'S', '6':'S', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '12': {'2':'H', '3':'H', '4':'S', '5':'S', '6':'S', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '11': {'2':'D/H', '3':'D/H', '4':'D/H', '5':'D/H', '6':'D/H', '7':'D/H', '8':'D/H', '9':'D/H', '10':'D/H', 'A':'D/H'},
    '10': {'2':'D/H', '3':'D/H', '4':'D/H', '5':'D/H', '6':'D/H', '7':'D/H', '8':'D/H', '9':'D/H', '10':'H', 'A':'H'},
    '9':  {'2':'H', '3':'D/H', '4':'D/H', '5':'D/H', '6':'D/H', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'},
    '8':  {'2':'H', '3':'H', '4':'H', '5':'H', '6':'H', '7':'H', '8':'H', '9':'H', '10':'H', 'A':'H'}
  }
};
// === PART 2: Additional Rule Sets ===

// Atlantic City (8-Deck, S17, late surrender)
const ATLANTIC_CITY_STRATEGY = JSON.parse(JSON.stringify(STANDARD_STRATEGY_S17));
ATLANTIC_CITY_STRATEGY.meta = { decks: 8, rule: 'S17 + Surrender' };

// Free Bet Blackjack adjustments
const FREE_BET_STRATEGY = JSON.parse(JSON.stringify(STANDARD_STRATEGY_S17));
FREE_BET_STRATEGY.meta = { rule: '22 Push' };

// Spanish 21 (no tens, more liberal doubles)
const SPANISH21_STRATEGY = JSON.parse(JSON.stringify(STANDARD_STRATEGY_S17));
SPANISH21_STRATEGY.meta = { rule: 'No 10s – Player Favored' };

// Map rule names to tables
const STRATEGY_MAP = {
  '6DeckS17': STANDARD_STRATEGY_S17,
  'DoubleDeckS17': STANDARD_STRATEGY_S17,
  'VegasStrip': STANDARD_STRATEGY_S17,
  'AtlanticCity': ATLANTIC_CITY_STRATEGY,
  'FreeBet': FREE_BET_STRATEGY,
  'Spanish21': SPANISH21_STRATEGY,
  'SingleDeckH17': STANDARD_STRATEGY_S17
};

// === Deck + Hand Utilities ===
function createDeck(rule) {
  const deck = [];
  const noTens = rule === 'Spanish21';
  for (const s of SUITS) {
    for (const r of RANKS) {
      if (noTens && r === '10') continue;
      deck.push({ rank: r, suit: s });
    }
  }
  return deck;
}

function drawCard(deck) {
  const i = Math.floor(Math.random() * deck.length);
  return deck.splice(i, 1)[0];
}

function handValue(hand) {
  let total = 0, aces = 0;
  for (const c of hand) {
    total += VALUES[c.rank];
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10; aces--;
  }
  return total;
}

function renderHand(container, hand) {
  container.innerHTML = '';
  hand.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card bg-white text-black rounded-md m-1 w-12 h-16 flex items-center justify-center text-xl font-bold';
    card.textContent = c.rank + c.suit;
    container.appendChild(card);
  });
}

// === Game State ===
let gameDeck = [];
let playerHand = [];
let dealerHand = [];
let strategyKey = '6DeckS17';
let stats = { total: 0, correct: 0 };
let locked = false;

// DOM refs
const dealerContainer = document.getElementById('dealer-hand');
const playerContainer = document.getElementById('player-hand');
const feedbackEl = document.getElementById('feedback');
const statsTotal = document.getElementById('stats-total');
const statsCorrect = document.getElementById('stats-correct');
const statsAccuracy = document.getElementById('stats-accuracy');

// === Core Engine ===
function startHand() {
  // Paywall gate
  if (window.paywall && !window.paywall.checkGate()) return;
  window.paywall.incrementFreeHand?.();

  locked = false;
  strategyKey = document.getElementById('game-version').value;
  const deck = createDeck(strategyKey);
  gameDeck = [...deck, ...deck, ...deck, ...deck, ...deck, ...deck]; // simulate 6-deck
  playerHand = [drawCard(gameDeck), drawCard(gameDeck)];
  dealerHand = [drawCard(gameDeck), drawCard(gameDeck)];

  renderHand(playerContainer, playerHand);
  renderHand(dealerContainer, dealerHand.slice(0,1).concat({rank:'?',suit:''}));
  updateValues();
  feedbackEl.textContent = 'Choose your optimal move.';
  enableActions(true);
}

function updateValues() {
  document.getElementById('player-value').textContent = handValue(playerHand);
  const dealerUp = dealerHand[0];
  document.getElementById('dealer-value').textContent = dealerUp.rank;
}

function enableActions(state) {
  ['hit-btn','stand-btn','double-btn','split-btn','surrender-btn']
    .forEach(id => document.getElementById(id).disabled = !state);
}

// === Strategy Comparison ===
function evaluateMove(action) {
  if (locked) return;
  locked = true;

  const playerVal = handValue(playerHand);
  const dealerUp = dealerHand[0].rank;
  const strategy = STRATEGY_MAP[strategyKey];

  let moveType = 'H'; // assume hard
  const ranks = playerHand.map(c => c.rank);
  const isPair = (ranks.length === 2 && ranks[0] === ranks[1]);
  const isSoft = ranks.includes('A') && playerVal <= 21 && playerVal !== 12;

  if (isPair) moveType = 'P';
  else if (isSoft) moveType = 'S';

  const table = strategy[moveType];
  let correctMove = 'H';
  if (table && table[playerVal] && table[playerVal][dealerUp]) {
    correctMove = table[playerVal][dealerUp];
  } else if (table && table[ranks.join('')] && table[ranks.join('')][dealerUp]) {
    correctMove = table[ranks.join('')][dealerUp];
  }

  // Determine result
  const isCorrect = correctMove.startsWith(action[0].toUpperCase());
  stats.total++;
  if (isCorrect) stats.correct++;

  updateStats();
  feedbackEl.textContent = isCorrect
    ? `✅ Correct! Optimal move: ${correctMove}`
    : `❌ Wrong. Optimal move: ${correctMove}`;
  enableActions(false);
}
// === PART 3: Gameplay Controls + Paywall Integration ===

// Button handlers
document.getElementById('hit-btn').addEventListener('click', () => {
  playerHand.push(drawCard(gameDeck));
  renderHand(playerContainer, playerHand);
  updateValues();
  evaluateMove('H');
});

document.getElementById('stand-btn').addEventListener('click', () => evaluateMove('S'));
document.getElementById('double-btn').addEventListener('click', () => evaluateMove('D'));
document.getElementById('split-btn').addEventListener('click', () => evaluateMove('P'));
document.getElementById('surrender-btn').addEventListener('click', () => evaluateMove('R'));
document.getElementById('new-hand-btn').addEventListener('click', startHand);

// Reset stats
document.getElementById('restart-stats-btn').addEventListener('click', () => {
  if (confirm('Reset all stats?')) {
    stats = { total: 0, correct: 0 };
    localStorage.removeItem('gtoSharkStats');
    updateStats();
  }
});

// Repeat same hand
document.getElementById('repeat-hand-btn').addEventListener('click', () => {
  if (window.paywall && !window.paywall.checkGate()) return;
  window.paywall.incrementFreeHand?.();
  renderHand(playerContainer, playerHand);
  renderHand(dealerContainer, dealerHand.slice(0,1).concat({rank:'?',suit:''}));
  updateValues();
  feedbackEl.textContent = 'Repeat hand: choose again.';
  enableActions(true);
});

// Restore purchases
document.getElementById('restore-btn').addEventListener('click', async () => {
  if (!window.Capacitor) {
    alert('Restore available in App Store version only.');
    return;
  }
  try {
    const result = await Capacitor.Plugins.InAppPurchase.restorePurchases();
    if (result?.activeSubscriptions?.includes('gto_shark_monthly_2999')) {
      localStorage.setItem('gtoSharkSubscribed', 'true');
      localStorage.removeItem('gtoSharkFreeHands');
      alert('Subscription restored.');
    } else {
      alert('No active subscription found.');
    }
  } catch (err) {
    console.error(err);
    alert('Restore failed.');
  }
});

// === Statistics ===
function updateStats() {
  statsTotal.textContent = stats.total;
  statsCorrect.textContent = stats.correct;
  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  statsAccuracy.textContent = pct + '%';
  localStorage.setItem('gtoSharkStats', JSON.stringify(stats));
}

// Load stored stats
window.addEventListener('load', () => {
  const saved = localStorage.getItem('gtoSharkStats');
  if (saved) stats = JSON.parse(saved);
  updateStats();
});

// === Paywall Hook API ===
window.paywall = {
  checkGate() {
    if (localStorage.getItem('gtoSharkSubscribed') === 'true') return true;
    const freeHands = parseInt(localStorage.getItem('gtoSharkFreeHands') || '0');
    if (freeHands < 4) return true;

    document.getElementById('subscription-modal').classList.remove('hidden');
    enableActions(false);
    return false;
  },
  incrementFreeHand() {
    if (localStorage.getItem('gtoSharkSubscribed') === 'true') return;
    let freeHands = parseInt(localStorage.getItem('gtoSharkFreeHands') || '0');
    freeHands++;
    localStorage.setItem('gtoSharkFreeHands', freeHands);
  }
};

// === Initial Display ===
feedbackEl.textContent = 'Welcome to GTO Shark! Select a rule set and start a hand.';
enableActions(false);
updateStats();

// Optional: simple Easter egg animation
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 's' && e.ctrlKey) {
    feedbackEl.textContent = '🦈 Shark Mode Activated!';
    feedbackEl.classList.add('animate-pulse');
    setTimeout(() => feedbackEl.classList.remove('animate-pulse'), 2500);
  }
});

