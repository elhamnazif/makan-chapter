import cloudflare from '@cloudflare/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [cloudflare],
  env: cloudflare.env,
  ignorePatterns: cloudflare.ignorePatterns,
  rules: {
    // Temporarily off during the migration to @cloudflare/oxlint-config.
    'typescript/no-non-null-assertion': 'off',
  },
  overrides: [
    {
      // Astro provides `Astro` as a global in component frontmatter.
      files: ['**/*.astro'],
      globals: { Astro: 'readonly' },
    },
  ],
});
