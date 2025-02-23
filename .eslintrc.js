// reduces code complexity
const complexityRules = {
  'max-depth': ['error', 4], // prevent deeply nested code paths which are hard to read
  'max-nested-callbacks': ['error', 3],
  'max-lines': ['error', 500], // cap file length
  complexity: ['error', 20], // restrict cyclomatic complexity (number of linearly independent paths )
}

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  ignorePatterns: ["!.storybook"],
  extends: [
    'eslint:recommended',
    '@react-native-community',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    'detox',
    'jest',
    'react',
    'react-native',
    'no-unsanitized',
    'security',
    '@typescript-eslint',
    'spellcheck',
  ],
  rules: {
    ...complexityRules,
    'guard-for-in': 'error',
    'no-eval': 'error',
    'no-extra-boolean-cast': 'error',
    'no-ex-assign': 'error',
    'no-console': 'warn',
    'object-shorthand': 'error',
    // https://stackoverflow.com/questions/63961803/eslint-says-all-enums-in-typescript-app-are-already-declared-in-the-upper-scope
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    // use throughtout the app when importing devtools, or in test files
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-unused-expressions': [
      2,
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
    '@typescript-eslint/naming-convention': [
      2,
      {
        selector: 'enumMember',
        format: ['PascalCase'],
      },
    ],
    // Required for e2e usecases
    'jest/no-export': 'off',
    'jest/valid-describe-callback': 'off',
    'jest/valid-title': [
      2,
      {
        // jest expect string titles, but we use function names in the codebase
        ignoreTypeOfDescribeName: true,
      },
    ],
    // Required for e2e usecases
    'jest/expect-expect': [0, { assertFunctionNames: ['expect', 'expectSaga'] }],
    // Required for exception catching tests
    'jest/no-conditional-expect': 'off',
    'jest/no-disabled-tests': 'off',
    // TODO consider enabling these:
    // '@typescript-eslint/no-floating-promises': 'error',
    // 'import/no-self-import': 'error',
    // 'import/no-duplicates': 'error',
    // 'import/no-default-export': 'warn',
    // 'react/jsx-uses-react': 'off',
    // 'react/react-in-jsx-scope': 'off',
    'no-restricted-imports': [
      2,
      {
        paths: [
          {
            name: '@ethersproject',
            message: "Please import from 'ethers' directly to support tree-shaking.",
          },
          {
            name: 'react',
            importNames: ['Suspense'],
            message: 'Please use Suspense from src/components/data instead.',
          },
          {
            name: 'src/features/telemetry',
            importNames: ['logException'],
            message: 'Please use `logger.error` instead.',
          },
        ],
      },
    ],
    // React Plugin
    // Overrides rules from @react-native-community:
    // https://github.com/facebook/react-native/blob/3cf0291008dfeed4d967ebb95bdccbe2d52c5b81/packages/eslint-config-react-native-community/index.js#L287
    'react/jsx-sort-props': [
      2,
      {
        callbacksLast: true,
        shorthandFirst: true,
        ignoreCase: false,
        noSortAlphabetically: false,
        reservedFirst: true,
      },
    ],
    // Disallow unnecessary curly braces in JSX props and children
    'react/jsx-curly-brace-presence': [
      2,
      { props: 'never', children: 'never', propElementValues: 'always' },
    ],
    'react/no-unstable-nested-components': 'error',
    // React-Native Plugin
    // Overrides rules from @react-native-community:
    // https://github.com/facebook/react-native/blob/3cf0291008dfeed4d967ebb95bdccbe2d52c5b81/packages/eslint-config-react-native-community/index.js#L313
    'react-native/no-unused-styles': 'error',
    'react-native/sort-styles': 'error',
    // Security Linting
    // Mozilla's No Unsanitized - https://github.com/mozilla/eslint-plugin-no-unsanitized
    'no-unsanitized/method': 'error',
    'no-unsanitized/property': 'error',
    // Generic Security Linting - https://www.npmjs.com/package/eslint-plugin-security
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-new-buffer': 'error',
    // Rules within the standard React plugin
    'react/no-danger': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-unsafe': 'error',
    // Overwrite default Prettier settings - https://prettier.io/docs/en/options.html
    'prettier/prettier': [
      2,
      {
        bracketSameLine: true,
        singleQuote: true,
        printWidth: 100,
        semi: false,
      },
    ],
  },
  overrides: [
    {
      files: ['*.e2e.js'],
      env: {
        'detox/detox': true,
        jest: true,
        'jest/globals': true,
      },
    },
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', '*.mts', '*.cts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          { allowedNames: ['useEffect'] },
        ],
      },
    },
    // ignore return type in saga files given return types are unwieldy and tied
    // to implementation details.
    {
      files: ['*saga*.ts', '*Saga.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      files: ['*.json'],
      rules: {
        // disable rule that shouldn't be applied to json files
        '@typescript-eslint/no-unused-expressions': 0,
        'spellcheck/spell-checker': [
          'warn',
          {
            comments: false,
            strings: true,
            identifiers: false,
            lang: 'en_US',
            // NOTE: react-i18next uses ’ over ' for apostrophes
            skipWords: [
              "you've",
              'Couldn’t',
              'Ethereum',
              'Let’s',
              'Onboarding',
              'Uniswap',
              'We’ll',
              'we’re',
              'What’s',
              'aren’t',
              'can’t',
              'dapp',
              'don’t',
              'eth',
              'etherscan',
              'haven’t',
              'isn’t',
              'it’s',
              'num',
              'they’ll',
              'usd',
              'wallet’s',
              'won’t',
              'you’ll',
              'you’re',
              'you’ve',
              'unhide',
              'unhidden'
            ],
          },
        ],
      },
    },
  ],
  globals: {
    Address: 'readonly',
    AddressTo: 'readonly',
    Nullable: 'readonly',
  },
}
