import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hello world message', () => {
  render(<App />);
  const helloElement = screen.getByText(/Hello World!/i);
  expect(helloElement).toBeInTheDocument();
});

test('renders research platform title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Multi-Agent Research Platform/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders status grid', () => {
  render(<App />);
  const frontendStatus = screen.getByText(/Frontend:/i);
  expect(frontendStatus).toBeInTheDocument();
}); 