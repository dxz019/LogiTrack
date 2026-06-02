import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the modules before importing
vi.mock('gsap', () => {
  const instance = {
    context: () => ({ revert: () => {} }),
    fromTo: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    registerPlugin: vi.fn()
  };
  return { default: instance, gsap: instance };
});

vi.mock('gsap/ScrollTrigger', () => ({
  default: {
    create: () => ({ kill: () => {} }),
    refresh: () => {},
    getTweensOf: () => [],
    getAll: () => []
  }
}));

import StatsBar from './StatsBar';

describe('StatsBar', () => {
  it('renders stats section', () => {
    render(<StatsBar />);
    expect(screen.getByText(/Active Users/)).toBeTruthy();
    expect(screen.getByText(/On-Time Delivery/)).toBeTruthy();
  });

  it('displays correct stats values', () => {
    render(<StatsBar />);
    expect(screen.getByText('250M+')).toBeTruthy();
    expect(screen.getByText('99.9%')).toBeTruthy();
  });
});