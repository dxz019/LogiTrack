import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FloatingOrderCard from './FloatingOrderCard';

describe('FloatingOrderCard', () => {
  it('renders without crashing', () => {
    render(<FloatingOrderCard orderNum="LT1234" statusText="Delivered" timeAgo="1 hour ago" icon="✓" />);
    expect(screen.getByText(/LT1234/)).toBeTruthy();
  });

  it('displays correct order number', () => {
    render(<FloatingOrderCard orderNum="LT5678" statusText="In Transit" timeAgo="5 min ago" icon="🚚" />);
    expect(screen.getByText(/LT5678/)).toBeTruthy();
  });

  it('shows status text', () => {
    render(<FloatingOrderCard orderNum="LT9999" statusText="Out for Delivery" timeAgo="2 min ago" icon="🚚" />);
    expect(screen.getByText('Out for Delivery')).toBeTruthy();
  });

  it('shows time ago', () => {
    render(<FloatingOrderCard orderNum="LT1111" statusText="Delivered" timeAgo="3 hours ago" icon="✓" />);
    expect(screen.getByText('3 hours ago')).toBeTruthy();
  });

  it('uses correct icon for delivered status', () => {
    render(<FloatingOrderCard orderNum="LT1111" statusText="Delivered" timeAgo="3 hours ago" icon="✓" />);
    expect(screen.getByText('✓')).toBeTruthy();
  });
});