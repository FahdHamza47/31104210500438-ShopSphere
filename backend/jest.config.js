/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/tests/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 15000, // some DB operations can be slow to start the first time
};
