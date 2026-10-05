import React, { useState, useEffect } from 'react';
import { getSetting, setSetting } from '../../services/api';
import { User, Key, Brain, Calendar, MonitorPlay, Save, Eye, EyeOff, ExternalLink } from 'lucide-react';

export default function SettingsView() {
  const [settings, setSettings] = useState({
    profileName: 'Даша',
    profileCity: 'Владивосток, Емар',
    geminiKey: '',
    githubToken: '',
    githubUsername: 'Yonawie',
    khojUrl: 'http://localhost:42110',
    mozgPath: 'C:\\Users\\Dasha\\MOZG',
    googleSheetsUrl: '',
    telegramBotToken: '',
    cursorPath: '',
    antigravityPath: ''
  });

  const [khojStatus, setKhojStatus] = useState('checking');
  const [showPwd, setShowPwd] = useState({ gemini: false, github: false });
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadSettings() {
      const keys = Object.keys(settings);
      const loaded = { ...settings };
      for (const k of keys) {
        const val = await getSetting(k);
        if (val !== undefined && val !== null) {
          loaded[k] = val;
        }
      }
      setSettings(loaded);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    setKhojStatus('checking');
    fetch(`${settings.khojUrl}/api/health`)
      .then(res => setKhojStatus(res.ok ? 'ok' : 'error'))
      .catch(() => setKhojStatus('error'));
  }, [settings.khojUrl]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (keysToSave) => {
    try {
      for (const k of keysToSave) {
        await setSetting(k, settings[k]);
      }
      setToast('Настройки сохранены!');
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      console.error(e);
      setToast('Ошибка сохранения');
    }
  };

  const InputField = ({ label, type = 'text', value, onChange, placeholder, extra }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
      <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
        {label}
        {extra && <span>{extra}</span>}
      </label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
        style={{ width: '100%' }}
      />
    </div>
  );

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '20px' }}>Настройки</h2>
      
      {toast && (
        <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--accent-green)', color: '#000', padding: '10px 20px', borderRadius: 'var(--radius-sm)', zIndex: 1000 }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <User size={20} /> 👤 Профиль
          </h3>
          <InputField label="Имя" value={settings.profileName} onChange={v => handleChange('profileName', v)} />
          <InputField label="Город" value={settings.profileCity} onChange={v => handleChange('profileCity', v)} />
          <button className="btn btn-secondary" onClick={() => handleSave(['profileName', 'profileCity'])}><Save size={16}/> Сохранить</button>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)' }}>
            <Key size={20} /> 🔑 API ключи
          </h3>
          
          <div style={{ position: 'relative' }}>
            <InputField label="Gemini API Key" type={showPwd.gemini ? 'text' : 'password'} value={settings.geminiKey} onChange={v => handleChange('geminiKey', v)} />
            <button onClick={() => setShowPwd(p => ({...p, gemini: !p.gemini}))} style={{ position: 'absolute', right: '10px', top: '30px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPwd.gemini ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <InputField 
              label="GitHub Token (PAT)" 
              type={showPwd.github ? 'text' : 'password'} 
              value={settings.githubToken} 
              onChange={v => handleChange('githubToken', v)} 
              extra={<a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Создать <ExternalLink size={12}/></a>}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '-10px', marginBottom: '10px' }}>Нужен для доступа к приватным репозиториям</p>
            <button onClick={() => setShowPwd(p => ({...p, github: !p.github}))} style={{ position: 'absolute', right: '10px', top: '30px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPwd.github ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>

          <InputField label="GitHub Username" value={settings.githubUsername} onChange={v => handleChange('githubUsername', v)} />
          <button className="btn btn-secondary" onClick={() => handleSave(['geminiKey', 'githubToken', 'githubUsername'])}><Save size={16}/> Сохранить</button>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)' }}>
            <Brain size={20} /> 🧠 Khoj AI
          </h3>
          <InputField 
            label="URL сервера" 
            value={settings.khojUrl} 
            onChange={v => handleChange('khojUrl', v)} 
            extra={
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                Статус: 
                <span style={{ 
                  display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', 
                  background: khojStatus === 'ok' ? 'var(--accent-green)' : khojStatus === 'error' ? 'var(--accent-red)' : 'yellow' 
                }}></span>
              </span>
            }
          />
          <InputField label="Путь к данным MOZG" value={settings.mozgPath} onChange={v => handleChange('mozgPath', v)} />
          <button className="btn btn-secondary" onClick={() => handleSave(['khojUrl', 'mozgPath'])}><Save size={16}/> Сохранить</button>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)' }}>
            <Calendar size={20} /> 📅 Интеграции
          </h3>
          <InputField label="Google Sheets URL" value={settings.googleSheetsUrl} onChange={v => handleChange('googleSheetsUrl', v)} />
          <InputField label="Telegram Bot Token" value={settings.telegramBotToken} onChange={v => handleChange('telegramBotToken', v)} />
          <button className="btn btn-secondary" onClick={() => handleSave(['googleSheetsUrl', 'telegramBotToken'])}><Save size={16}/> Сохранить</button>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff3366' }}>
            <MonitorPlay size={20} /> 🖥️ Приложения
          </h3>
          <InputField label="Cursor path" value={settings.cursorPath} onChange={v => handleChange('cursorPath', v)} />
          <InputField label="Antigravity path" value={settings.antigravityPath} onChange={v => handleChange('antigravityPath', v)} />
          <button className="btn btn-secondary" onClick={() => handleSave(['cursorPath', 'antigravityPath'])}><Save size={16}/> Сохранить</button>
        </div>

      </div>
    </div>
  );
}
