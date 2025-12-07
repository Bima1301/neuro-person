//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    ignores: ['.output/**'],
    rules: {
      // Matikan warning "Unnecessary conditional, value is always truthy"
      '@typescript-eslint/no-unnecessary-condition': 'off',
      // Matikan warning "Unnecessary optional chain on a non-nullish value"
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
]
