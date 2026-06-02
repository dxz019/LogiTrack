import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('renders LogiTrack logo', () => {
    render(<Navbar />);
    expect(screen.getByText('LogiTrack')).toBeTruthy();
  });

  it('contains navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Features')).toBeTruthy();
    expect(screen.getByText('Solutions')).toBeTruthy();
  });

  it('contains login and get started buttons', () => {
    render(<Navbar />);
    expect(screen.getByText('Log In')).toBeTruthy();
    expect(screen.getByText('Get Started')).toBeTruthy();
  });
});