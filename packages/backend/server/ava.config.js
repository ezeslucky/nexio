const newE2E = process.env.TEST_MODE === 'e2e';
const newE2ETests = './src/__tests__/e2e/**/*.spec.ts';

const preludes = [new URL('./src/prelude.ts', import.meta.url).href];

if (newE2E) {
  preludes.push(new URL('./src/__tests__/e2e/prelude.ts', import.meta.url).href);
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
    DEPLOYMENT_TYPE: 'affine',
    MAILER_HOST: '0.0.0.0',
    MAILER_PORT: '1025',
    MAILER_USER: 'patraabhimanyu888@gmail.com',
    MAILER_PASSWORD: 'affine',
    MAILER_SENDER: 'patraabhimanyu888@gmail.com',
  },
};
