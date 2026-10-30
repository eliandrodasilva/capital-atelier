import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '..', 'backend');
const isWindows = process.platform === 'win32';

const command = isWindows ? (process.env.ComSpec || 'cmd.exe') : './mvnw';
const args = isWindows
  ? ['/d', '/s', '/c', path.join(backendDir, 'mvnw.cmd'), ...process.argv.slice(2)]
  : process.argv.slice(2);

const child = spawn(command, args, {
  cwd: backendDir,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
