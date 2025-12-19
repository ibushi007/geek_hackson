const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: "./",
});

// Jestのカスタム設定を追加
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  collectCoverageFrom: ["server/**/*.{ts,tsx}", "!server/**/*.d.ts"],
};

// createJestConfigは非同期なので、このようにエクスポートします
module.exports = createJestConfig(customJestConfig);
