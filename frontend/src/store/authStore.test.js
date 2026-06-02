import { beforeEach, describe, it, expect } from 'vitest';
import useAuthStore from './authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false
    });
  });

  it('initializes with correct default values', () => {
    const state = useAuthStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBeFalsy();
  });

  it('can set access token', () => {
    useAuthStore.getState().setAccessToken('test-token');
    
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('test-token');
  });
});
