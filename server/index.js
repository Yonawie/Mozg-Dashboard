import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import os from 'os';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3777;

// Create Knowledge Base directory if it doesn't exist
const KNOWLEDGE_DIR = 'C:\\Mozg\\Knowledge_Base';
if (!fs.existsSync(KNOWLEDGE_DIR)) {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, KNOWLEDGE_DIR);
  },
  filename: (req, file, cb) => {
    // Keep original filename but ensure it's safe (could add timestamp to prevent overwrite)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/api/files', express.static(KNOWLEDGE_DIR)); // Serve uploaded files

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size
  });
});

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
