module.exports = {
    testMatch: [
      "<rootDir>/compiled/**/*.test.(js|jsx|ts|tsx)",
      "<rootDir>/compiled/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))",
    ],
    transformIgnorePatterns: ["<rootDir>/node_modules/"],
};