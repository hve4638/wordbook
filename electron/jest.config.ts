import type { Config } from 'jest';
const config: Config = {
    verbose: true,
    testMatch: [
        '<rootDir>/compiled/**/*.test.(js|jsx|ts|tsx)',
        '<rootDir>/compiled/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))',
    ],
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
}

export default config;