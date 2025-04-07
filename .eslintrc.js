module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      varsIgnorePattern: '^_', 
      argsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }]
  }
}
