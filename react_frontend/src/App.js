import React, { useMemo, useState } from 'react';
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

// PUBLIC_INTERFACE
function App() {
  /** Board state: 9 squares for a 3x3 grid. */
  const [squares, setSquares] = useState(() => Array(BOARD_SIZE).fill(null));
  /** Tracks whose turn it is (X starts). */
  const [xIsNext, setXIsNext] = useState(true);

  const { winner, winningLine } = useMemo(() => calculateWinner(squares), [squares]);
  const draw = useMemo(() => isDraw(squares), [squares]);

  const statusText = useMemo(() => {
    if (winner) return `${winner} wins`;
    if (draw) return 'Draw';
    return `Turn: ${xIsNext ? 'X' : 'O'}`;
  }, [winner, draw, xIsNext]);

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
  };

  return (
    <div className="App">
      <main className="ttt-shell">
        <header className="ttt-header">
          <div className="ttt-titleWrap">
            <h1 className="ttt-title">Tic Tac Toe</h1>
            <p className="ttt-subtitle">Local 2-player (X vs O)</p>
          </div>

          <div
            className="ttt-status"
            role="status"
            aria-live="polite"
            data-state={winner ? 'win' : draw ? 'draw' : 'play'}
          >
            <span className="ttt-statusLabel">{statusText}</span>
          </div>
        </header>

        <section className="ttt-boardSection" aria-label="Game board">
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
            <p className="ttt-hint">
              Tip: the winning line highlights when someone gets three in a row.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
