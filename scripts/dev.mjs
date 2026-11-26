import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const execDir = path.dirname(process.execPath);
const childEnv = {
  ...process.env,
  PATH: `${execDir}${path.delimiter}${process.env.PATH || ''}`,
};

const children = [];
let shuttingDown = false;

function startTier(name, prefixDir, args) {
  const child = spawn(npmCmd, ['--prefix', path.join(rootDir, prefixDir), ...args], {
    stdio: 'inherit',
    shell: isWin,
    env: childEnv,
  });

  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      shuttingDown = true;
      for (const proc of children) {
        if (proc !== child && !proc.killed) {
          proc.kill('SIGTERM');
        }
      }
      if (code && code !== 0) {
        console.error(`[${name}] exited with code ${code}`);
        process.exit(code);
      } else if (signal) {
        process.exit(0);
      }
    }
  });

  children.push(child);
  return child;
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startTier('backend', 'backend', ['run', 'dev']);
startTier('frontend', 'frontend', ['run', 'dev']);
