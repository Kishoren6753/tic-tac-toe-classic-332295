import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title, initial turn indicator, theme toggle, and scoreboard', () => {
  render(<App />);
  expect(screen.getByText(/tic tac toe/i)).toBeInTheDocument();
  expect(screen.getByText(/turn:\s*x/i)).toBeInTheDocument();

  // Theme toggle
  expect(screen.getByRole('button', { name: /dark mode/i })).toBeInTheDocument();

  // Scoreboard labels
  expect(screen.getByText(/^x$/i)).toBeInTheDocument();
  expect(screen.getByText(/draws/i)).toBeInTheDocument();
  expect(screen.getByText(/^o$/i)).toBeInTheDocument();

  // Reset control
  expect(screen.getByRole('button', { name: /reset scores/i })).toBeInTheDocument();
});
