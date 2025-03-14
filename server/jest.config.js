module.exports = {
  testEnvironment: "node",
  verbose: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/tests/**/*.js", "**/?(*.)+(spec|test).js"],
};
