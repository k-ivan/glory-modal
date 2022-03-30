module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'es6': true
  },
  'extends': [
    'eslint:recommended'
  ],
  'parser': '@babel/eslint-parser',
  'parserOptions': {
    'ecmaVersion': 2022,
    'sourceType': 'module'
  },
  'rules': {
    'arrow-spacing': 'error',
    'block-spacing': ['error', 'always'],
    'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    'camelcase': ['error', { 'properties': 'never' }],
    'comma-dangle': ['error', {
      'arrays': 'never',
      'objects': 'never',
      'imports': 'never',
      'exports': 'never',
      'functions': 'never'
    }],
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    'comma-style': ['error', 'last'],
    'dot-location': ['error', 'property'],
    'func-call-spacing': ['error', 'never'],
    'indent': [
      'error',
      2,
      {
        'ignoredNodes': ['TemplateLiteral > *'],
        'SwitchCase': 1
      }
    ],
    'keyword-spacing': 'error',
    'linebreak-style': ['error', 'unix'],
    'no-console': 'warn',
    'no-duplicate-imports': 'error',
    'no-empty': ['error', { 'allowEmptyCatch': true }],
    'no-redeclare': ['error', { 'builtinGlobals': false }],
    'no-unneeded-ternary': 'error',
    'no-whitespace-before-property': 'error',
    'padded-blocks': ['error', 'never'],
    'quotes': [
      'error',
      'single',
      { 'allowTemplateLiterals': true }
    ],
    'rest-spread-spacing': ['error', 'never'],
    'semi': [
      'error',
      'always'
    ],
    'semi-spacing': ['error', { 'before': false, 'after': true }],
    'space-infix-ops': ['error', { 'int32Hint': false }],
    'spaced-comment': 'error'
  }
};
