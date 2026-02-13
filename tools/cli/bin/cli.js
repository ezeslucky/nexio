import { spawnSync } from 'node:child_process';

spawnSync('yarn', ['r', 'nexio.ts', ...process.argv.slice(2)], {
  stdio: 'inherit',
});
