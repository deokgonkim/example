/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  moduleFileExtensions: [
    "mjs",
    "js",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node"
  ],
  testMatch: [
    "**/?(*.)test.?js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/cypress/"
  ],
  transform: {
    "^.+\\.m?js$": "babel-jest"
  },
  transformIgnorePatterns: [
    "\\.pnp\\.[^\\/]+$"
  ],

  collectCoverage: true,
  coverageDirectory: "coverage"
}
