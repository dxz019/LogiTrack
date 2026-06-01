module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
};