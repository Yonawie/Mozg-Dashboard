import { useState, useEffect } from 'react';
import { Monitor, Terminal, Cpu, HardDrive, Play, Zap, RefreshCw, ChevronRight, Rocket, BookOpen, Globe, MessageSquare, FolderOpen } from 'lucide-react';
import { launchApp, runCommand, getSystemInfo } from '../../services/api';

const APPS = [
  { id: 'cursor', name: 'Cursor IDE', icon: '🖥️', desc: 'Основная среда разработки', color: '#00f0ff' },
  { id: 'antigravity', name: 'Antigravity', icon: '🧠', desc: 'AI-ассистент разработки', color: '#7c3aed' },
  { id: 'codex', name: 'Codex CLI', icon: '⚙️', desc: 'Терминальный AI-агент', color: '#00ff88' },
  { id: 'chrome', name: 'Google Chrome', icon: '🌐', desc: 'Браузер', color: '#4285f4' },
  { id: 'telegram', name: 'Telegram', icon: '💬', desc: 'Мессенджер', color: '#2AABEE' },
  { id: 'explorer', name: 'Проводник', icon: '📁', desc: 'Файловый менеджер', color: '#ff9900' },
];

const LESSON_MACRO = [
  { app: 'cursor', label: 'Cursor IDE' },
  { app: 'chrome', label: 'Google Chrome' },
];

export default function PcControlView() {
  const [sysInfo, setSysInfo] = useState(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [launching, setLaunching] = useState(null);
  const [lessonStarting, setLessonStarting] = useState(false);

  useEffect(() => {
    loadSystemInfo();
    const interval = setInterval(loadSystemInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadSystemInfo() {
    const info = await getSystemInfo();
    if (!info.error) setSysInfo(info);
  }

  async function handleLaunch(appId) {
    setLaunching(appId);
    const result = await launchApp(appId);
    setTerminalOutput(prev => [...prev, {
      type: result.success ? 'success' : 'error',
      text: result.success ? `✅ ${appId} запущен` : `❌ Ошибка: ${result.error}`,
      time: new Date().toLocaleTimeString('ru')
    }]);
    setTimeout(() => setLaunching(null), 1000);
  }

  async function handleStartLesson() {
    setLessonStarting(true);
    for (const step of LESSON_MACRO) {
      await launchApp(step.app);
      setTerminalOutput(prev => [...prev, {
        type: 'success',
        text: `✅ ${step.label} запущен`,
        time: new Date().toLocaleTimeString('ru')
      }]);
      await new Promise(r => setTimeout(r, 1500));
    }
    setTerminalOutput(prev => [...prev, {
      type: 'info',
      text: '🎬 Все приложения для урока запущены!',
      time: new Date().toLocaleTimeString('ru')
    }]);
    setLessonStarting(false);
  }

  async function handleCommand(e) {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalInput('');
    setTerminalOutput(prev => [...prev, {
      type: 'cmd',
      text: `> ${cmd}`,
      time: new Date().toLocaleTimeString('ru')
    }]);
    const result = await runCommand(cmd);
    setTerminalOutput(prev => [...prev, {
      type: result.success ? 'output' : 'error',
      text: result.stdout || result.stderr || result.error || 'Нет вывода',
      time: new Date().toLocaleTimeString('ru')
    }]);
  }

  const memPercent = sysInfo ? parseInt(sysInfo.usedMemoryPercent) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Lesson Start Button */}
      <div className="glass-panel-glow" style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #00f0ff, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
          }}>🎬</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Начать урок</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Одним кликом: Cursor + Chrome + Таймер
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleStartLesson}
          disabled={lessonStarting}
          style={{ fontSize: '1rem', padding: '12px 28px' }}
        >
          <Rocket size={18} />
          {lessonStarting ? 'Запускаем...' : 'Запустить всё'}
        </button>
      </div>

      {/* Apps Grid + System Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Apps Grid */}
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <Play size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Быстрый запуск
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {APPS.map(app => (
              <button
                key={app.id}
                className="glass-panel"
                onClick={() => handleLaunch(app.id)}
                disabled={launching === app.id}
                style={{
                  padding: '20px', cursor: 'pointer', border: '1px solid var(--border-color)',
                  textAlign: 'left', background: launching === app.id ? 'rgba(0,240,255,0.08)' : 'var(--bg-card)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = app.color;
                  e.currentTarget.style.boxShadow = `0 0 20px ${app.color}33`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{app.icon}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {app.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{app.desc}</div>
                {launching === app.id && (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: app.color }}>
                    <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite', marginRight: '4px' }} />
                    Запуск...
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* System Monitor */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} /> Система
          </h3>
          {sysInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>CPU</span>
                  <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {sysInfo.cpuCores} ядер
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>{sysInfo.cpuModel}</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>RAM</span>
                  <span style={{ color: memPercent > 80 ? 'var(--accent-red)' : 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                    {memPercent}%
                  </span>
                </div>
                <div style={{
                  width: '100%', height: '8px', borderRadius: '4px',
                  background: 'rgba(255,255,255,0.06)'
                }}>
                  <div style={{
                    width: `${memPercent}%`, height: '100%', borderRadius: '4px',
                    background: memPercent > 80
                      ? 'linear-gradient(90deg, var(--accent-orange), var(--accent-red))'
                      : 'linear-gradient(90deg, var(--accent-green), var(--primary))',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  <span>Исп.: {(sysInfo.totalMemoryGB - sysInfo.freeMemoryGB).toFixed(1)} ГБ</span>
                  <span>Всего: {sysInfo.totalMemoryGB} ГБ</span>
                </div>
              </div>
              <div style={{
                padding: '12px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.03)', fontSize: '0.78rem'
              }}>
                <div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>
                  <Monitor size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {sysInfo.hostname}
                </div>
                <div style={{ color: 'var(--text-dim)' }}>
                  <HardDrive size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {sysInfo.platform} / {sysInfo.arch}
                </div>
                <div style={{ color: 'var(--text-dim)', marginTop: '4px' }}>
                  Uptime: {Math.floor(sysInfo.uptime / 3600)}ч {Math.floor((sysInfo.uptime % 3600) / 60)}мин
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
              <div>Загрузка...</div>
            </div>
          )}
        </div>
      </div>

      {/* Terminal */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} /> Терминал
        </h3>
        <div style={{
          background: '#0a0c18', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)', minHeight: '200px', maxHeight: '350px',
          overflowY: 'auto', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
          marginBottom: '12px'
        }}>
          {terminalOutput.length === 0 ? (
            <div style={{ color: 'var(--text-dim)' }}>PS C:\&gt; Введите команду...</div>
          ) : (
            terminalOutput.map((line, i) => (
              <div key={i} style={{
                color: line.type === 'error' ? 'var(--accent-red)' :
                       line.type === 'success' ? 'var(--accent-green)' :
                       line.type === 'cmd' ? 'var(--primary)' :
                       line.type === 'info' ? '#ffd700' : 'var(--text-muted)',
                marginBottom: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
              }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginRight: '8px' }}>[{line.time}]</span>
                {line.text}
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleCommand} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem'
            }}>PS&gt;</span>
            <input
              className="input-field"
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              placeholder="Введите команду PowerShell..."
              style={{ paddingLeft: '42px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <ChevronRight size={18} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
