import cloudflare from '@cloudflare/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [cloudflare],
  env: cloudflare.env,
  ignorePatterns: cloudflare.ignorePatterns,
  rules: {
    // Temporarily off during the migration to @cloudflare/oxlint-config.
    'eqeqeq': 'off',
    'import/consistent-type-specifier-style': 'off',
    'no-empty': 'off',
    'quality/no-array-filter-map': 'off',
    'quality/no-known-value-widening': 'off',
    'typescript/array-type': 'off',
    'typescript/no-non-null-assertion': 'off',
    'typescript/no-unsafe-return': 'off',
    'unicorn/consistent-function-scoping': 'off',
    'unicorn/numeric-separators-style': 'off',
    'unicorn/prefer-single-call': 'off',
    'unicorn/prefer-string-replace-all': 'off',
  },
  overrides: [
    {
      // Astro provides `Astro` as a global in component frontmatter.
      files: ['**/*.astro'],
      globals: { Astro: 'readonly' },
    },
  ],
});
