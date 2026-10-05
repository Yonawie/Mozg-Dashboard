import React, { useState, useEffect } from 'react';
import { Settings, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { getSetting, setSetting } from '../../services/api';

export default function ScheduleView() {
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const url = await getSetting('googleSheetsUrl', '');
    if (url) {
      setGoogleSheetsUrl(url);
      setInputUrl(url);
    }
    setLoading(false);
  }

  async function saveUrl() {
    const url = inputUrl.trim();
    if (!url) return;
    await setSetting('googleSheetsUrl', url);
    setGoogleSheetsUrl(url);
    setShowSettings(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function getEmbedUrl(url) {
    // Convert Google Sheets edit URL to embed URL
    try {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `https://docs.google.com/spreadsheets/d/${match[1]}/htmlembed?widget=true&headers=false`;
      }
    } catch {}
    return url.replace('/edit', '/htmlembed');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {saved && (
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', animation: 'fadeIn 0.3s ease' }}>
              ✅ Сохранено!
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {googleSheetsUrl && (
            <a
              href={googleSheetsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={16} /> Открыть в Google
            </a>
          )}
          <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={16} /> {showSettings ? 'Скрыть' : 'Настройки'}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {(showSettings || !googleSheetsUrl) && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--text-main)' }}>
            📅 Подключение Google Таблицы
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Вставьте ссылку на вашу Google-таблицу с расписанием. Таблица должна быть доступна по ссылке (Файл → Поделиться → «Все, у кого есть ссылка»).
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              className="input-field"
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              style={{ flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && saveUrl()}
            />
            <button className="btn btn-primary" onClick={saveUrl}>
              Сохранить
            </button>
          </div>
          {googleSheetsUrl && (
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Текущая: {googleSheetsUrl.substring(0, 70)}...
            </div>
          )}
        </div>
      )}

      {/* Google Sheets Embed */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <RefreshCw size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div style={{ color: 'var(--text-muted)' }}>Загрузка...</div>
        </div>
      ) : googleSheetsUrl ? (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <iframe
            src={getEmbedUrl(googleSheetsUrl)}
            width="100%"
            height="700"
            style={{ border: 'none', display: 'block' }}
            title="Расписание"
          />
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <Calendar size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px' }}>Расписание не подключено</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Вставьте ссылку на Google-таблицу выше, чтобы увидеть план-сетку
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
