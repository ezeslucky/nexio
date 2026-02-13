const newE2E = process.env.TEST_MODE === 'e2e';
const newE2ETests = './src/__tests__/e2e/**/*.spec.ts';

const preludes = ['./src/prelude.ts'];

if (newE2E) {
  preludes.push('./src/__tests__/e2e/prelude.ts');
}

export default {
  timeout: '1m',
  extensions: {
    ts: 'module',
  },
  watchMode: {
    ignoreChanges: ['**/*.gen.*'],
  },
  files: newE2E
    ? [newE2ETests]
    : ['**/*.spec.ts', '**/*.e2e.ts', '!' + newE2ETests],
  require: preludes,
  environmentVariables: {
    NODE_ENV: 'test',
    DEPLOYMENT_TYPE: 'nexio',
    MAILER_HOST: '0.0.0.0',
    MAILER_PORT: '1025',
    MAILER_USER: 'aurobindolife888@gmail.com',
    MAILER_PASSWORD: 'nexio',
    MAILER_SENDER: 'aurobindolife888@gmail.com',
  },
};
