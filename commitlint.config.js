module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert', 'security'],
    ],
    'scope-enum': [
      2,
      'always',
      ['auth', 'users', 'products', 'categories', 'orders', 'payments', 'cart', 'wishlist', 'reviews', 'notifications', 'analytics', 'admin', 'ui', 'api', 'db', 'infra', 'deps', 'config', 'shared'],
    ],
    'subject-max-length': [2, 'always', 100],
  },
};
