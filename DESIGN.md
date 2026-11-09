# Design

## Data structures and algorithms

- **Game state** ([`src/game/gameState.ts`](./src/game/gameState.ts)):
  `GameState` is a plain object containing the round configuration, secret,
  status, timestamps, and an ordered `GuessEntry[]`. Each history entry stores
  the guess and its bulls/cows result. Submitting a guess returns a new state
  and a new history array, so previous entries are preserved.
- **`evaluateGuess`**
  ([`src/core/evaluateGuess.ts`](./src/core/evaluateGuess.ts)): compares
  positions to count bulls, then builds a digit-frequency map for the secret.
  It consumes that inventory while scanning the guess; total matches minus
  bulls gives cows, without counting a digit more times than it occurs.
- **`countPossibleSecrets`**
  ([`src/core/countPossibleSecrets.ts`](./src/core/countPossibleSecrets.ts)):
  uses the recurrence `P(length, base) = base * P(length - 1, base - 1)`,
  with invalid-input and zero-length base cases. A module-level memo stores
  results by `(length, base)`, avoiding repeated recursive work.
- **Leaderboard**
  ([`src/game/leaderboard.ts`](./src/game/leaderboard.ts)): an array of at
  most 10 entries, sorted by attempt count and then elapsed time. Each record
  includes its length and base, and the array is persisted in `localStorage`.

## Complexity

Let `n` be the secret/guess length and `b` the number-system base.

| Function               | Time             | Space  | Reason                                                                                                                                                |
| ---------------------- | ---------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateSecret`       | `O(b * n)`       | `O(b)` | Builds a `b`-digit pool; each of `n` selections removes an item from an array, which may shift `O(b)` elements.                                       |
| `evaluateGuess`        | `O(n)` average   | `O(n)` | Scans the strings and uses a digit-frequency map for constant-average-time lookups.                                                                   |
| `isValidGuess`         | `O(n)` average   | `O(n)` | Checks length, creates a `Set` to detect repeats, then validates each digit.                                                                          |
| `countPossibleSecrets` | `O(n)` cold call | `O(n)` | Visits at most one recursive state per remaining digit; recursion and newly memoized entries grow with `n`. Later calls for cached states are `O(1)`. |

## Clean Code principles

- **Single responsibility and small functions:** `generateSecret`,
  `evaluateGuess`, and `isValidGuess` each handle one core operation;
  `createGameState` and `submitGuess` handle state creation and transitions in
  [`src/game/gameState.ts`](./src/game/gameState.ts). Leaderboard validation,
  sorting, and storage have separate functions in
  [`src/game/leaderboard.ts`](./src/game/leaderboard.ts).
- **Meaningful names and explicit types:** names such as `secretInventory`,
  `totalMatches`, `GuessEntry`, and `LeaderboardEntry` communicate intent and
  data shape in the core and game modules.
- **Side-effect separation:** the core functions and game-state transitions
  do not access the DOM or browser storage. DOM rendering and event handling
  live in [`src/app.ts`](./src/app.ts); `localStorage` access lives in
  `readLeaderboard` and `saveLeaderboard`.
- **Immutable state updates:** `submitGuess` copies the state and appends to a
  new history array rather than modifying prior game state.
- **Guard clauses and explicit errors:** invalid guesses return an error
  without changing state in `submitGuess`; `generateSecret` rejects a length
  larger than the base.
