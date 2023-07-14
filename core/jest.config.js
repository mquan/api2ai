/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  roots: ["<rootDir>"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: [
    "<rootDir>/test/__fixtures__",
    "<rootDir>/node_modules",
    "<rootDir>/dist",
  ],
  testMatch: ['<rootDir>/**/__tests__/**/*.test.ts'],
  preset: "ts-jest",
};
