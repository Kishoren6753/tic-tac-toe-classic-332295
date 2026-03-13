import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title and initial turn indicator', () => {
  render(<App />);
  expect(screen.getByText(/tic tac toe/i)).toBeInTheDocument();
  expect(screen.getByText(/turn:\s*x/i)).toBeInTheDocument();
});
