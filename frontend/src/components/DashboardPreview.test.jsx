import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPreview from './DashboardPreview';

describe('DashboardPreview', () => {
  it('renders dashboard title', () => {
    render(<DashboardPreview />);
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('renders stat cards', () => {
    render(<DashboardPreview />);
    expect(screen.getByText('Total Orders')).toBeTruthy();
    expect(screen.getAllByText('In Transit').length).toBeGreaterThan(0);
    expect(screen.getByText('Cancelled')).toBeTruthy();
  });

  it('renders order list', () => {
    render(<DashboardPreview />);
    expect(screen.getByText(/LT1256/)).toBeTruthy();
    expect(screen.getByText(/LT1257/)).toBeTruthy();
  });
});