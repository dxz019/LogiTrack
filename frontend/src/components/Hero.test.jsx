import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock MovingBoxes to avoid Three.js issues in jsdom
vi.mock('./MovingBoxes', () => ({
  default: () => <div data-testid="moving-boxes" />
}));

import Hero from './Hero';

describe('Hero', () => {
  it('renders hero badge', () => {
    render(<Hero />);
    expect(screen.getByText(/Smart Logistics/)).toBeTruthy();
  });

  it('renders main heading', () => {
    render(<Hero />);
    expect(screen.getByText('Fast, Reliable')).toBeTruthy();
    expect(screen.getByText(/Delivery Logistics/)).toBeTruthy();
  });

  it('renders CTA buttons', () => {
    render(<Hero />);
    expect(screen.getByText(/Get Started Free/)).toBeTruthy();
    expect(screen.getByText(/Log In/)).toBeTruthy();
  });

  it('renders track input', () => {
    render(<Hero />);
    expect(screen.getByPlaceholderText(/Enter Order ID/)).toBeTruthy();
  });
});