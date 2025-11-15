module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // testURL: 'http://localhost/', // Deprecated
  testEnvironmentOptions: {
    url: 'http://localhost/account/test-page', // Use this instead
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // If you have other path aliases in tsconfig.json, add them here
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
      plugins: ['styled-jsx/babel'], // Add styled-jsx babel plugin
    }],
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

};
