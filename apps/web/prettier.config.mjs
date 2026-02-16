/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */

// import config from '@virtuex/eslint-config/prettier';

const config = {
  trailingComma: 'none',
  tabWidth: 2,
  singleQuote: true,
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.md',
      options: {
        bracketSpacing: false
      }
    }
  ]
};

export default config;