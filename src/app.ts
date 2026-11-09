import { countPossibleSecrets } from './core/countPossibleSecrets.js';
import { createDigitValidator } from './core/createDigitValidator.js';
import { createGameState, submitGuess } from './game/gameState.js';
import {
  addLeaderboardEntry,
  readLeaderboard,
  saveLeaderboard,
} from './game/leaderboard.js';
import type { GameState } from './game/gameState.js';
import type { LeaderboardEntry } from './game/leaderboard.js';

const appRoot = document.body;
const lengths = [2, 3, 4, 5, 6];
const systems = [
  { base: 2, name: 'Binary', shortName: 'BIN' },
  { base: 8, name: 'Octal', shortName: 'OCT' },
  { base: 10, name: 'Decimal', shortName: 'DEC' },
  { base: 16, name: 'Hexadecimal', shortName: 'HEX' },
];
let selectedLength = 4;
let selectedBase = 10;
let state: GameState | null = null;
let draft = '';
let feedback = '';
let storageNotice = '';
let leaderboard: LeaderboardEntry[] = [];
let leaderboardReadable = true;
let timerInterval: number | null = null;

try {
  leaderboard = readLeaderboard();
} catch (error) {
  leaderboardReadable = false;
  storageNotice = `Saved leaderboard unavailable: ${errorMessage(error)}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown storage error.';
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function makeOption(
  value: number,
  label: string,
  selected: boolean,
  disabled = false,
): HTMLOptionElement {
  const option = element('option');
  option.value = String(value);
  option.textContent = label;
  option.selected = selected;
  option.disabled = disabled;
  return option;
}

function formatDuration(durationMs: number): string {
  const totalHundredths = Math.floor(durationMs / 10);
  const minutes = Math.floor(totalHundredths / 6000);
  const seconds = Math.floor((totalHundredths % 6000) / 100);
  const hundredths = totalHundredths % 100;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

function getSystem(base: number) {
  const system = systems.find((option) => option.base === base);
  if (!system) {
    throw new Error(`Unsupported number system: ${base}`);
  }
  return system;
}

function renderLeaderboard(panel: HTMLElement): void {
  const section = element('section', 'leaderboard');
  section.setAttribute('aria-label', 'Leaderboard');
  section.append(
    element('h2', undefined, 'Leaderboard'),
    element(
      'p',
      'leaderboard-caption',
      'Top 10 scores · fewer guesses, then faster time',
    ),
  );

  if (storageNotice) {
    const notice = element('p', 'storage-notice', storageNotice);
    notice.setAttribute('role', 'status');
    section.append(notice);
  }

  if (leaderboard.length === 0) {
    section.append(
      element('p', 'empty-leaderboard', 'Win a round to set the first record.'),
    );
    panel.append(section);
    return;
  }

  const list = element('ol', 'leaderboard-list');
  leaderboard.forEach((entry, index) => {
    const item = element('li', 'leaderboard-entry');
    item.append(
      element('span', 'leaderboard-rank', String(index + 1).padStart(2, '0')),
      element('span', 'leaderboard-score', `${entry.attempts} guesses`),
      element(
        'span',
        'leaderboard-config',
        `${entry.length} digits · ${getSystem(entry.base).shortName}`,
      ),
      element('span', 'leaderboard-time', formatDuration(entry.durationMs)),
    );
    list.append(item);
  });
  section.append(list);
  panel.append(section);
}

function renderSetup(panel: HTMLElement): void {
  const form = element('form', 'setup-form');
  const controls = element('div', 'settings');
  const lengthLabel = element('label', 'setting');
  lengthLabel.append(element('span', undefined, 'Secret length'));
  const lengthSelect = element('select');
  lengthSelect.name = 'length';
  lengthSelect.setAttribute('aria-label', 'Secret length');
  for (const length of lengths) {
    lengthSelect.append(
      makeOption(
        length,
        `${length} digits${length > selectedBase ? ' — unavailable' : ''}`,
        selectedLength === length,
        length > selectedBase,
      ),
    );
  }
  lengthSelect.addEventListener('change', () => {
    selectedLength = Number(lengthSelect.value);
  });
  lengthLabel.append(lengthSelect);

  const baseLabel = element('label', 'setting');
  baseLabel.append(element('span', undefined, 'Number system'));
  const baseSelect = element('select');
  baseSelect.name = 'base';
  baseSelect.setAttribute('aria-label', 'Number system');
  for (const system of systems) {
    baseSelect.append(
      makeOption(
        system.base,
        `${system.name} (base ${system.base})`,
        selectedBase === system.base,
      ),
    );
  }
  baseSelect.addEventListener('change', () => {
    selectedBase = Number(baseSelect.value);
    if (selectedLength > selectedBase) {
      selectedLength = selectedBase;
    }
    render();
  });
  baseLabel.append(baseSelect);
  controls.append(lengthLabel, baseLabel);

  const startButton = element('button', 'button button-primary', 'Start game');
  startButton.type = 'submit';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (selectedLength > selectedBase) {
      feedback = 'The secret cannot be longer than the number system allows.';
      render();
      return;
    }
    state = createGameState(
      { length: selectedLength, base: selectedBase },
      Date.now(),
    );
    draft = '';
    feedback = '';
    render();
    document.querySelector<HTMLInputElement>('#guess')?.focus();
  });

  form.append(controls, startButton);
  panel.append(form);
  panel.append(
    element(
      'p',
      'game-prompt',
      `Choose a secret length from 2–${Math.min(6, selectedBase)}. Digits cannot repeat.`,
    ),
  );
  if (feedback) {
    panel.append(element('p', 'feedback', feedback));
  }
}

function renderGame(panel: HTMLElement): void {
  if (!state) {
    return;
  }

  const system = getSystem(state.config.base);
  const info = element('div', 'round-info');
  info.append(
    element(
      'span',
      'round-badge',
      `${state.config.length} digits · ${system.shortName}`,
    ),
    element(
      'span',
      'game-meta',
      `${countPossibleSecrets(state.config.length, state.config.base).toLocaleString()} possible codes`,
    ),
  );
  panel.append(info);

  if (state.status === 'playing') {
    const timerDisplay = element(
      'p',
      'round-timer',
      formatDuration(Date.now() - state.startedAt),
    );
    timerDisplay.setAttribute('aria-label', 'Time elapsed');
    panel.append(timerDisplay);

    const form = element('form', 'guess-form');
    const guessLabel = element('label', 'guess-label');
    guessLabel.htmlFor = 'guess';
    guessLabel.textContent = 'Your guess';
    const input = element('input', 'guess-input');
    input.id = 'guess';
    input.name = 'guess';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.required = true;
    input.maxLength = state.config.length;
    input.value = draft;
    input.placeholder = `e.g. ${'0123456789abcdef'
      .slice(0, state.config.length)
      .toUpperCase()}`;
    input.setAttribute('aria-describedby', 'guess-help guess-feedback');
    input.setAttribute(
      'inputmode',
      state.config.base <= 10 ? 'numeric' : 'text',
    );
    input.addEventListener('input', () => {
      if (!state) {
        return;
      }
      const validDigit = createDigitValidator(state.config.base);
      draft = Array.from(input.value.toLowerCase())
        .filter((digit) => validDigit(digit))
        .slice(0, state.config.length)
        .join('');
      if (input.value !== draft) {
        input.value = draft;
      }
    });
    guessLabel.append(input);

    const submitButton = element(
      'button',
      'button button-primary',
      'Check guess',
    );
    submitButton.type = 'submit';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!state) {
        return;
      }
      const previousState = state;
      const submittedAt = Date.now();
      const result = submitGuess(previousState, draft, submittedAt);
      state = result.state;
      feedback = result.error ?? '';
      draft = '';

      if (
        previousState.status === 'playing' &&
        state.status === 'won' &&
        state.durationMs !== null
      ) {
        const record: LeaderboardEntry = {
          ...state.config,
          attempts: state.guesses.length,
          durationMs: state.durationMs,
          completedAt: submittedAt,
        };
        try {
          if (!leaderboardReadable) {
            throw new Error(
              'Saved entries could not be loaded, so existing data was left unchanged.',
            );
          }
          const updatedLeaderboard = addLeaderboardEntry(leaderboard, record);
          saveLeaderboard(updatedLeaderboard);
          leaderboard = updatedLeaderboard;
          storageNotice = '';
        } catch (error) {
          storageNotice = `Could not save your score: ${errorMessage(error)}`;
        }
      }

      render();
      if (state?.status === 'playing') {
        document.querySelector<HTMLInputElement>('#guess')?.focus();
      }
    });
    form.append(guessLabel, submitButton);
    panel.append(form);

    const help = element(
      'p',
      'field-help',
      `Use ${state.config.length} unique ${system.name.toLowerCase()} digits.`,
    );
    help.id = 'guess-help';
    panel.append(help);
    const feedbackNode = element('p', 'feedback', feedback);
    feedbackNode.id = 'guess-feedback';
    feedbackNode.setAttribute('aria-live', 'polite');
    panel.append(feedbackNode);

    if (timerInterval !== null) {
      window.clearInterval(timerInterval);
    }
    timerInterval = window.setInterval(() => {
      if (state?.status === 'playing') {
        timerDisplay.textContent = formatDuration(Date.now() - state.startedAt);
      }
    }, 50);
  } else {
    const durationMs = state.durationMs ?? 0;
    panel.append(
      element(
        'p',
        'win-message',
        `You cracked the code in ${state.guesses.length} ${state.guesses.length === 1 ? 'guess' : 'guesses'}!`,
      ),
      element('p', 'win-time', `Time: ${formatDuration(durationMs)}`),
    );
  }

  if (state.guesses.length > 0) {
    const history = element('section', 'history');
    history.setAttribute('aria-label', 'Guess history');
    history.append(element('h2', undefined, 'Your guesses'));
    const table = element('table', 'guess-table');
    const head = element('thead');
    const headerRow = element('tr');
    for (const title of ['#', 'Guess', 'Bulls', 'Cows']) {
      const cell = element('th', undefined, title);
      cell.scope = 'col';
      headerRow.append(cell);
    }
    head.append(headerRow);
    const body = element('tbody');
    state.guesses.forEach((entry, index) => {
      const row = element('tr');
      row.append(
        element('th', 'row-number', String(index + 1)),
        element('td', 'guess-code', entry.guess.toUpperCase()),
        element('td', undefined, String(entry.bulls)),
        element('td', undefined, String(entry.cows)),
      );
      body.append(row);
    });
    table.append(head, body);
    history.append(table);
    panel.append(history);
  }
}

function render(): void {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }

  const page = element('main', 'game-shell');
  const heading = element('header', 'hero');
  heading.append(
    element('p', 'eyebrow', 'A little logic goes a long way'),
    element('h1', undefined, 'Bulls & Cows'),
    element(
      'p',
      'intro',
      'Crack the secret code. Bulls are right digits in the right place; cows are right digits in the wrong place.',
    ),
  );
  page.append(heading);

  const panel = element('section', 'game-panel');
  panel.setAttribute('aria-label', 'Game');

  if (state) {
    const newGameButton = element(
      'button',
      'button button-secondary new-game-button',
      'New game',
    );
    newGameButton.type = 'button';
    newGameButton.addEventListener('click', () => {
      state = null;
      draft = '';
      feedback = '';
      render();
    });
    panel.append(newGameButton);
    renderGame(panel);
  } else {
    renderSetup(panel);
  }
  renderLeaderboard(panel);

  page.append(panel);
  page.append(
    element('footer', 'footer', 'Think carefully. Every digit counts.'),
  );
  appRoot.replaceChildren(page);
}

render();
