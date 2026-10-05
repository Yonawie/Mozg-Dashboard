import { useState, useEffect } from 'react';
import { Bot, Send, Bell, Clock, MessageSquare, Shield, Wifi, WifiOff, Settings as SettingsIcon, FileText } from 'lucide-react';
import { getSetting, setSetting } from '../../services/api';

const BOT_COMMANDS = [
  { cmd: '/расписание', desc: 'Расписание на сегодня', icon: '📅' },
  { cmd: '/погода', desc: 'Погода во Владивостоке', icon: '🌤️' },
  { cmd: '/дети', desc: 'Кол-во записанных детей', icon: '👦' },
  { cmd: '/курсы', desc: 'Список активных курсов', icon: '🎓' },
  { cmd: '/проекты', desc: 'Последние проекты GitHub', icon: '💻' },
  { cmd: '/заметка [текст]', desc: 'Сохранить заметку в Мозг', icon: '📝' },
  { cmd: '/спроси [вопрос]', desc: 'Задать вопрос Khoj / Gemini', icon: '🧠' },
  { cmd: '/запусти [app]', desc: 'Запустить приложение на ПК', icon: '🖥️' },
  { cmd: '/отчёт', desc: 'Сгенерировать отчёт по смене', icon: '📊' },
];

const AUTO_FEATURES = [
  { name: 'Ежедневная сводка', desc: 'Бот присылает итоги дня в 21:00', icon: '📊', enabled: true },
  { name: 'Напоминания', desc: 'За 15 мин до каждого урока', icon: '🔔', enabled: true },
  { name: 'AI-новости', desc: 'Утренняя новость из мира AI', icon: '🗞️', enabled: false },
];

export default function TelegramView() {
  const [botToken, setBotToken] = useState('');
  const [botStatus, setBotStatus] = useState('offline'); // online | offline | checking
  const [chatPreview, setChatPreview] = useState([
    { from: 'user', text: '/расписание' },
    { from: 'bot', text: '📅 Сегодня, 31 июля:\n\n09:00 — ИИ Лаборатория (Группа 3)\n11:00 — ИИ Лаборатория (Группа 5)\n16:00 — ИИ Лаборатория (Группа 7)' },
    { from: 'user', text: '/погода' },
    { from: 'bot', text: '🌤️ Владивосток: +24°C, облачно\nВетер: 5 м/с | Влажность: 72%' },
    { from: 'user', text: '/заметка Группа 3 отлично справилась с CSS' },
    { from: 'bot', text: '✅ Заметка сохранена в дневник Смены 8, день 17' },
  ]);
  const [features, setFeatures] = useState(AUTO_FEATURES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const token = await getSetting('telegramBotToken', '');
    setBotToken(token);
    if (token) setBotStatus('online');
  }

  async function handleSave() {
    setSaving(true);
    await setSetting('telegramBotToken', botToken);
    setBotStatus(botToken ? 'online' : 'offline');
    setTimeout(() => setSaving(false), 800);
  }

  function toggleFeature(index) {
    setFeatures(prev => prev.map((f, i) => i === index ? { ...f, enabled: !f.enabled } : f));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Status Bar */}
      <div className="glass-panel" style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #2AABEE, #1a8ad4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Bot size={28} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Telegram-бот «Мозг»</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: botStatus === 'online' ? 'var(--accent-green)' : botStatus === 'checking' ? 'var(--accent-orange)' : 'var(--accent-red)',
                boxShadow: botStatus === 'online' ? '0 0 8px var(--accent-green)' : 'none'
              }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {botStatus === 'online' ? 'Бот активен' : botStatus === 'checking' ? 'Проверка...' : 'Бот не подключён'}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            className="input-field"
            type="password"
            value={botToken}
            onChange={e => setBotToken(e.target.value)}
            placeholder="Telegram Bot Token от @BotFather"
            style={{ width: '300px', fontSize: '0.85rem' }}
          />
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '✅' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Chat Preview */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} /> Превью чата
          </h3>
          <div style={{
            flex: 1, background: '#0c1020', borderRadius: 'var(--radius-sm)',
            padding: '16px', overflowY: 'auto', maxHeight: '400px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {chatPreview.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: '12px',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg, #2AABEE, #1a8ad4)'
                    : 'rgba(255,255,255,0.06)',
                  color: msg.from === 'user' ? 'white' : 'var(--text-main)',
                  fontSize: '0.85rem', lineHeight: '1.4', whiteSpace: 'pre-line'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commands List */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} /> Команды бота
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {BOT_COMMANDS.map((cmd, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.03)',
                transition: 'background 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <span style={{ fontSize: '1.2rem' }}>{cmd.icon}</span>
                <div style={{ flex: 1 }}>
                  <code style={{
                    color: 'var(--primary)', fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)', fontWeight: 500
                  }}>{cmd.cmd}</code>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>{cmd.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto Features */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} /> Автоматические функции
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-panel"
              onClick={() => toggleFeature(i)}
              style={{
                padding: '18px', cursor: 'pointer',
                borderColor: feature.enabled ? 'rgba(0,240,255,0.3)' : 'var(--border-color)',
                background: feature.enabled ? 'rgba(0,240,255,0.05)' : 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                <div style={{
                  width: '40px', height: '22px', borderRadius: '11px',
                  background: feature.enabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  padding: '2px', transition: 'background 0.3s', position: 'relative'
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'white',
                    transform: feature.enabled ? 'translateX(18px)' : 'translateX(0)',
                    transition: 'transform 0.3s'
                  }} />
                </div>
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                {feature.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Info */}
      {!botToken && (
        <div className="glass-panel" style={{ padding: '24px', borderColor: 'rgba(255,153,0,0.3)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} /> Как подключить бота
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.8' }}>
            <li>Откройте <a href="https://t.me/BotFather" target="_blank" style={{ color: 'var(--primary)' }}>@BotFather</a> в Telegram</li>
            <li>Отправьте команду <code style={{ color: 'var(--primary)' }}>/newbot</code></li>
            <li>Назовите бота, например: <strong>Mozg Brain Bot</strong></li>
            <li>Скопируйте полученный токен и вставьте выше</li>
            <li>Нажмите «Сохранить» — бот активируется автоматически</li>
          </ol>
        </div>
      )}
    </div>
  );
}
