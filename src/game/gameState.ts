import { evaluateGuess } from '../core/evaluateGuess.js';
import { generateSecret } from '../core/generateSecret.js';
import { isValidGuess } from '../core/isValidGuess.js';

export interface GameConfig {
  length: number;
  base: number;
}

export interface GuessEntry {
  guess: string;
  bulls: number;
  cows: number;
}

export interface GameState {
  config: GameConfig;
  secret: string;
  guesses: GuessEntry[];
  status: 'playing' | 'won';
  startedAt: number;
  durationMs: number | null;
}

export type GuessSubmission =
  { state: GameState; error: null } | { state: GameState; error: string };

export function createGameState(
  config: GameConfig,
  startedAt: number,
  secret = generateSecret(config.length, config.base),
): GameState {
  return {
    config: { ...config },
    secret,
    guesses: [],
    status: 'playing',
    startedAt,
    durationMs: null,
  };
}

export function submitGuess(
  state: GameState,
  input: string,
  submittedAt: number,
): GuessSubmission {
  if (state.status === 'won') {
    return { state, error: 'This game is already complete. Start a new game.' };
  }

  const guess = input.trim().toLowerCase();
  if (!isValidGuess(guess, state.config.length, state.config.base)) {
    return {
      state,
      error: `Enter ${state.config.length} unique digits valid in base ${state.config.base}.`,
    };
  }

  const result = evaluateGuess(state.secret, guess);
  const won = result.bulls === state.config.length;
  return {
    state: {
      ...state,
      guesses: [...state.guesses, { guess, ...result }],
      status: won ? 'won' : 'playing',
      durationMs: won
        ? Math.max(0, submittedAt - state.startedAt)
        : state.durationMs,
    },
    error: null,
  };
}
