/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },

  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/src/test-utils/fileMock.ts",
  },

  testMatch: ["**/*.test.ts", "**/*.test.tsx"],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        diagnostics: { ignoreCodes: [1343] },
        astTransformers: {
          before: [
            {
              path: "node_modules/ts-jest-mock-import-meta",
              options: {
                metaObjectReplacement: {
                  env: {
                    VITE_API_URL: "http://localhost:5000/api",
                    VITE_ASSET_URL: "http://localhost:5000",
                  },
                },
              },
            },
          ],
        },
      },
    ],
    "^.+\\.m?js$": "babel-jest",
  },

  transformIgnorePatterns: [
    "/node_modules/(?!(msw|@mswjs|until-async|@open-draft|@bundled-es-modules|headers-polyfill|strict-event-emitter|outvariant|rettime)/)",
  ],

  clearMocks: true,
  testTimeout: 10000,
};
