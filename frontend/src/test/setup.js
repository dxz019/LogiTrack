import '@testing-library/jest-dom';

// Mock gsap before any imports
global.gsap = {
  registerPlugin: () => {},
  fromTo: () => ({}),
  to: () => ({}),
  context: () => ({ revert: () => {} }),
  timeline: () => ({ fromTo: () => ({}) })
};

global.matchMedia = global.matchMedia || function(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };
};

global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};