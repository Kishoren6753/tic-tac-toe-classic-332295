import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const BOARD_SIZE = 9;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

const SCORE_STORAGE_KEY = 'ttt:scores:v1';
const THEME_STORAGE_KEY = 'ttt:theme:v1';

/**
 * Computes the winner (if any) for a 3x3 tic-tac-toe board.
 * @param {Array<('X'|'O'|null)>} squares Current board state.
 * @returns {{ winner: ('X'|'O'|null), winningLine: number[] | null }}
 */
function calculateWinner(squares) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) {
      return { winner: v, winningLine: line };
    }
  }
  return { winner: null, winningLine: null };
}

/**
 * @param {Array<('X'|'O'|null)>} squares Current board state.
 * @returns {boolean} Whether the game is a draw.
 */
function isDraw(squares) {
  return squares.every(Boolean) && !calculateWinner(squares).winner;
}

/**
 * Loads a persisted scoreboard from localStorage (if present/valid).
 * @returns {{xWins:number,oWins:number,draws:number}}
 */
function loadScores() {
  try {
    const raw = window.localStorage.getItem(SCORE_STORAGE_KEY);
    if (!raw) return { xWins: 0, oWins: 0, draws: 0 };
    const parsed = JSON.parse(raw);

    // Basic validation + coercion to avoid breaking the UI due to bad data.
    const xWins = Number(parsed?.xWins);
    const oWins = Number(parsed?.oWins);
    const draws = Number(parsed?.draws);

    return {
      xWins: Number.isFinite(xWins) && xWins >= 0 ? xWins : 0,
      oWins: Number.isFinite(oWins) && oWins >= 0 ? oWins : 0,
      draws: Number.isFinite(draws) && draws >= 0 ? draws : 0,
    };
  } catch {
    return { xWins: 0, oWins: 0, draws: 0 };
  }
}

/**
 * Loads a persisted theme preference from localStorage (if present/valid).
 * Defaults to the OS preference on first load.
 * @returns {'light'|'dark'}
 */
function loadTheme() {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {
    // ignore
  }

  // Prefer the user's OS setting if available.
  try {
    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

// PUBLIC_INTERFACE
function App() {
  /** Board state: 9 squares for a 3x3 grid. */
  const [squares, setSquares] = useState(() => Array(BOARD_SIZE).fill(null));
  /** Tracks whose turn it is (X starts). */
  const [xIsNext, setXIsNext] = useState(true);

  /** Persistent scoreboard. */
  const [scores, setScores] = useState(() => loadScores());

  /** Theme (light/dark). Persisted. */
  const [theme, setTheme] = useState(() => loadTheme());

  const { winner, winningLine } = useMemo(() => calculateWinner(squares), [squares]);
  const draw = useMemo(() => isDraw(squares), [squares]);

  // Used to ensure we only count a game's result once.
  const resultCountedRef = useRef(false);

  const statusText = useMemo(() => {
    if (winner) return `${winner} wins`;
    if (draw) return 'Draw';
    return `Turn: ${xIsNext ? 'X' : 'O'}`;
  }, [winner, draw, xIsNext]);

  // Persist scoreboard to localStorage whenever it changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
    } catch {
      // Ignore persistence failures (private mode/quota/etc.).
    }
  }, [scores]);

  // Persist theme + set attribute for CSS to target.
  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore persistence failures (private mode/quota/etc.).
    }
  }, [theme]);

  // Increment scoreboard when a game ends (win or draw). Only do it once per game.
  useEffect(() => {
    const ended = Boolean(winner || draw);
    if (!ended || resultCountedRef.current) return;

    resultCountedRef.current = true;
    setScores((prev) => {
      if (winner === 'X') return { ...prev, xWins: prev.xWins + 1 };
      if (winner === 'O') return { ...prev, oWins: prev.oWins + 1 };
      return { ...prev, draws: prev.draws + 1 };
    });
  }, [winner, draw]);

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    // Disallow moves if game ended or square already filled.
    if (winner || draw || squares[index]) return;

    setSquares((prev) => {
      const next = prev.slice();
      next[index] = xIsNext ? 'X' : 'O';
      return next;
    });
    setXIsNext((prev) => !prev);
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setSquares(Array(BOARD_SIZE).fill(null));
    setXIsNext(true);
    // Allow the next finished game to be counted.
    resultCountedRef.current = false;
  };

  // PUBLIC_INTERFACE
  const resetScores = () => {
    setScores({ xWins: 0, oWins: 0, draws: 0 });
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="App" data-theme={theme}>
      <main className="ttt-shell">
        <header className="ttt-header">
          <div className="ttt-titleWrap">
            <h1 className="ttt-title">Tic Tac Toe</h1>
            <p className="ttt-subtitle">Local 2-player (X vs O)</p>
          </div>

          <div className="ttt-headerRight">
            <button
              type="button"
              className="ttt-btn ttt-btnSubtle ttt-themeToggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <div
              className="ttt-status"
              role="status"
              aria-live="polite"
              data-state={winner ? 'win' : draw ? 'draw' : 'play'}
            >
              <span className="ttt-statusLabel">{statusText}</span>
            </div>
          </div>
        </header>

        <section className="ttt-boardSection" aria-label="Game board">
          <div className="ttt-scoreboard" role="group" aria-label="Scoreboard">
            <div className="ttt-scoreItems" aria-label="Score summary">
              <div className="ttt-scoreItem">
                <div className="ttt-scoreLabel">X</div>
                <div className="ttt-scoreValue" aria-label={`X wins ${scores.xWins}`}>
                  {scores.xWins}
                </div>
              </div>
              <div className="ttt-scoreItem">
                <div className="ttt-scoreLabel">Draws</div>
                <div className="ttt-scoreValue" aria-label={`Draws ${scores.draws}`}>
                  {scores.draws}
                </div>
              </div>
              <div className="ttt-scoreItem">
                <div className="ttt-scoreLabel">O</div>
                <div className="ttt-scoreValue" aria-label={`O wins ${scores.oWins}`}>
                  {scores.oWins}
                </div>
              </div>
            </div>

            <button type="button" className="ttt-btn ttt-btnSubtle" onClick={resetScores}>
              Reset scores
            </button>
          </div>

          <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
            {squares.map((value, idx) => {
              const isWinning = Boolean(winningLine && winningLine.includes(idx));
              const disabled = Boolean(value || winner || draw);
              const cellLabel = value ? `Cell ${idx + 1}, ${value}` : `Cell ${idx + 1}, empty`;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`ttt-cell ${value ? 'is-filled' : ''} ${isWinning ? 'is-winning' : ''}`}
                  onClick={() => handleSquareClick(idx)}
                  disabled={disabled}
                  aria-label={cellLabel}
                  role="gridcell"
                >
                  <span className="ttt-mark" aria-hidden="true">
                    {value}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ttt-actions">
            <button type="button" className="ttt-btn ttt-btnPrimary" onClick={resetGame}>
              New game
            </button>
            <p className="ttt-hint">Tip: the winning line highlights when someone gets three in a row.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
