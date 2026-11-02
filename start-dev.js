const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting NovaReserve in Concurrent Development Mode...\n');

const server = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\n🛑 Shutting down NovaReserve services...');
  server.kill();
  client.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
