import type { GameConfig } from './gameState.js';

export const LEADERBOARD_LIMIT = 10;

export interface LeaderboardEntry extends GameConfig {
  attempts: number;
  durationMs: number;
  completedAt: number;
}

export function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.length === 'number' &&
    Number.isInteger(entry.length) &&
    entry.length >= 2 &&
    entry.length <= 6 &&
    typeof entry.base === 'number' &&
    [2, 8, 10, 16].includes(entry.base) &&
    entry.length <= entry.base &&
    typeof entry.attempts === 'number' &&
    Number.isInteger(entry.attempts) &&
    entry.attempts > 0 &&
    typeof entry.durationMs === 'number' &&
    Number.isFinite(entry.durationMs) &&
    entry.durationMs >= 0 &&
    typeof entry.completedAt === 'number' &&
    Number.isFinite(entry.completedAt)
  );
}

export function readLeaderboard(): LeaderboardEntry[] {
  const stored = window.localStorage.getItem('bulls-and-cows-leaderboard');
  if (stored === null) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    throw new Error('Saved leaderboard data is not valid JSON.');
  }

  if (!Array.isArray(parsed) || !parsed.every(isLeaderboardEntry)) {
    throw new Error('Saved leaderboard data has an invalid format.');
  }

  return rankLeaderboard(parsed);
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  window.localStorage.setItem(
    'bulls-and-cows-leaderboard',
    JSON.stringify(entries),
  );
}

export function rankLeaderboard(
  entries: LeaderboardEntry[],
): LeaderboardEntry[] {
  return [...entries]
    .sort(
      (first, second) =>
        first.attempts - second.attempts ||
        first.durationMs - second.durationMs ||
        first.completedAt - second.completedAt,
    )
    .slice(0, LEADERBOARD_LIMIT);
}

export function addLeaderboardEntry(
  entries: LeaderboardEntry[],
  entry: LeaderboardEntry,
): LeaderboardEntry[] {
  return rankLeaderboard([...entries, entry]);
}
