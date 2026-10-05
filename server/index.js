import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import os from 'os';

const app = express();
const PORT = 3777;

app.use(cors());
app.use(express.json());

// App launch paths
const APP_PATHS = {
  cursor: 'cursor',
  antigravity: 'C:\\Users\\Dasha\\.gemini\\antigravity\\bin\\antigravity.exe',
  codex: 'codex',
  chrome: 'start chrome',
  telegram: 'start telegram',
  explorer: 'explorer',
  notepad: 'notepad'
};

// Launch app
app.post('/api/launch', (req, res) => {
  const { app: appName, args = '' } = req.body;
  const cmd = APP_PATHS[appName?.toLowerCase()];
  if (!cmd) {
    return res.json({ success: false, error: `Unknown app: ${appName}` });
  }
  exec(`${cmd} ${args}`, (error) => {
    if (error) {
      return res.json({ success: false, error: error.message });
    }
    res.json({ success: true, app: appName });
  });
});

// Execute command
app.post('/api/exec', (req, res) => {
  const { command } = req.body;
  if (!command) return res.json({ success: false, error: 'No command' });
  
  exec(command, { shell: 'powershell.exe', timeout: 30000 }, (error, stdout, stderr) => {
    res.json({
      success: !error,
      stdout: stdout?.toString() || '',
      stderr: stderr?.toString() || '',
      error: error?.message
    });
  });
});

// System info
app.get('/api/system', (req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    uptime: os.uptime(),
    cpuModel: cpus[0]?.model || 'Unknown',
    cpuCores: cpus.length,
    totalMemoryGB: (totalMem / 1073741824).toFixed(1),
    freeMemoryGB: (freeMem / 1073741824).toFixed(1),
    usedMemoryPercent: ((1 - freeMem / totalMem) * 100).toFixed(0)
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🧠 Mozg PC Control Server running on http://localhost:${PORT}`);
});
